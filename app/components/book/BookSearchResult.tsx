import type { FC } from "hono/jsx";
import type { BookSearchResult as SearchResult } from "../../types/api";
import { Card, CardBody } from "../ui/Card";
import { Button } from "../ui/Button";
import { BookCover } from "./BookCover";
import { BookMeta } from "./BookMeta";

interface BookSearchResultProps {
  book: SearchResult;
  onSelect?: string;
}

export const BookSearchResultItem: FC<BookSearchResultProps> = ({
  book,
  onSelect,
}) => {
  return (
    <Card class="hover:bg-gray-50">
      <CardBody class="flex gap-4">
        <BookCover src={book.thumbnailUrl} alt={book.title} size="sm" />
        <div class="flex-1 min-w-0">
          <BookMeta
            title={book.title}
            authors={book.authors}
            publisher={book.publisher}
          />
          {book.isbn && (
            <p class="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
          )}
        </div>
        <div class="flex items-center">
          <Button size="sm" variant="secondary" onClick={onSelect}>
            追加
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

interface BookSearchResultListProps {
  results: SearchResult[];
  onSelect?: (book: SearchResult) => void;
}

export const BookSearchResultList: FC<BookSearchResultListProps> = ({
  results,
}) => {
  if (results.length === 0) {
    return (
      <div class="text-center py-8 text-gray-500">
        検索結果がありません
      </div>
    );
  }

  return (
    <div class="space-y-3">
      {results.map((book) => (
        <BookSearchResultItem
          key={book.isbn || book.title}
          book={book}
        />
      ))}
    </div>
  );
};
