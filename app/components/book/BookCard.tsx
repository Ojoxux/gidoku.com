import type { FC } from "hono/jsx";
import type { BookStatus } from "../../types/database";
import { Card, CardBody } from "../ui/Card";
import { StatusBadge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { BookCover } from "./BookCover";
import { BookMeta } from "./BookMeta";

interface BookCardProps {
  id: string;
  title: string;
  authors: string[];
  publisher?: string | null;
  thumbnailUrl?: string | null;
  status: BookStatus;
  currentPage: number;
  pageCount: number;
}

export const BookCard: FC<BookCardProps> = ({
  id,
  title,
  authors,
  publisher,
  thumbnailUrl,
  status,
  currentPage,
  pageCount,
}) => {
  return (
    <Card href={`/books/${id}`} class="hover:shadow-md transition-shadow">
      <CardBody class="flex gap-4">
        <BookCover src={thumbnailUrl} alt={title} size="sm" />
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <BookMeta
              title={title}
              authors={authors}
              publisher={publisher}
            />
            <StatusBadge status={status} />
          </div>
          {pageCount > 0 && (
            <div class="mt-3">
              <ProgressBar
                current={currentPage}
                total={pageCount}
                showLabel={true}
              />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
