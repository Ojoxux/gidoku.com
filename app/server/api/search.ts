import { Hono } from "hono";
import type { HonoContext } from "../../types/env";
import { authMiddleware } from "../lib/auth";
import { validator, getValidated } from "../lib/validator";
import { rakutenSearchSchema, isbnSearchSchema } from "./schemas";
import type { RakutenSearchInput, IsbnSearchInput } from "./schemas/auth";
import { successResponse } from "../lib/response";
import * as rakutenService from "../services/rakuten";

const app = new Hono<HonoContext>();

// 認証ミドルウェア適用
app.use("*", authMiddleware);

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

  const { results, hits, pageCount} = await rakutenService.searchBooks(
    query,
    c.env.RAKUTEN_APP_ID,
    limit ?? 20,
    page ?? 1
  );

  return successResponse(c, {
    results,
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
  const { isbn } = getValidated<IsbnSearchInput>(c, "param");

  const result = await rakutenService.searchByISBN(isbn, c.env.RAKUTEN_APP_ID);

  if (!result) {
    return successResponse(c, null);
  }

  return successResponse(c, result);
});

export default app;
