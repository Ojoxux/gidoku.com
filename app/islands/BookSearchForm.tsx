import { useState } from "hono/jsx";

interface SearchResult {
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

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

interface SearchResponse {
  results: SearchResult[];
  hits: number;
  pageCount: number;
  currentPage: number;
}

export default function BookSearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);


  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const res = await fetch(
        `/api/search/books?query=${encodeURIComponent(query)}&page=1`
      );
      const data = (await res.json()) as ApiResponse<SearchResponse>;

      if (data.success && data.data) {
        console.log("検索結果：", data.data); // デバック用
        setResults(data.data.results);
        // pageCountが0の場合は1ページのみと判断
        const totalPages = data.data.pageCount > 0 ? data.data.pageCount : 1;
        setHasMore(data.data.currentPage < data.data.pageCount);
        setCurrentPage(data.data.currentPage);
      } else {
        setError(data.error?.message || "検索に失敗しました");
      }
    } catch {
      setError("検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const res = await fetch(
        `/api/search/books?query=${encodeURIComponent(query)}&page=${nextPage}`
      );
      const data = (await res.json()) as ApiResponse<SearchResponse>;

      if (data.success && data.data) {
        setResults((prev) => [...prev, ...data.data!.results]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < data.data!.pageCount);
      } else {
        setError(data.error?.message || "読み込みに失敗しました");
      }
    } catch {
      setError("読み込み中にエラーが発生しました");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSelect = async (book: SearchResult) => {
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rakutenBooksId: book.rakutenBooksId,
          title: book.title,
          authors: book.authors,
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          isbn: book.isbn,
          pageCount: book.pageCount,
          description: book.description,
          thumbnailUrl: book.thumbnailUrl,
          rakutenAffiliateUrl: book.rakutenAffiliateUrl,
          status: "unread",
        }),
      });

      const data = (await res.json()) as ApiResponse<{ id: string }>;

      if (data.success && data.data) {
        window.location.href = `/books/${data.data.id}`;
      } else {
        alert(data.error?.message || "登録に失敗しました");
      }
    } catch {
      alert("登録中にエラーが発生しました");
    }
  };

  return (
    <div class="space-y-6">
      <div class="flex gap-3">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              class="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="タイトルまたはISBNで検索"
            class="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-shadow"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          class="px-6 py-3 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap"
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </div>
      
      {error && (
        <div class="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
          <svg
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map((book) => (
            <div
              key={book.isbn || book.title}
              class="flex gap-4 p-4 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors group"
            >
              <div class="shrink-0 w-16 md:w-20">
                {book.thumbnailUrl ? (
                  <img
                    src={book.thumbnailUrl}
                    alt={book.title}
                    class="w-full aspect-2/3 object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <div class="w-full aspect-2/3 bg-zinc-100 rounded-md flex items-center justify-center text-zinc-400 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div class="flex-1 min-w-0 flex flex-col">
                <div class="flex-1">
                  <h4 class="font-bold text-zinc-900 line-clamp-2 mb-1">
                    {book.title}
                  </h4>
                  <p class="text-sm text-zinc-600 mb-1">
                    {book.authors.join(", ")}
                  </p>
                  <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                    {book.publisher && <span>{book.publisher}</span>}
                    {book.publishedDate && <span>{book.publishedDate}</span>}
                  </div>
                </div>

                <div class="mt-4 flex items-center justify-between">
                  <span class="text-xs font-mono text-zinc-400">
                    {book.isbn ? `ISBN: ${book.isbn}` : ""}
                  </span>
                  <button
                    onClick={() => handleSelect(book)}
                    class="px-4 py-2 text-sm font-bold bg-zinc-100 text-zinc-900 rounded-lg hover:bg-zinc-200 transition-colors"
                  >
                    本棚に追加
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div class="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            class="px-6 py-3 bg-zinc-100 text-zinc-900 font-bold rounded-lg hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? "読み込み中..." : "もっと見る"}
          </button>
        </div>
      )}

      {results.length === 0 && query && !loading && !error && (
        <div class="text-center py-12">
          <p class="text-zinc-500">検索結果が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}
