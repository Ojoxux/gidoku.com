import { useRef } from "hono/jsx/dom";
import { BookCover } from "../components/book/BookCover";

interface ReadingBook {
  id: string;
  title: string;
  authors: string[];
  thumbnailUrl: string | null;
  currentPage: number;
  pageCount: number;
}

interface ReadingBooksCarouselProps {
  books: ReadingBook[];
}

export default function ReadingBooksCarousel({
  books,
}: ReadingBooksCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 304; // card width (280) + gap (24)
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div class="relative group">
      {/* Left Button */}
      <button
        onClick={() => scroll("left")}
        class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-zinc-100 flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-50 focus:opacity-100 disabled:opacity-0"
        aria-label="Previous"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        class="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-1 -mx-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {books.map((book) => (
          <a
            key={book.id}
            href={`/books/${book.id}`}
            class="snap-start shrink-0 w-[280px] group/card bg-white border border-zinc-200 rounded-sm p-6 flex flex-col hover:border-zinc-900 transition-colors duration-300"
          >
            <div class="flex gap-4 mb-4">
              <div class="shrink-0">
                <BookCover
                  src={book.thumbnailUrl}
                  alt={book.title}
                  size="md"
                  class="shadow-sm"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3
                  class="text-base font-bold text-zinc-900 line-clamp-3 leading-tight group-hover/card:underline decoration-1 underline-offset-2 mb-1"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  {book.title}
                </h3>
                <p
                  class="text-xs text-zinc-500 line-clamp-2"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  {book.authors.join(", ")}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            {book.pageCount > 0 && (
              <div class="mt-auto pt-2">
                <div class="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-900 mb-2">
                  <span style={{ fontFamily: '"Arial", sans-serif' }}>
                    Progress
                  </span>
                  <span style={{ fontFamily: '"Arial", sans-serif' }}>
                    {Math.round((book.currentPage / book.pageCount) * 100)}%
                  </span>
                </div>
                <div class="h-1.5 w-full bg-zinc-100 overflow-hidden mb-1">
                  <div
                    class="h-full bg-zinc-900 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        (book.currentPage / book.pageCount) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p
                  class="text-[10px] text-zinc-500 text-right"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  {book.currentPage} / {book.pageCount} p
                </p>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Right Button */}
      <button
        onClick={() => scroll("right")}
        class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-zinc-100 flex items-center justify-center text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-50 focus:opacity-100 disabled:opacity-0"
        aria-label="Next"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
