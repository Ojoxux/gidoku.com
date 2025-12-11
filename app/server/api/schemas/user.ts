import { regex, type } from "arktype";

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
