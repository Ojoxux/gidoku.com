import type { Env } from "../../types/env";
import type { BookStatus } from "../../types/book";
import type { Book, BookStats } from "../../types/database";
import type { PublicBookDto } from "../../types/dto";
import { bookRepo } from "../db/repositories";
import { toPublicBookDto } from "../lib/mapper";

type D1Database = Env["DB"];

export const PUBLIC_PROFILE_BOOK_STATUSES = [
  "unread",
  "reading",
  "completed",
] as const satisfies readonly BookStatus[];

export type PublicProfileBookStatus = (typeof PUBLIC_PROFILE_BOOK_STATUSES)[number];

interface PublicProfileBookListLimits {
  reading: number;
  unread: number;
  completed: number;
}

const publicProfileBookListLimits = {
  reading: 12,
  unread: 24,
  completed: 24,
} satisfies PublicProfileBookListLimits;

export interface PublicProfileBookListItem {
  id: string;
  title: string;
  authors: string[];
  publisher: string | null;
  thumbnailUrl: string | null;
  status: BookStatus;
  currentPage: number;
  pageCount: number;
}

export interface PublicProfileBooks {
  stats: BookStats;
  readingBooks: PublicProfileBookListItem[];
  unreadBooks: PublicProfileBookListItem[];
  completedBooks: PublicProfileBookListItem[];
}

function isPublicProfileBookStatus(status: BookStatus): status is PublicProfileBookStatus {
  return PUBLIC_PROFILE_BOOK_STATUSES.includes(status as PublicProfileBookStatus);
}

function toPublicProfileBookListItem(book: Book): PublicProfileBookListItem {
  return {
    id: book.id,
    title: book.title,
    authors: JSON.parse(book.authors) as string[],
    publisher: book.publisher,
    thumbnailUrl: book.thumbnail_url,
    status: book.status,
    currentPage: book.current_page,
    pageCount: book.page_count,
  };
}

export function toPublicBookResponse(book: Book): PublicBookDto {
  return toPublicBookDto(book);
}

export async function getPublicProfileBooks(
  db: D1Database,
  userId: string,
): Promise<PublicProfileBooks> {
  const [
    stats,
    { books: rawReadingBooks },
    { books: rawUnreadBooks },
    { books: rawCompletedBooks },
  ] = await Promise.all([
    bookRepo.getStats(db, userId),
    bookRepo.findByUserId(db, userId, {
      status: "reading",
      limit: publicProfileBookListLimits.reading,
      offset: 0,
    }),
    bookRepo.findByUserId(db, userId, {
      status: "unread",
      sortBy: "updated",
      limit: publicProfileBookListLimits.unread,
      offset: 0,
    }),
    bookRepo.findByUserId(db, userId, {
      status: "completed",
      sortBy: "updated",
      limit: publicProfileBookListLimits.completed,
      offset: 0,
    }),
  ]);

  return {
    stats,
    readingBooks: rawReadingBooks.map(toPublicProfileBookListItem),
    unreadBooks: rawUnreadBooks.map(toPublicProfileBookListItem),
    completedBooks: rawCompletedBooks.map(toPublicProfileBookListItem),
  };
}

export async function getPublicBookResponses(
  db: D1Database,
  userId: string,
): Promise<PublicBookDto[]> {
  const { books } = await bookRepo.findByUserId(db, userId, {
    limit: 50,
    offset: 0,
  });

  return books.filter((book) => isPublicProfileBookStatus(book.status)).map(toPublicBookResponse);
}
