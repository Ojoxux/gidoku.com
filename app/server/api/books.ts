import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { bookRepo, bookTagRepo } from "../db/repositories";
import { authMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import {
  createBookSchema,
  updateBookSchema,
  progressSchema,
  bookFilterSchema,
  bookIdSchema,
} from "./schemas";
import type {
  CreateBookInput,
  UpdateBookInput,
  ProgressInput,
  BookFilterInput,
} from "./schemas/book";
import { toBookInput, toBookUpdateInput, toBookResponse } from "../lib/mapper";
import { bookDomain } from "../domain";
import { successResponse, paginatedResponse } from "../lib/response";
import { ValidationError } from "../lib/errors";

const app = new Hono<HonoContext>();

// 認証ミドルウェア適用
app.use("*", authMiddleware);

/**
 * 書籍一覧取得
 * GET /api/books
 */
app.get("/", validator("query", bookFilterSchema), async (c) => {
  const userId = c.get("userId");
  const filter = getValidated<BookFilterInput>(c, "query");

  const { books, total } = await bookRepo.findByUserId(c.env.DB, userId, {
    status: filter.status,
    search: filter.search,
    sortBy: filter.sortBy,
    limit: filter.limit ?? 20,
    offset: filter.offset ?? 0,
  });

  const items = books.map(toBookResponse);
  return paginatedResponse(
    c,
    items,
    total,
    filter.limit ?? 20,
    filter.offset ?? 0
  );
});

/**
 * 書籍詳細取得
 * GET /api/books/:id
 */
app.get("/:id", validator("param", bookIdSchema), async (c) => {
  const userId = c.get("userId");
  const { id } = getValidated<{ id: string }>(c, "param");

  const book = await bookRepo.findById(c.env.DB, id, userId);
  const tags = await bookTagRepo.findTagsByBookId(c.env.DB, id);

  return successResponse(c, {
    ...toBookResponse(book),
    tags,
  });
});

/**
 * 書籍登録
 * POST /api/books
 */
app.post("/", validator("json", createBookSchema), async (c) => {
  const userId = c.get("userId");
  const data = getValidated<CreateBookInput>(c, "json");

  const bookInput = toBookInput(data, userId);
  const book = await bookRepo.create(c.env.DB, bookInput);

  return successResponse(c, toBookResponse(book), 201);
});

/**
 * 書籍更新
 * PUT /api/books/:id
 */
app.put(
  "/:id",
  validator("param", bookIdSchema),
  validator("json", updateBookSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = getValidated<{ id: string }>(c, "param");
    const data = getValidated<UpdateBookInput>(c, "json");

    const updateData = toBookUpdateInput(data);
    const book = await bookRepo.update(c.env.DB, id, userId, updateData);

    return successResponse(c, toBookResponse(book));
  }
);

/**
 * 進捗更新
 * PATCH /api/books/:id/progress
 */
app.patch(
  "/:id/progress",
  validator("param", bookIdSchema),
  validator("json", progressSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = getValidated<{ id: string }>(c, "param");
    const { currentPage } = getValidated<ProgressInput>(c, "json");

    // 書籍を取得してページ数を検証
    const existingBook = await bookRepo.findById(c.env.DB, id, userId);
    const validation = bookDomain.validatePageProgress(
      currentPage,
      existingBook.page_count
    );

    if (!validation.valid) {
      throw new ValidationError(validation.error);
    }

    // ステータスを自動計算
    const newStatus = bookDomain.calculateStatus(
      currentPage,
      existingBook.page_count
    );

    // 読了日の設定
    const finishedAt = bookDomain.shouldSetFinishedAt(
      newStatus,
      existingBook.status
    )
      ? new Date().toISOString()
      : existingBook.finished_at;

    const book = await bookRepo.update(c.env.DB, id, userId, {
      currentPage,
      status: newStatus,
      finishedAt,
      updatedAt: new Date().toISOString(),
    });

    return successResponse(c, toBookResponse(book));
  }
);

/**
 * 書籍削除
 * DELETE /api/books/:id
 */
app.delete("/:id", validator("param", bookIdSchema), async (c) => {
  const userId = c.get("userId");
  const { id } = getValidated<{ id: string }>(c, "param");

  await bookRepo.deleteById(c.env.DB, id, userId);

  return successResponse(c, { deleted: true });
});

/**
 * 書籍統計取得
 * GET /api/books/stats
 */
app.get("/stats", async (c) => {
  const userId = c.get("userId");
  const stats = await bookRepo.getStats(c.env.DB, userId);

  return successResponse(c, stats);
});

export default app;
