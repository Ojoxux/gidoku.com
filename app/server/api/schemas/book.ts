import { type } from "arktype";

/**
 * 書籍作成スキーマ
 */
export const createBookSchema = type({
  title: "1 <= string <= 500",
  authors: "(string >= 1)[] >= 1",
  "publisher?": "string",
  "publishedDate?": "string",
  "isbn?": "string",
  "pageCount?": "(number % 1) >= 0", // integer >= 0
  "description?": "string",
  "thumbnailUrl?": "string",
  "rakutenBooksId?": "string",
  "rakutenAffiliateUrl?": "string",
  "status?": "'unread' | 'reading' | 'completed'",
  "currentPage?": "(number % 1) >= 0",
  "memo?": "string",
});

/**
 * 書籍更新スキーマ（すべてのフィールドがオプショナル）
 */
export const updateBookSchema = type({
  "title?": "1 <= string <= 500",
  "authors?": "(string >= 1)[] >= 1",
  "publisher?": "string",
  "publishedDate?": "string",
  "isbn?": "string",
  "pageCount?": "(number % 1) >= 0",
  "description?": "string",
  "thumbnailUrl?": "string",
  "rakutenBooksId?": "string",
  "rakutenAffiliateUrl?": "string",
  "status?": "'unread' | 'reading' | 'completed'",
  "currentPage?": "(number % 1) >= 0",
  "memo?": "string",
  "finishedAt?": "string",
});

/**
 * 進捗更新スキーマ
 */
export const progressSchema = type({
  currentPage: "(number % 1) >= 0",
});

/**
 * 書籍検索・フィルタリングスキーマ
 */
export const bookFilterSchema = type({
  "status?": "'unread' | 'reading' | 'completed'",
  "search?": "string",
  "sortBy?": "'title' | 'created' | 'updated' | 'progress'",
  "limit?": "1 <= (number % 1) <= 100",
  "offset?": "(number % 1) >= 0",
});

/**
 * 書籍ID検証スキーマ
 */
export const bookIdSchema = type({
  id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
});

// 型エクスポート
export type CreateBookInput = typeof createBookSchema.infer;
export type UpdateBookInput = typeof updateBookSchema.infer;
export type ProgressInput = typeof progressSchema.infer;
export type BookFilterInput = typeof bookFilterSchema.infer;
