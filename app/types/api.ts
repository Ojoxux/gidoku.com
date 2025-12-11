import type { BookStatus } from "./database";

// OAuth関連
export type OAuthProvider = "github" | "google";

export interface OAuthUser {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
}

// 楽天ブックスAPI
export interface RakutenBookItem {
  Item: {
    title: string;
    author: string;
    publisherName: string;
    salesDate: string;
    isbn: string;
    size: string;
    itemCaption: string;
    largeImageUrl: string;
    affiliateUrl: string;
  };
}

export interface RakutenBookResponse {
  Items: RakutenBookItem[];
  count: number;
  page: number;
  first: number;
  last: number;
  hits: number;
  carrier: number;
  pageCount: number;
}

export interface BookSearchResult {
  rakutenBooksId: string;
  title: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  isbn: string;
  pageCount: number;
  description: string;
  thumbnailUrl: string;
  rakutenAffiliateUrl: string;
}

// API リクエスト/レスポンス
export interface CreateBookRequest {
  rakutenBooksId?: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  pageCount?: number;
  description?: string;
  thumbnailUrl?: string;
  rakutenAffiliateUrl?: string;
  status?: BookStatus;
  currentPage?: number;
  memo?: string;
  tags?: string[];
}

export interface UpdateBookRequest {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  pageCount?: number;
  description?: string;
  thumbnailUrl?: string;
  status?: BookStatus;
  currentPage?: number;
  memo?: string;
  finishedAt?: string;
}

export interface UpdateProgressRequest {
  currentPage: number;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateUserRequest {
  username?: string;
  name?: string;
  bio?: string;
}

// 公開プロフィール
export interface PublicProfile {
  username: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  stats: {
    totalBooks: number;
    readingBooks: number;
    completedBooks: number;
  };
}

export interface PublicBook {
  id: string;
  title: string;
  authors: string[];
  publisher: string | null;
  thumbnailUrl: string | null;
  status: BookStatus;
  currentPage: number;
  pageCount: number;
  finishedAt: string | null;
  tags: string[];
}

