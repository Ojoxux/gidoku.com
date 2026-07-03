import type { BookStatus } from "../database";

export interface BookDto {
  id: string;
  userId: string;
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

export interface BookDetailDto extends BookDto {
  tags: string[];
}

export interface CreateBookRequestDto {
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

export interface UpdateBookRequestDto {
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

export interface UpdateBookProgressRequestDto {
  currentPage: number;
}

export interface BookStatsDto {
  total: number;
  reading: number;
  completed: number;
  unread: number;
}
