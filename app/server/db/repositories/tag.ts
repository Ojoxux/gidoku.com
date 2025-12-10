import type { D1Database } from "@cloudflare/workers-types";
import type { Tag, TagInput } from "../../../types/database";
import { NotFoundError, DatabaseError } from "../../lib/errors";

/**
 * ユーザーのタグ一覧を取得
 */
export async function findByUserId(
  db: D1Database,
  userId: string
): Promise<Tag[]> {
  try {
    const result = await db
      .prepare("SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC")
      .bind(userId)
      .all<Tag>();

    return result.results || [];
  } catch (error) {
    throw new DatabaseError("Failed to fetch tags", error);
  }
}

/**
 * IDでタグを取得
 */
export async function findById(
  db: D1Database,
  tagId: string,
  userId: string
): Promise<Tag> {
  try {
    const result = await db
      .prepare("SELECT * FROM tags WHERE id = ? AND user_id = ?")
      .bind(tagId, userId)
      .first<Tag>();

    if (!result) {
      throw new NotFoundError("Tag not found");
    }

    return result;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch tag", error);
  }
}

/**
 * 名前でタグを取得
 */
export async function findByName(
  db: D1Database,
  name: string,
  userId: string
): Promise<Tag | null> {
  try {
    const result = await db
      .prepare("SELECT * FROM tags WHERE name = ? AND user_id = ?")
      .bind(name, userId)
      .first<Tag>();

    return result || null;
  } catch (error) {
    throw new DatabaseError("Failed to fetch tag by name", error);
  }
}

/**
 * 書籍に紐づくタグ一覧を取得
 */
export async function findByBookId(
  db: D1Database,
  bookId: string
): Promise<Tag[]> {
  try {
    const result = await db
      .prepare(
        `
        SELECT t.* FROM tags t
        INNER JOIN book_tags bt ON t.id = bt.tag_id
        WHERE bt.book_id = ?
        ORDER BY t.name ASC
      `
      )
      .bind(bookId)
      .all<Tag>();

    return result.results || [];
  } catch (error) {
    throw new DatabaseError("Failed to fetch tags by book", error);
  }
}

/**
 * タグを作成
 */
export async function create(db: D1Database, tag: TagInput): Promise<Tag> {
  try {
    // 同名タグの重複チェック
    const existing = await findByName(db, tag.name, tag.userId);
    if (existing) {
      throw new DatabaseError("Tag with this name already exists");
    }

    await db
      .prepare(
        `
        INSERT INTO tags (id, user_id, name, created_at)
        VALUES (?, ?, ?, ?)
      `
      )
      .bind(tag.id, tag.userId, tag.name, tag.createdAt)
      .run();

    return findById(db, tag.id, tag.userId);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError("Failed to create tag", error);
  }
}

/**
 * タグを更新
 */
export async function update(
  db: D1Database,
  tagId: string,
  userId: string,
  name: string
): Promise<Tag> {
  try {
    // タグの存在確認
    await findById(db, tagId, userId);

    // 同名タグの重複チェック
    const existing = await findByName(db, name, userId);
    if (existing && existing.id !== tagId) {
      throw new DatabaseError("Tag with this name already exists");
    }

    await db
      .prepare("UPDATE tags SET name = ? WHERE id = ? AND user_id = ?")
      .bind(name, tagId, userId)
      .run();

    return findById(db, tagId, userId);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError)
      throw error;
    throw new DatabaseError("Failed to update tag", error);
  }
}

/**
 * タグを削除
 */
export async function deleteById(
  db: D1Database,
  tagId: string,
  userId: string
): Promise<void> {
  try {
    // タグの存在確認
    await findById(db, tagId, userId);

    // CASCADE削除により関連するbook_tagsも削除される
    await db
      .prepare("DELETE FROM tags WHERE id = ? AND user_id = ?")
      .bind(tagId, userId)
      .run();
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to delete tag", error);
  }
}

/**
 * タグが特定のユーザーに属しているか確認
 */
export async function belongsToUser(
  db: D1Database,
  tagId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .prepare("SELECT id FROM tags WHERE id = ? AND user_id = ?")
      .bind(tagId, userId)
      .first();

    return result !== null;
  } catch (error) {
    throw new DatabaseError("Failed to check tag ownership", error);
  }
}
