import type { D1Database } from "@cloudflare/workers-types";
import type { BookTag, Tag } from "../../../types/database";
import { DatabaseError, NotFoundError, ForbiddenError } from "../../lib/errors";

/**
 * 書籍にタグを追加（所有権チェック付き）
 */
export async function addTagToBook(
  db: D1Database,
  bookId: string,
  tagId: string,
  userId: string
): Promise<void> {
  try {
    // 書籍の所有権チェック
    const book = await db
      .prepare("SELECT user_id FROM books WHERE id = ?")
      .bind(bookId)
      .first<{ user_id: string }>();

    if (!book) {
      throw new NotFoundError("Book not found");
    }
    if (book.user_id !== userId) {
      throw new ForbiddenError("You don't own this book");
    }

    // タグの所有権チェック
    const tag = await db
      .prepare("SELECT user_id FROM tags WHERE id = ?")
      .bind(tagId)
      .first<{ user_id: string }>();

    if (!tag) {
      throw new NotFoundError("Tag not found");
    }
    if (tag.user_id !== userId) {
      throw new ForbiddenError("You don't own this tag");
    }

    // 既に関連付けられているかチェック
    const existing = await isTagAttached(db, bookId, tagId);
    if (existing) {
      return; // 既に存在する場合は何もしない
    }

    await db
      .prepare(
        `
        INSERT INTO book_tags (book_id, tag_id)
        VALUES (?, ?)
      `
      )
      .bind(bookId, tagId)
      .run();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new DatabaseError("Failed to add tag to book", error);
  }
}

/**
 * 書籍からタグを削除（所有権チェック付き）
 */
export async function removeTagFromBook(
  db: D1Database,
  bookId: string,
  tagId: string,
  userId: string
): Promise<void> {
  try {
    // 書籍の所有権チェック
    const book = await db
      .prepare("SELECT user_id FROM books WHERE id = ?")
      .bind(bookId)
      .first<{ user_id: string }>();

    if (!book) {
      throw new NotFoundError("Book not found");
    }
    if (book.user_id !== userId) {
      throw new ForbiddenError("You don't own this book");
    }

    await db
      .prepare("DELETE FROM book_tags WHERE book_id = ? AND tag_id = ?")
      .bind(bookId, tagId)
      .run();
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }
    throw new DatabaseError("Failed to remove tag from book", error);
  }
}

/**
 * 書籍に紐づくタグ一覧を取得
 */
export async function findTagsByBookId(
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
 * 書籍の全タグを削除
 */
export async function removeAllTagsFromBook(
  db: D1Database,
  bookId: string
): Promise<void> {
  try {
    await db
      .prepare("DELETE FROM book_tags WHERE book_id = ?")
      .bind(bookId)
      .run();
  } catch (error) {
    throw new DatabaseError("Failed to remove all tags from book", error);
  }
}

/**
 * タグが書籍に紐づいているか確認
 */
export async function isTagAttached(
  db: D1Database,
  bookId: string,
  tagId: string
): Promise<boolean> {
  try {
    const result = await db
      .prepare("SELECT * FROM book_tags WHERE book_id = ? AND tag_id = ?")
      .bind(bookId, tagId)
      .first<BookTag>();

    return result !== null;
  } catch (error) {
    throw new DatabaseError("Failed to check tag attachment", error);
  }
}

/**
 * 書籍に紐づくタグの数を取得
 */
export async function countTagsByBook(
  db: D1Database,
  bookId: string
): Promise<number> {
  try {
    const result = await db
      .prepare("SELECT COUNT(*) as count FROM book_tags WHERE book_id = ?")
      .bind(bookId)
      .first<{ count: number }>();

    return result?.count || 0;
  } catch (error) {
    throw new DatabaseError("Failed to count tags", error);
  }
}

/**
 * タグに紐づく書籍の数を取得
 */
export async function countBooksByTag(
  db: D1Database,
  tagId: string
): Promise<number> {
  try {
    const result = await db
      .prepare("SELECT COUNT(*) as count FROM book_tags WHERE tag_id = ?")
      .bind(tagId)
      .first<{ count: number }>();

    return result?.count || 0;
  } catch (error) {
    throw new DatabaseError("Failed to count books", error);
  }
}

/**
 * 書籍のタグを一括更新（既存のタグを削除して新しいタグを追加）
 */
export async function updateBookTags(
  db: D1Database,
  bookId: string,
  tagIds: string[]
): Promise<void> {
  try {
    // 既存のタグを削除
    await removeAllTagsFromBook(db, bookId);

    // 新しいタグを追加
    if (tagIds.length > 0) {
      const statements = tagIds.map((tagId) =>
        db
          .prepare("INSERT INTO book_tags (book_id, tag_id) VALUES (?, ?)")
          .bind(bookId, tagId)
      );

      await db.batch(statements);
    }
  } catch (error) {
    throw new DatabaseError("Failed to update book tags", error);
  }
}
