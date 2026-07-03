import type { UserId, BookId, TagId, SessionId, OAuthProvider, BookStatus, BookSortOrder } from "./domain";

export type { BookStatus, BookSortOrder } from "./domain";

// ユーザー
export interface User {
  id: UserId;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  provider: OAuthProvider;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserInput {
  id: UserId;
  username: string;
  email: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  provider: OAuthProvider;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: UserId;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  provider: OAuthProvider;
  createdAt: string;
  updatedAt: string;
}

// 書籍
export interface Book {
  id: BookId;
  user_id: UserId;
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
  id: BookId;
  userId: UserId;
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
  sortBy?: BookSortOrder;
}

export interface BookResponse {
  id: BookId;
  userId: UserId;
  rakutenBooksId: string | null;
  title: string;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  isbn: string | null;
  pageCount: number;
  description: string | null;
  thumbnailUrl: string | null;
  rakutenAffiliateUrl: string | null;
  status: BookStatus;
  currentPage: number;
  memo: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// タグ
export interface Tag {
  id: TagId;
  user_id: UserId;
  name: string;
  created_at: string;
}

export interface TagInput {
  id: TagId;
  userId: UserId;
  name: string;
  createdAt: string;
}

export interface TagResponse {
  id: TagId;
  userId: UserId;
  name: string;
  createdAt: string;
}

// 書籍-タグ
export interface BookTag {
  book_id: BookId;
  tag_id: TagId;
}

// セッション
export interface Session {
  id: SessionId;
  user_id: UserId;
  expires_at: string;
  created_at: string;
}

export interface SessionInput {
  id: SessionId;
  userId: UserId;
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
