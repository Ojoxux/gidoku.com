import { env } from 'cloudflare:test'
import { beforeAll } from 'vitest'

// テスト前にデータベーススキーマをセットアップ
beforeAll(async () => {
  // users テーブル
  await env.DB.prepare(`
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
    )
  `).run()

  // books テーブル
  await env.DB.prepare(`
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
    )
  `).run()

  // tags テーブル
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, name)
    )
  `).run()

  // book_tags テーブル
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS book_tags (
      book_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (book_id, tag_id),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `).run()

  // sessions テーブル（存在しない場合のみ）
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `).run()
})
