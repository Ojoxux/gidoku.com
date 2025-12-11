import { regex, type } from "arktype";

/**
 * タグ名のパターン（1-50文字、英数字・日本語・ハイフン・アンダースコア）
 */
const tagNamePattern = regex("^[a-zA-Z0-9ぁ-んァ-ヶー一-龠々\\-_]{1,50}$");

/**
 * UUID パターン
 */
const uuidPattern = regex(
  "^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
  "i"
);

/**
 * タグ作成スキーマ
 */
export const createTagSchema = type({
  name: tagNamePattern,
});

/**
 * タグ更新スキーマ
 */
export const updateTagSchema = type({
  name: tagNamePattern,
});

/**
 * タグID検証スキーマ
 */
export const tagIdSchema = type({
  id: uuidPattern,
});

/**
 * 書籍へのタグ追加スキーマ
 */
export const addTagToBookSchema = type({
  tagId: uuidPattern,
});

// 型エクスポート
export type CreateTagInput = typeof createTagSchema.infer;
export type UpdateTagInput = typeof updateTagSchema.infer;
export type AddTagToBookInput = typeof addTagToBookSchema.infer;
