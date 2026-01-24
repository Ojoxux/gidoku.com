import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { authMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import { rakutenSearchSchema, isbnSearchSchema } from "./schemas";
import type { RakutenSearchInput } from "./schemas/auth";
import { successResponse } from "../lib/response";
import { isValidISBN } from "../lib/validation";
import * as rakutenService from "../services/rakuten";
import { searchRateLimiter } from "../lib/rate-limit";

const app = new Hono<HonoContext>();

// 認証ミドルウェア適用
app.use("*", authMiddleware);

// 検索APIにRate Limiting適用（外部API呼び出しのため厳しめにする）
app.use("*", searchRateLimiter);

/**
 * 楽天ブックス検索
 * GET /api/search/books
 */
app.get("/books", validator("query", rakutenSearchSchema), async (c) => {

  // バリデーション済みのデータを取得
  const { query, limit, page } = getValidated<RakutenSearchInput>(c, "query");

  // queryがundefinedの場合はエラーを返す
  if (!query) {
    return c.json({ success: false, error: { message: "検索クエリが指定されていません" } }, 400);
  }

  const { results, hits, pageCount } = await rakutenService.searchBooks(
    query,
    c.env.RAKUTEN_APP_ID,
    limit ?? 20,
    page ?? 1
  );

  const sortedResults = rakutenService.sortByPublishedDateDesc(results);

  return successResponse(c, {
    results: sortedResults,
    hits,
    pageCount,
    currentPage: page ?? 1,
  });
});

/**
 * ISBN検索
 * GET /api/search/isbn/:isbn
 */
app.get("/isbn/:isbn", validator("param", isbnSearchSchema), async (c) => {
  const isbn = c.req.param("isbn");
  if (!isValidISBN(isbn)) {
    return c.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: "Invalid ISBN",
        },
      },
      400
    );
  }

  const result = await rakutenService.searchByISBN(isbn, c.env.RAKUTEN_APP_ID);

  if (!result) {
    return successResponse(c, null);
  }

  return successResponse(c, result);
});

export default app;
