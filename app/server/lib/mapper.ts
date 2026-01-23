import type {
  Book,
  BookInput,
  BookResponse,
  Tag,
  TagInput,
  TagResponse,
  User,
  UserResponse,
} from "../../types/database";
import type { CreateBookInput, UpdateBookInput } from "../api/schemas/book";
import type { CreateTagInput } from "../api/schemas/tag";
import { removeUndefined } from "./utils";

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
  return removeUndefined({
    updatedAt: new Date().toISOString(),
    title: data.title,
    authors: data.authors,
    publisher: data.publisher,
    publishedDate: data.publishedDate,
    isbn: data.isbn,
    pageCount: data.pageCount,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    rakutenBooksId: data.rakutenBooksId,
    rakutenAffiliateUrl: data.rakutenAffiliateUrl,
    status: data.status,
    currentPage: data.currentPage,
    memo: data.memo,
    finishedAt: data.finishedAt,
  });
}

/**
 * DB形式のBookをAPI形式に変換
 */
export function toBookResponse(book: Book): BookResponse {
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
export function toTagResponse(tag: Tag): TagResponse {
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
export function toUserResponse(user: User): UserResponse {
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


