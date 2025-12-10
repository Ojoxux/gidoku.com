# gidoku.com バックエンド設計書

## 概要

シンプルで拡張可能なバックエンドアーキテクチャ。MVP では最小限の構造で始め、必要に応じて段階的にリファクタリング。

## 設計方針

- **関数ベース**: クラスではなく関数で構成（シンプル、テスト容易）
- **Hono RPC**: 型安全な API 通信
- **段階的拡張**: 複雑になったら適宜 Service 層を追加
- **Cloudflare Workers 最適化**: エッジ環境での効率的な実行

## ディレクトリ構造

```
app/
├── routes/
│   └── api/
│       └── [...routes].ts    # Hono RPC エンドポイント
│
├── server/
│   ├── api/                  # Hono RPC API定義
│   │   ├── books.ts          # 書籍関連API
│   │   ├── tags.ts           # タグ関連API
│   │   ├── users.ts          # ユーザー関連API
│   │   ├── auth.ts           # 認証API
│   │   └── index.ts          # RPC型エクスポート
│   │
│   ├── db/                   # データベース層
│   │   ├── client.ts         # D1クライアント初期化
│   │   ├── schema.ts         # テーブル定義・マイグレーション
│   │   └── repositories/     # データアクセス関数
│   │       ├── book.ts
│   │       ├── tag.ts
│   │       ├── user.ts
│   │       └── bookTag.ts
│   │
│   ├── services/             # 外部連携・複雑なロジック
│   │   ├── rakuten.ts        # 楽天ブックスAPI
│   │   └── oauth.ts          # OAuth処理
│   │
│   ├── domain/               # ドメインロジック（必要な部分のみ）
│   │   └── Book.ts           # 進捗計算などのロジック
│   │
│   └── lib/                  # ユーティリティ
│       ├── auth.ts           # 認証ヘルパー
│       ├── session.ts        # セッション管理
│       ├── validation.ts     # バリデーション
│       ├── errors.ts         # エラーハンドリング
│       └── utils.ts          # 汎用ヘルパー
│
└── types/
    ├── api.ts                # RPC型定義
    ├── database.ts           # DB型定義
    └── env.ts                # 環境変数型定義
```

## レイヤー構成

### 1. API 層（`server/api/`）

**責務**: Hono RPC エンドポイントの定義、リクエスト/レスポンス処理

```typescript
// server/api/books.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import * as bookRepo from "../db/repositories/book";
import { authMiddleware } from "../lib/auth";
import { createBookSchema, updateBookSchema } from "./schemas";

const app = new Hono<{ Bindings: Env }>();

// 認証ミドルウェア適用
app.use("*", authMiddleware);

// 書籍一覧取得
app.get("/", async (c) => {
  const userId = c.get("userId");
  const { status, search, sortBy } = c.req.query();

  const books = await bookRepo.findByUserId(c.env.DB, userId, {
    status,
    search,
    sortBy,
  });

  return c.json(books);
});

// 書籍詳細取得
app.get("/:id", async (c) => {
  const bookId = c.req.param("id");
  const userId = c.get("userId");

  const book = await bookRepo.findById(c.env.DB, bookId, userId);

  if (!book) {
    return c.json({ error: "Book not found" }, 404);
  }

  return c.json(book);
});

// 書籍登録
app.post("/", zValidator("json", createBookSchema), async (c) => {
  const userId = c.get("userId");
  const data = c.req.valid("json");

  const book = await bookRepo.create(c.env.DB, {
    ...data,
    userId,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return c.json(book, 201);
});

// 書籍更新
app.put("/:id", zValidator("json", updateBookSchema), async (c) => {
  const bookId = c.req.param("id");
  const userId = c.get("userId");
  const data = c.req.valid("json");

  const book = await bookRepo.update(c.env.DB, bookId, userId, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return c.json(book);
});

// 進捗更新
app.patch("/:id/progress", zValidator("json", progressSchema), async (c) => {
  const bookId = c.req.param("id");
  const userId = c.get("userId");
  const { currentPage } = c.req.valid("json");

  const book = await bookRepo.updateProgress(
    c.env.DB,
    bookId,
    userId,
    currentPage
  );

  return c.json(book);
});

// 書籍削除
app.delete("/:id", async (c) => {
  const bookId = c.req.param("id");
  const userId = c.get("userId");

  await bookRepo.deleteById(c.env.DB, bookId, userId);

  return c.json({ success: true });
});

export default app;
```

