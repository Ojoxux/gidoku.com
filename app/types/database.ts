// ユーザー
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  provider: "github" | "google";
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  provider: "github" | "google";
  provider_id: string;
  created_at: string;
  updated_at: string;
}

// 書籍
export type BookStatus = "unread" | "reading" | "completed";

export interface Book {
  id: string;
  user_id: string;
  rakuten_books_id: string | null;
  title: string;
  authors: string; // JSON文字列
  publisher: string | null;
  published_date: string | null;
  isbn: string | null;
  page_count: number;
  description: string | null;
  thumbnail_url: string | null;
  rakuten_affiliate_url: string | null;
  status: BookStatus;
  current_page: number;
  memo: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookInput {
  id: string;
  userId: string;
  rakutenBooksId?: string | null;
  title: string;
  authors: string[]; // 配列（保存時にJSON化）
  publisher?: string | null;
  publishedDate?: string | null;
  isbn?: string | null;
  pageCount?: number;
  description?: string | null;
  thumbnailUrl?: string | null;
  rakutenAffiliateUrl?: string | null;
  status?: BookStatus;
  currentPage?: number;
  memo?: string | null;
  finishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookFilter {
  status?: BookStatus;
  search?: string;
  sortBy?: "title" | "created" | "updated" | "progress";
}

// タグ
export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TagInput {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

// 書籍-タグ
export interface BookTag {
  book_id: string;
  tag_id: string;
}

// セッション
export interface Session {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface SessionInput {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

// 統計情報
export interface BookStats {
  total: number;
  reading: number;
  completed: number;
  unread: number;
}
