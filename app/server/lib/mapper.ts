import type {
  Book,
  BookInput,
  Tag,
  TagInput,
  User,
  UserInput,
  BookStatus,
} from "../../types/database";
import type { CreateBookInput, UpdateBookInput } from "../api/schemas/book";
import type { CreateTagInput } from "../api/schemas/tag";

/**
 * API入力からBookInputへ変換
 */
export function toBookInput(
  data: CreateBookInput,
  userId: string
): BookInput {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    title: data.title,
    authors: data.authors,
    publisher: data.publisher ?? null,
    publishedDate: data.publishedDate ?? null,
    isbn: data.isbn ?? null,
    pageCount: data.pageCount ?? 0,
    description: data.description ?? null,
    thumbnailUrl: data.thumbnailUrl ?? null,
    rakutenBooksId: data.rakutenBooksId ?? null,
    rakutenAffiliateUrl: data.rakutenAffiliateUrl ?? null,
    status: data.status ?? "unread",
    currentPage: data.currentPage ?? 0,
    memo: data.memo ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 更新用のBookInputへ変換
 */
export function toBookUpdateInput(
  data: UpdateBookInput
): Partial<BookInput> {
  const result: Partial<BookInput> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.title !== undefined) result.title = data.title;
  if (data.authors !== undefined) result.authors = data.authors;
  if (data.publisher !== undefined) result.publisher = data.publisher;
  if (data.publishedDate !== undefined) result.publishedDate = data.publishedDate;
  if (data.isbn !== undefined) result.isbn = data.isbn;
  if (data.pageCount !== undefined) result.pageCount = data.pageCount;
  if (data.description !== undefined) result.description = data.description;
  if (data.thumbnailUrl !== undefined) result.thumbnailUrl = data.thumbnailUrl;
  if (data.rakutenBooksId !== undefined) result.rakutenBooksId = data.rakutenBooksId;
  if (data.rakutenAffiliateUrl !== undefined) result.rakutenAffiliateUrl = data.rakutenAffiliateUrl;
  if (data.status !== undefined) result.status = data.status;
  if (data.currentPage !== undefined) result.currentPage = data.currentPage;
  if (data.memo !== undefined) result.memo = data.memo;
  if (data.finishedAt !== undefined) result.finishedAt = data.finishedAt;

  return result;
}

/**
 * DB形式のBookをAPI形式に変換
 */
export function toBookResponse(book: Book): {
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
} {
  return {
    id: book.id,
    userId: book.user_id,
    rakutenBooksId: book.rakuten_books_id,
    title: book.title,
    authors: JSON.parse(book.authors),
    publisher: book.publisher,
    publishedDate: book.published_date,
    isbn: book.isbn,
    pageCount: book.page_count,
    description: book.description,
    thumbnailUrl: book.thumbnail_url,
    rakutenAffiliateUrl: book.rakuten_affiliate_url,
    status: book.status,
    currentPage: book.current_page,
    memo: book.memo,
    finishedAt: book.finished_at,
    createdAt: book.created_at,
    updatedAt: book.updated_at,
  };
}

/**
 * API入力からTagInputへ変換
 */
export function toTagInput(
  data: CreateTagInput,
  userId: string
): TagInput {
  return {
    id: crypto.randomUUID(),
    userId,
    name: data.name,
    createdAt: new Date().toISOString(),
  };
}

/**
 * DB形式のTagをAPI形式に変換
 */
export function toTagResponse(tag: Tag): {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
} {
  return {
    id: tag.id,
    userId: tag.user_id,
    name: tag.name,
    createdAt: tag.created_at,
  };
}

/**
 * DB形式のUserをAPI形式に変換
 */
export function toUserResponse(user: User): {
  id: string;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  provider: "github" | "google";
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    provider: user.provider,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}