### 2. Repository 層（`server/db/repositories/`）

**責務**: データベースアクセス、SQL 実行

**特徴**:

- 関数ベース（クラス不要）
- 純粋な CRUD 操作
- ビジネスロジックは含まない

```typescript
// server/db/repositories/book.ts
import type { D1Database } from "@cloudflare/workers-types";
import type { Book, BookInput, BookFilter } from "../../../types/database";

/**
 * ユーザーIDで書籍一覧を取得
 */
export async function findByUserId(
  db: D1Database,
  userId: string,
  filter?: BookFilter
): Promise<Book[]> {
  let query = "SELECT * FROM books WHERE user_id = ?";
  const params: any[] = [userId];

  if (filter?.status) {
    query += " AND status = ?";
    params.push(filter.status);
  }

  if (filter?.search) {
    query += " AND (title LIKE ? OR authors LIKE ?)";
    const searchTerm = `%${filter.search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (filter?.sortBy) {
    const sortMap = {
      title: "title ASC",
      created: "created_at DESC",
      updated: "updated_at DESC",
      progress: "current_page DESC",
    };
    query += ` ORDER BY ${sortMap[filter.sortBy] || "created_at DESC"}`;
  }

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();
  return result.results as Book[];
}

/**
 * IDで書籍を取得
 */
export async function findById(
  db: D1Database,
  bookId: string,
  userId: string
): Promise<Book | null> {
  const result = await db
    .prepare("SELECT * FROM books WHERE id = ? AND user_id = ?")
    .bind(bookId, userId)
    .first();

  return result as Book | null;
}

/**
 * 書籍を作成
 */
export async function create(db: D1Database, book: BookInput): Promise<Book> {
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
      book.publisher,
      book.publishedDate,
      book.isbn,
      book.pageCount,
      book.description,
      book.thumbnailUrl,
      book.rakutenAffiliateUrl || null,
      book.status || "unread",
      book.currentPage || 0,
      book.memo || "",
      book.finishedAt || null,
      book.createdAt,
      book.updatedAt
    )
    .run();

  return book as Book;
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
  params.push(data.updatedAt);

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

  return findById(db, bookId, userId) as Promise<Book>;
}

/**
 * 進捗を更新
 */
