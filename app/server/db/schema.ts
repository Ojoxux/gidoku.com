import type { D1Database } from "@cloudflare/workers-types";

/**
 * 全テーブルを作成するSQL
 * 開発環境用（本番はマイグレーションファイルを使用）
 */
export const createTablesSQL = `
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 書籍テーブル
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rakuten_books_id TEXT,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  publisher TEXT,
  published_date TEXT,
  isbn TEXT,
  page_count INTEGER DEFAULT 0,
  description TEXT,
  thumbnail_url TEXT,
  rakuten_affiliate_url TEXT,
  status TEXT DEFAULT 'unread' CHECK(status IN ('unread', 'reading', 'completed')),
  current_page INTEGER DEFAULT 0,
  memo TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_user_status ON books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at DESC);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 書籍-タグ中間テーブル
CREATE TABLE IF NOT EXISTS book_tags (
  book_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_tags_book_id ON book_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_tags_tag_id ON book_tags(tag_id);

-- セッションテーブル
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
`;

/**
 * 開発環境用: テーブルを初期化
 */
export async function initializeTables(db: D1Database): Promise<void> {
  const statements = createTablesSQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.prepare(statement).run();
  }
}

/**
 * テーブルを削除（テスト用）
 */
export async function dropAllTables(db: D1Database): Promise<void> {
  await db.prepare("DROP TABLE IF EXISTS book_tags").run();
  await db.prepare("DROP TABLE IF EXISTS tags").run();
  await db.prepare("DROP TABLE IF EXISTS books").run();
  await db.prepare("DROP TABLE IF EXISTS sessions").run();
  await db.prepare("DROP TABLE IF EXISTS users").run();
}

/**
 * サンプルデータを挿入（開発用）
 */
export async function seedDatabase(db: D1Database): Promise<void> {
  const now = new Date().toISOString();

  // サンプルユーザー
  await db
    .prepare(
      `
    INSERT OR IGNORE INTO users (id, username, email, name, bio, avatar_url, provider, provider_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .bind(
      "user-1",
      "testuser",
      "test@example.com",
      "Test User",
      "技術書を読むのが好きです",
      "https://avatars.githubusercontent.com/u/1?v=4",
      "github",
      "12345",
      now,
      now
    )
    .run();

  // サンプル書籍
  await db
    .prepare(
      `
    INSERT OR IGNORE INTO books (
      id, user_id, title, authors, publisher, published_date, isbn,
      page_count, description, thumbnail_url, status, current_page,
      memo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .bind(
      "book-1",
      "user-1",
      "リーダブルコード",
      JSON.stringify(["Dustin Boswell", "Trevor Foucher"]),
      "オライリージャパン",
      "2012-06-23",
      "9784873115658",
      260,
      "より良いコードを書くためのシンプルで実践的なテクニック",
      "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/5658/9784873115658.jpg",
      "reading",
      120,
      "第3章まで読了。命名規則が参考になる",
      now,
      now
    )
    .run();

  await db
    .prepare(
      `
    INSERT OR IGNORE INTO books (
      id, user_id, title, authors, publisher, published_date, isbn,
      page_count, description, thumbnail_url, status, current_page,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
    )
    .bind(
      "book-2",
      "user-1",
      "プログラマのためのSQL 第4版",
      JSON.stringify(["Joe Celko"]),
      "翔泳社",
      "2015-09-16",
      "9784798142678",
      528,
      "SQLの基礎から高度なテクニックまで",
      "https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/2678/9784798142678.jpg",
      "completed",
      528,
      now,
      now
    )
    .run();

  // サンプルタグ
  await db
    .prepare(
      `
    INSERT OR IGNORE INTO tags (id, user_id, name, created_at)
    VALUES (?, ?, ?, ?)
  `
    )
    .bind("tag-1", "user-1", "設計", now)
    .run();

  await db
    .prepare(
      `
    INSERT OR IGNORE INTO tags (id, user_id, name, created_at)
    VALUES (?, ?, ?, ?)
  `
    )
    .bind("tag-2", "user-1", "データベース", now)
    .run();

  // 書籍-タグの関連付け
  await db
    .prepare(
      `
    INSERT OR IGNORE INTO book_tags (book_id, tag_id)
    VALUES (?, ?)
  `
    )
    .bind("book-1", "tag-1")
    .run();

  await db
    .prepare(
      `
    INSERT OR IGNORE INTO book_tags (book_id, tag_id)
    VALUES (?, ?)
  `
    )
    .bind("book-2", "tag-2")
    .run();
}
