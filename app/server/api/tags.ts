import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { tagRepo, bookTagRepo } from "../db/repositories";
import { authMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import {
  createTagSchema,
  updateTagSchema,
  tagIdSchema,
  addTagToBookSchema,
  bookIdSchema,
} from "./schemas";
import type { CreateTagInput, UpdateTagInput, AddTagToBookInput } from "./schemas/tag";
import { toTagInput, toTagResponse } from "../lib/mapper";
import { successResponse } from "../lib/response";

const app = new Hono<HonoContext>();

// 認証ミドルウェア適用
app.use("*", authMiddleware);

/**
 * タグ一覧取得
 * GET /api/tags
 */
app.get("/", async (c) => {
  const userId = c.get("userId");
  const tags = await tagRepo.findByUserId(c.env.DB, userId);

  return successResponse(c, tags.map(toTagResponse));
});

/**
 * タグ作成
 * POST /api/tags
 */
app.post("/", validator("json", createTagSchema), async (c) => {
  const userId = c.get("userId");
  const data = getValidated<CreateTagInput>(c, "json");

  const tagInput = toTagInput(data, userId);
  const tag = await tagRepo.create(c.env.DB, tagInput);

  return successResponse(c, toTagResponse(tag), 201);
});

/**
 * タグ更新
 * PUT /api/tags/:id
 */
app.put(
  "/:id",
  validator("param", tagIdSchema),
  validator("json", updateTagSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id } = getValidated<{ id: string }>(c, "param");
    const data = getValidated<UpdateTagInput>(c, "json");

    const tag = await tagRepo.update(c.env.DB, id, userId, data.name);

    return successResponse(c, toTagResponse(tag));
  }
);

/**
 * タグ削除
 * DELETE /api/tags/:id
 */
app.delete("/:id", validator("param", tagIdSchema), async (c) => {
  const userId = c.get("userId");
  const { id } = getValidated<{ id: string }>(c, "param");

  await tagRepo.deleteById(c.env.DB, id, userId);

  return successResponse(c, { deleted: true });
});

/**
 * 書籍にタグを追加
 * POST /api/tags/books/:bookId
 */
app.post(
  "/books/:bookId",
  validator("param", bookIdSchema),
  validator("json", addTagToBookSchema),
  async (c) => {
    const userId = c.get("userId");
    const { id: bookId } = getValidated<{ id: string }>(c, "param");
    const { tagId } = getValidated<AddTagToBookInput>(c, "json");

    await bookTagRepo.addTagToBook(c.env.DB, bookId, tagId, userId);

    return successResponse(c, { added: true }, 201);
  }
);

/**
 * 書籍からタグを削除
 * DELETE /api/tags/books/:bookId/:tagId
 */
app.delete("/books/:bookId/:tagId", async (c) => {
  const userId = c.get("userId");
  const bookId = c.req.param("bookId");
  const tagId = c.req.param("tagId");

  await bookTagRepo.removeTagFromBook(c.env.DB, bookId, tagId, userId);

  return successResponse(c, { removed: true });
});

/**
 * 書籍のタグ一覧取得
 * GET /api/tags/books/:bookId
 */
app.get("/books/:bookId", async (c) => {
  const userId = c.get("userId");
  const bookId = c.req.param("bookId");

  const tags = await bookTagRepo.findTagsByBookId(c.env.DB, bookId);

  return successResponse(c, tags.map(toTagResponse));
});

export default app;