export async function updateProgress(
  db: D1Database,
  bookId: string,
  userId: string,
  currentPage: number
): Promise<Book> {
  await db
    .prepare(
      `
      UPDATE books 
      SET current_page = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    )
    .bind(currentPage, new Date().toISOString(), bookId, userId)
    .run();

  return findById(db, bookId, userId) as Promise<Book>;
}

/**
 * 書籍を削除
 */
export async function deleteById(
  db: D1Database,
  bookId: string,
  userId: string
): Promise<void> {
  await db
    .prepare("DELETE FROM books WHERE id = ? AND user_id = ?")
    .bind(bookId, userId)
    .run();
}

/**
 * ユーザーの統計情報を取得
 */
export async function getStats(
  db: D1Database,
  userId: string
): Promise<{
  total: number;
  reading: number;
  completed: number;
  unread: number;
}> {
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
    .first();

  return result as any;
}
```

### 3. Service 層（`server/services/`）

**責務**: 外部 API 連携、複雑なビジネスロジック

**使用するケース**:

- 外部 API との通信（楽天 API、OAuth）
- 複数の Repository を跨ぐ処理
- 複雑な計算やデータ変換

```typescript
// server/services/rakuten.ts
import type { RakutenBookResponse, BookSearchResult } from "../../../types/api";

/**
 * 楽天ブックスAPIで書籍を検索
 */
export async function searchBooks(
  query: string,
  applicationId: string
): Promise<BookSearchResult[]> {
  const url = new URL(
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
  );
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("title", query);
  url.searchParams.set("booksGenreId", "001004"); // PC・システム開発
  url.searchParams.set("hits", "20");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch from Rakuten API");
  }

  const data: RakutenBookResponse = await response.json();

  return data.Items.map((item) => ({
    rakutenBooksId: item.Item.isbn,
    title: item.Item.title,
    authors: [item.Item.author],
    publisher: item.Item.publisherName,
    publishedDate: item.Item.salesDate,
    isbn: item.Item.isbn,
    pageCount: item.Item.size ? parseInt(item.Item.size) : 0,
    description: item.Item.itemCaption,
    thumbnailUrl: item.Item.largeImageUrl,
    rakutenAffiliateUrl: item.Item.affiliateUrl,
  }));
}

/**
 * ISBNで書籍を検索
 */
export async function searchByISBN(
  isbn: string,
  applicationId: string
): Promise<BookSearchResult | null> {
  const url = new URL(
    "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404"
  );
  url.searchParams.set("applicationId", applicationId);
  url.searchParams.set("isbn", isbn);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch from Rakuten API");
  }

  const data: RakutenBookResponse = await response.json();

  if (data.Items.length === 0) {
    return null;
  }

  const item = data.Items[0].Item;

  return {
    rakutenBooksId: item.isbn,
    title: item.title,
    authors: [item.author],
    publisher: item.publisherName,
    publishedDate: item.salesDate,
    isbn: item.isbn,
    pageCount: item.size ? parseInt(item.size) : 0,
    description: item.itemCaption,
    thumbnailUrl: item.largeImageUrl,
    rakutenAffiliateUrl: item.affiliateUrl,
  };
}
```

```typescript
// server/services/oauth.ts
import type { OAuthProvider, OAuthUser } from "../../../types/api";

/**
 * GitHub OAuthでユーザー情報を取得
 */
export async function getGitHubUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  const data = await response.json();

  return {
    provider: "github",
    providerId: String(data.id),
    email: data.email,
    name: data.name || data.login,
    username: data.login,
    avatarUrl: data.avatar_url,
    bio: data.bio,
  };
}

/**
 * Google OAuthでユーザー情報を取得
 */
export async function getGoogleUser(accessToken: string): Promise<OAuthUser> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Google user");
  }

  const data = await response.json();

  return {
    provider: "google",
    providerId: data.id,
    email: data.email,
    name: data.name,
    username: data.email.split("@")[0], // メールアドレスからusername生成
    avatarUrl: data.picture,
    bio: "",
  };
}
```

### 4. Domain 層（`server/domain/`）

**責務**: ドメインロジック（進捗計算など）

**使用するケース**:

- エンティティ固有のロジック
- 計算処理
- バリデーション

```typescript
// server/domain/Book.ts

/**
 * 書籍エンティティ
 * 進捗計算などのドメインロジックを持つ
 */
export class Book {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public currentPage: number,
    public pageCount: number,
    public status: "unread" | "reading" | "completed"
  ) {}

  /**
   * 進捗率を計算（0-100）
   */
  get progress(): number {
    if (this.pageCount === 0) return 0;
    return Math.round((this.currentPage / this.pageCount) * 100);
  }

  /**
   * 進捗を更新
   */
  updateProgress(page: number): void {
    if (page < 0) {
      throw new Error("Page cannot be negative");
    }
    if (page > this.pageCount) {
      throw new Error("Page exceeds total pages");
    }
    this.currentPage = page;

    // ページ数に応じてステータスを自動更新
    if (page === 0) {
      this.status = "unread";
    } else if (page === this.pageCount) {
      this.status = "completed";
    } else {
      this.status = "reading";
    }
  }

  /**
   * 読了としてマーク
   */
  markAsCompleted(): void {
    this.status = "completed";
    this.currentPage = this.pageCount;
  }

  /**
   * 読書中かどうか
   */
  isReading(): boolean {
    return this.status === "reading";
  }

  /**
   * 読了済みかどうか
   */
  isCompleted(): boolean {
    return this.status === "completed";
  }
}
```

### 5. Lib 層（`server/lib/`）

**責務**: 認証、バリデーション、エラーハンドリングなどの共通処理

```typescript
// server/lib/auth.ts
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import * as userRepo from "../db/repositories/user";

/**
 * 認証ミドルウェア
 */
export async function authMiddleware(c: Context, next: Next) {
  const sessionId = getCookie(c, "session_id");

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // セッションからユーザーIDを取得
  const userId = await getSessionUserId(c.env.KV, sessionId);

  if (!userId) {
    return c.json({ error: "Invalid session" }, 401);
  }

  // ユーザー情報を取得
  const user = await userRepo.findById(c.env.DB, userId);

  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  // コンテキストにユーザー情報を設定
  c.set("userId", userId);
  c.set("user", user);

  await next();
}

/**
 * セッションからユーザーIDを取得
 */
async function getSessionUserId(
  kv: KVNamespace,
  sessionId: string
): Promise<string | null> {
  return await kv.get(`session:${sessionId}`);
}
```

```typescript
// server/lib/errors.ts

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * エラーハンドリングミドルウェア
 */
export function errorHandler(err: Error, c: Context) {
  if (err instanceof AppError) {
    return c.json(
      {
        error: err.message,
        code: err.code,
      },
      err.statusCode
    );
  }

  console.error("Unexpected error:", err);

  return c.json(
    {
      error: "Internal server error",
    },
    500
  );
}
```

## Hono RPC 設定

### RPC 型エクスポート

```typescript
// server/api/index.ts
import { Hono } from "hono";
import books from "./books";
import tags from "./tags";
import users from "./users";
import auth from "./auth";

const app = new Hono<{ Bindings: Env }>();

app.route("/books", books);
app.route("/tags", tags);
app.route("/users", users);
app.route("/auth", auth);

export type AppType = typeof app;
export default app;
```

### クライアント側での使用

```typescript
// app/lib/api-client.ts
import { hc } from "hono/client";
import type { AppType } from "../server/api";

export const client = hc<AppType>("/api");

// 使用例
const books = await client.books.$get();
const data = await books.json();
```

## データベーススキーマ

```typescript
// server/db/schema.ts

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
  status TEXT DEFAULT 'unread',
  current_page INTEGER DEFAULT 0,
  memo TEXT,
  finished_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- タグテーブル
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

-- 書籍-タグ中間テーブル
CREATE TABLE IF NOT EXISTS book_tags (
  book_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
`;
```

## 環境変数

```typescript
// types/env.ts
export interface Env {
  DB: D1Database; // Cloudflare D1
  KV: KVNamespace; // セッション管理用
  RAKUTEN_APP_ID: string; // 楽天API
  GITHUB_CLIENT_ID: string; // GitHub OAuth
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string; // Google OAuth
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string; // セッション暗号化
}
```

## 実装の優先順位

### フェーズ 1: 基礎インフラ（1-2 日）

1. ✅ DB スキーマ作成
2. ✅ Repository 層（user, book）
3. ✅ 認証ミドルウェア
4. ✅ エラーハンドリング

### フェーズ 2: コア機能（2-3 日）

1. ✅ 書籍 CRUD API
2. ✅ タグ管理 API
3. ✅ OAuth 連携（GitHub/Google）
4. ✅ 楽天 API 連携

### フェーズ 3: 追加機能（1-2 日）

1. ✅ 公開プロフィール API
2. ✅ 統計情報 API
3. ✅ 検索・フィルタリング

## 将来の拡張ポイント

以下の状況になったら、リファクタリングを検討：

### Service 層の拡張

- 複数の Repository を跨ぐ処理が増えた
- ビジネスロジックが複雑化した
  → `BookApplicationService` などを追加

### クラスベースへの移行

- テストが複雑になった
- 依存性注入が必要になった
  → Repository/Service をクラス化

### キャッシュ層の追加

- パフォーマンスが問題になった
  → KV を使ったキャッシュ戦略

## テスト戦略

```typescript
// 例: Repository のテスト
import { describe, it, expect, beforeEach } from "vitest";
import { createBook, findById } from "../server/db/repositories/book";

describe("BookRepository", () => {
  let db: D1Database;

  beforeEach(async () => {
    // テスト用DBのセットアップ
    db = await setupTestDB();
  });

  it("should create a book", async () => {
    const book = {
      id: "test-id",
      userId: "user-1",
      title: "Test Book",
      // ...
    };

    await createBook(db, book);
    const found = await findById(db, "test-id", "user-1");

    expect(found).toEqual(book);
  });
});
```

## まとめ

- **シンプル**: 関数ベース、必要最小限のレイヤー
- **型安全**: Hono RPC で完全な型推論
- **拡張可能**: 段階的に Service 層を厚くすることが可能
- **テスト容易**: 純粋関数中心の設計
- **Workers 最適化**: エッジ環境での効率的な実行
