import type {
  Book,
  BookInput,
  BookFilter,
  BookStats,
  BookStatus,
} from "../../../types/database";
import { NotFoundError, DatabaseError } from "../../lib/errors";

import type { Env } from "../../../types/env";

type D1Database = Env["DB"];

/**
 * ユーザーIDで書籍一覧を取得（ページネーション対応）
 */
export async function findByUserId(
  db: D1Database,
  userId: string,
  filter?: BookFilter & { limit?: number; offset?: number }
): Promise<{ books: Book[]; total: number }> {
  try {
    let query = "SELECT * FROM books WHERE user_id = ?";
    const params: any[] = [userId];

    // フィルター条件の追加
    if (filter?.status) {
      query += " AND status = ?";
      params.push(filter.status);
    }

    if (filter?.search) {
      query += " AND (title LIKE ? OR authors LIKE ?)";
      const searchTerm = `%${filter.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // ソート
    if (filter?.sortBy) {
      const sortMap = {
        title: "title ASC",
        created: "created_at DESC",
        updated: "updated_at DESC",
        progress: "current_page DESC",
      };
      query += ` ORDER BY ${sortMap[filter.sortBy] || "created_at DESC"}`;
    } else {
      query += " ORDER BY created_at DESC";
    }

    // 総数取得
    const countQuery = `SELECT COUNT(*) as total FROM books WHERE user_id = ?${
      filter?.status ? " AND status = ?" : ""
    }${filter?.search ? " AND (title LIKE ? OR authors LIKE ?)" : ""}`;
    const countParams = [userId];
    if (filter?.status) countParams.push(filter.status);
    if (filter?.search) {
      const searchTerm = `%${filter.search}%`;
      countParams.push(searchTerm, searchTerm);
    }

    const countResult = await db
      .prepare(countQuery)
      .bind(...countParams)
      .first<{ total: number }>();

    // ページネーション
    const limit = filter?.limit || 20;
    const offset = filter?.offset || 0;
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const result = await db
      .prepare(query)
      .bind(...params)
      .all<Book>();

    return {
      books: result.results || [],
      total: countResult?.total || 0,
    };
  } catch (error) {
    throw new DatabaseError("Failed to fetch books", error);
  }
}

/**
 * IDで書籍を取得
 */
export async function findById(
  db: D1Database,
  bookId: string,
  userId: string
): Promise<Book> {
  try {
    const result = await db
      .prepare("SELECT * FROM books WHERE id = ? AND user_id = ?")
      .bind(bookId, userId)
      .first<Book>();

    if (!result) {
      throw new NotFoundError("Book not found");
    }

    return result;
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to fetch book", error);
  }
}

/**
 * 書籍を作成
 */
export async function create(db: D1Database, book: BookInput): Promise<Book> {
  try {
    await db
      .prepare(
        `
        INSERT INTO books (
          id, user_id, rakuten_books_id, title, authors, publisher,
          published_date, isbn, page_count, description, thumbnail_url,
          rakuten_affiliate_url, status, current_page, memo, finished_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      )
      .bind(
        book.id,
        book.userId,
        book.rakutenBooksId || null,
        book.title,
        JSON.stringify(book.authors),
        book.publisher || null,
        book.publishedDate || null,
        book.isbn || null,
        book.pageCount || 0,
        book.description || null,
        book.thumbnailUrl || null,
        book.rakutenAffiliateUrl || null,
        book.status || "unread",
        book.currentPage || 0,
        book.memo || null,
        book.finishedAt || null,
        book.createdAt,
        book.updatedAt
      )
      .run();

    return findById(db, book.id, book.userId);
  } catch (error) {
    throw new DatabaseError("Failed to create book", error);
  }
}

/**
 * 書籍を更新
 */
export async function update(
  db: D1Database,
  bookId: string,
  userId: string,
  data: Partial<BookInput>
): Promise<Book> {
  try {
    // 書籍の存在確認
    await findById(db, bookId, userId);

    const fields: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      params.push(data.title);
    }
    if (data.authors !== undefined) {
      fields.push("authors = ?");
      params.push(JSON.stringify(data.authors));
    }
    if (data.publisher !== undefined) {
      fields.push("publisher = ?");
      params.push(data.publisher);
    }
    if (data.publishedDate !== undefined) {
      fields.push("published_date = ?");
      params.push(data.publishedDate);
    }
    if (data.isbn !== undefined) {
      fields.push("isbn = ?");
      params.push(data.isbn);
    }
    if (data.pageCount !== undefined) {
      fields.push("page_count = ?");
      params.push(data.pageCount);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      params.push(data.description);
    }
    if (data.thumbnailUrl !== undefined) {
      fields.push("thumbnail_url = ?");
      params.push(data.thumbnailUrl);
    }
    if (data.rakutenBooksId !== undefined) {
      fields.push("rakuten_books_id = ?");
      params.push(data.rakutenBooksId);
    }
    if (data.rakutenAffiliateUrl !== undefined) {
      fields.push("rakuten_affiliate_url = ?");
      params.push(data.rakutenAffiliateUrl);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      params.push(data.status);
    }
    if (data.currentPage !== undefined) {
      fields.push("current_page = ?");
      params.push(data.currentPage);
    }
    if (data.memo !== undefined) {
      fields.push("memo = ?");
      params.push(data.memo);
    }
    if (data.finishedAt !== undefined) {
      fields.push("finished_at = ?");
      params.push(data.finishedAt);
    }

    fields.push("updated_at = ?");
    params.push(data.updatedAt || new Date().toISOString());

    params.push(bookId, userId);

    await db
      .prepare(
        `
        UPDATE books 
        SET ${fields.join(", ")}
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(...params)
      .run();

    return findById(db, bookId, userId);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to update book", error);
  }
}

/**
 * 進捗を更新（純粋なデータ更新のみ）
 * ビジネスロジック（ステータス計算・バリデーション）はAPI層/Domain層で処理
 */
export async function updateProgress(
  db: D1Database,
  bookId: string,
  userId: string,
  currentPage: number,
  status: BookStatus
): Promise<Book> {
  try {
    // 書籍の存在確認
    await findById(db, bookId, userId);

    await db
      .prepare(
        `
        UPDATE books 
        SET current_page = ?, status = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `
      )
      .bind(currentPage, status, new Date().toISOString(), bookId, userId)
      .run();

    return findById(db, bookId, userId);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to update progress", error);
  }
}

/**
 * 書籍を削除（関連するタグも削除）
 */
export async function deleteById(
  db: D1Database,
  bookId: string,
  userId: string
): Promise<void> {
  try {
    // 書籍の存在確認
    await findById(db, bookId, userId);

    // トランザクション的に削除（D1のbatch機能を使用）
    await db.batch([
      db.prepare("DELETE FROM book_tags WHERE book_id = ?").bind(bookId),
      db
        .prepare("DELETE FROM books WHERE id = ? AND user_id = ?")
        .bind(bookId, userId),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) throw error;
    throw new DatabaseError("Failed to delete book", error);
  }
}

/**
 * ユーザーの統計情報を取得
 */
export async function getStats(
  db: D1Database,
  userId: string
): Promise<BookStats> {
  try {
    const result = await db
      .prepare(
        `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'reading' THEN 1 ELSE 0 END) as reading,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread
        FROM books 
        WHERE user_id = ?
      `
      )
      .bind(userId)
      .first<BookStats>();

    return (
      result || {
        total: 0,
        reading: 0,
        completed: 0,
        unread: 0,
      }
    );
  } catch (error) {
    throw new DatabaseError("Failed to fetch book stats", error);
  }
}

/**
 * 書籍が特定のユーザーに属しているか確認
 */
export async function belongsToUser(
  db: D1Database,
  bookId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .prepare("SELECT id FROM books WHERE id = ? AND user_id = ?")
      .bind(bookId, userId)
      .first();

    return result !== null;
  } catch (error) {
    throw new DatabaseError("Failed to check book ownership", error);
  }
}
