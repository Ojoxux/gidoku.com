import type { D1Database, KVNamespace } from '@cloudflare/workers-types'

/**
 * テスト用のユーザーを作成
 */
export async function createTestUser(
  db: D1Database,
  overrides: Partial<{
    id: string
    username: string
    email: string
    name: string
    provider: string
    providerId: string
  }> = {}
) {
  const now = new Date().toISOString()
  const userId = overrides.id || crypto.randomUUID()
  const user = {
    id: userId,
    username: overrides.username || `test_user_${userId.slice(0, 8)}`,
    email: overrides.email || `test_${userId.slice(0, 8)}@example.com`,
    name: overrides.name || 'Test User',
    bio: null,
    avatar_url: null,
    provider: overrides.provider || 'github',
    provider_id: overrides.providerId || `provider_${userId.slice(0, 8)}`,
    created_at: now,
    updated_at: now,
  }

  await db
    .prepare(
      `INSERT INTO users (id, username, email, name, bio, avatar_url, provider, provider_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      user.id,
      user.username,
      user.email,
      user.name,
      user.bio,
      user.avatar_url,
      user.provider,
      user.provider_id,
      user.created_at,
      user.updated_at
    )
    .run()

  return user
}

/**
 * テスト用のセッションを作成
 */
export async function createTestSession(
  kv: KVNamespace,
  userId: string
): Promise<string> {
  const sessionId = crypto.randomUUID()
  await kv.put(`session:${sessionId}`, userId, { expirationTtl: 3600 })
  return sessionId
}

/**
 * テスト用の書籍を作成
 */
export async function createTestBook(
  db: D1Database,
  userId: string,
  overrides: Partial<{
    id: string
    title: string
    authors: string[]
    status: 'unread' | 'reading' | 'completed'
    pageCount: number
    currentPage: number
  }> = {}
) {
  const now = new Date().toISOString()
  const bookId = overrides.id || crypto.randomUUID()
  const book = {
    id: bookId,
    user_id: userId,
    rakuten_books_id: null,
    title: overrides.title || 'Test Book',
    authors: JSON.stringify(overrides.authors || ['Test Author']),
    publisher: 'Test Publisher',
    published_date: '2024-01-01',
    isbn: '9784873119038',
    page_count: overrides.pageCount || 300,
    description: 'A test book description',
    thumbnail_url: null,
    rakuten_affiliate_url: null,
    status: overrides.status || 'unread',
    current_page: overrides.currentPage || 0,
    memo: null,
    finished_at: null,
    created_at: now,
    updated_at: now,
  }

  await db
    .prepare(
      `INSERT INTO books (id, user_id, rakuten_books_id, title, authors, publisher, published_date, isbn, page_count, description, thumbnail_url, rakuten_affiliate_url, status, current_page, memo, finished_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      book.id,
      book.user_id,
      book.rakuten_books_id,
      book.title,
      book.authors,
      book.publisher,
      book.published_date,
      book.isbn,
      book.page_count,
      book.description,
      book.thumbnail_url,
      book.rakuten_affiliate_url,
      book.status,
      book.current_page,
      book.memo,
      book.finished_at,
      book.created_at,
      book.updated_at
    )
    .run()

  return book
}

/**
 * テスト用のタグを作成
 */
export async function createTestTag(
  db: D1Database,
  userId: string,
  name?: string
) {
  const now = new Date().toISOString()
  const tagId = crypto.randomUUID()
  const tag = {
    id: tagId,
    user_id: userId,
    name: name || `tag_${tagId.slice(0, 8)}`,
    created_at: now,
  }

  await db
    .prepare(
      `INSERT INTO tags (id, user_id, name, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(tag.id, tag.user_id, tag.name, tag.created_at)
    .run()

  return tag
}

/**
 * データベースをクリーンアップ
 */
export async function cleanupDatabase(db: D1Database) {
  await db.batch([
    db.prepare('DELETE FROM book_tags'),
    db.prepare('DELETE FROM tags'),
    db.prepare('DELETE FROM books'),
    db.prepare('DELETE FROM sessions'),
    db.prepare('DELETE FROM users'),
  ])
}

/**
 * 認証済みリクエストを作成するヘルパー
 */
export function createAuthenticatedRequest(
  url: string,
  sessionId: string,
  options: RequestInit = {}
): Request {
  const headers = new Headers(options.headers)
  headers.set('Cookie', `session_id=${sessionId}`)

  return new Request(url, {
    ...options,
    headers,
  })
}
