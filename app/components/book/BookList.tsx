import type { FC } from "hono/jsx";
import type { BookStatus } from "../../types/database";
import { BookCard } from "./BookCard";

interface BookItem {
  id: string;
  title: string;
  authors: string[];
  publisher?: string | null;
  thumbnailUrl?: string | null;
  status: BookStatus;
  currentPage: number;
  pageCount: number;
}

interface BookListProps {
  books: BookItem[];
  emptyMessage?: string;
}

export const BookList: FC<BookListProps> = ({
  books,
  emptyMessage = "本がありません",
}) => {
  if (books.length === 0) {
    return (
      <div class="text-center py-12">
        <p class="text-zinc-500 mb-4">{emptyMessage}</p>
        <a
          href="/books/new"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          本を追加する
        </a>
      </div>
    );
  }

  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <BookCard
          key={book.id}
          id={book.id}
          title={book.title}
          authors={book.authors}
          publisher={book.publisher}
          thumbnailUrl={book.thumbnailUrl}
          status={book.status}
          currentPage={book.currentPage}
          pageCount={book.pageCount}
        />
      ))}
    </div>
  );
};
