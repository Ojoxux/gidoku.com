import { type } from "arktype";

/**
 * OAuth認証プロバイダー
 */
export const oauthProviderSchema = type("'github' | 'google'");

/**
 * OAuth コールバックスキーマ
 */
export const oauthCallbackSchema = type({
  code: "string >= 1",
  "state?": "string",
});

/**
 * 楽天書籍検索スキーマ
 */
export const rakutenSearchSchema = type({
  query: "1 <= string <= 100",
  "limit?": "1 <= (number % 1) <= 10",
  "page?": "1 <= (number % 1) <= 1000", // 追加
});

/**
 * ISBN検索スキーマ
 */
export const isbnSearchSchema = type({
  isbn: /^(?:\d{10}|\d{13})$/,
});

// 型エクスポート
export type OAuthProvider = typeof oauthProviderSchema.infer;
export type OAuthCallbackInput = typeof oauthCallbackSchema.infer;
export type RakutenSearchInput = typeof rakutenSearchSchema.infer;
export type IsbnSearchInput = typeof isbnSearchSchema.infer;
