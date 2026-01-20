import { regex, type } from "arktype";

/**
 * 予約済みユーザー名（衝突しそうだから）
 */
export const RESERVED_USERNAMES = [
  // 既存ルート
  "books",
  "login",
  "settings",
  "api",
  "auth",
  // 将来的に使う可能性のありそうなもの
  "admin",
  "help",
  "about",
  "terms",
  "privacy",
  "support",
  "contact",
  "search",
  "explore",
  "notifications",
  "messages",
  "profile",
  "null",
  "undefined",
  "root",
  "system",
] as const;

/**
 * ユーザー名が予約語かどうかチェック
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase() as typeof RESERVED_USERNAMES[number]);
}

/**
 * ユーザー名のパターン
 */
const usernamePattern = regex("^[a-zA-Z0-9\\-_]{3,30}$");

/**
 * ユーザープロフィール更新スキーマ
 */
export const updateUserSchema = type({
  "username?": usernamePattern,
  "name?": "1 <= string <= 100",
  "bio?": "string <= 500",
  "avatarUrl?": "string",
});

/**
 * ユーザー名検証スキーマ
 */
export const usernameSchema = type({
  username: usernamePattern,
});

// 型エクスポート
export type UpdateUserInput = typeof updateUserSchema.infer;
export type UsernameInput = typeof usernameSchema.infer;
