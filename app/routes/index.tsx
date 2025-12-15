import { createRoute } from "honox/factory";
import { getPageUser } from "../lib/page-auth";
import { Layout } from "../components/layout/Layout";
import { BookList } from "../components/book/BookList";
import { Card, CardBody } from "../components/ui/Card";
import { bookRepo } from "../server/db/repositories";
import { BookCover } from "../components/book/BookCover";
import { ProgressBar } from "../components/ui/ProgressBar";
import type { Book } from "../types/database";

export default createRoute(async (c) => {
  const user = await getPageUser(c);

  // 未ログインの場合はランディングページ
  if (!user) {
    return c.render(
      <Layout>
        <div class="max-w-4xl mx-auto px-6 py-24 sm:py-32 text-center">
          <div class="mb-8 flex justify-center">
            <span class="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center text-4xl font-serif italic">
              g
            </span>
          </div>
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-8">
            技術書を読む、
            <br class="sm:hidden" />
            記録する、
            <br class="sm:hidden" />
            成長する。
          </h1>
          <p class="text-lg text-zinc-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            積読を消化し、学習の軌跡を可視化しましょう。
            <br class="hidden sm:inline" />
            gidokuは、エンジニアのためのミニマルな読書管理ツールです。
          </p>
          <a
            href="/login"
            class="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all hover:scale-105 shadow-lg shadow-zinc-900/10"
          >
            無料で始める
          </a>

          <div class="mt-32 grid md:grid-cols-3 gap-12 text-left">
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 class="text-base font-bold text-zinc-900">
                スマートな蔵書管理
              </h3>
              <p class="text-sm text-zinc-600 leading-relaxed">
                楽天ブックスAPI連携により、タイトルやISBNから瞬時に書籍を登録。面倒な入力作業から解放されます。
              </p>
            </div>
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 class="text-base font-bold text-zinc-900">進捗の可視化</h3>
              <p class="text-sm text-zinc-600 leading-relaxed">
                ページ単位で読書の進み具合を記録。積読・読書中・読了のステータス管理で、学習のモチベーションを維持します。
              </p>
            </div>
            <div class="space-y-4">
              <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <h3 class="text-base font-bold text-zinc-900">
                プロフィール公開
              </h3>
              <p class="text-sm text-zinc-600 leading-relaxed">
                あなたの技術書コレクションをプロフィールとして公開。学習履歴をアピールし、同じ興味を持つ人と繋がれます。
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ログイン済みの場合はダッシュボード
  const stats = await bookRepo.getStats(c.env.DB, user.id);

  const { books: readingBooks } = await bookRepo.findByUserId(
    c.env.DB,
    user.id,
    {
      status: "reading",
      limit: 6,
      offset: 0,
    }
  );

  const { books: recentBooks } = await bookRepo.findByUserId(
    c.env.DB,
    user.id,
    {
      sortBy: "updated",
      limit: 6,
      offset: 0,
    }
  );

  const formatBooks = (books: Book[]) =>
    books.map((book) => ({
      id: book.id,
      title: book.title,
      authors: JSON.parse(book.authors),
      publisher: book.publisher,
      thumbnailUrl: book.thumbnail_url,
      status: book.status,
      currentPage: book.current_page,
      pageCount: book.page_count,
    }));

  const formattedReadingBooks = formatBooks(readingBooks);

  return c.render(
    <Layout user={user} title="ホーム">
      <div class="space-y-16">
        {/* ヘッダーセクション */}
        <div class="flex flex-col md:flex-row gap-12 items-end border-b border-zinc-900 pb-12">
          <div class="flex-1">
            <div class="text-5xl md:text-7xl leading-[1.1] text-zinc-900 tracking-tight">
              <span style={{ fontFamily: '"Arial", sans-serif' }}>Hello,</span>{" "}
              <span
                class="border-b-[3px] md:border-b-4 border-zinc-900 pb-1"
                style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
              >
                {user.name}
              </span>
              .
              <br />
              <span
                style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
              >
                You have
              </span>{" "}
              <span
                class="border-b-[3px] md:border-b-4 border-zinc-900 pb-1"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                {stats?.reading ?? 0} active books
              </span>
              .
            </div>
          </div>
        </div>

        {/* 読んでいる本のリスト */}
        {formattedReadingBooks.length > 0 && (
          <section>
            <div class="flex items-baseline justify-between mb-8 border-b border-zinc-200 pb-4">
              <h2
                class="text-3xl font-bold tracking-tight text-zinc-900"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                読んでいる本
              </h2>
              <a
                href="/books?status=reading"
                class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                style={{ fontFamily: '"Arial", sans-serif' }}
              >
                すべて見る
              </a>
            </div>

            <div class="grid md:grid-cols-[1.5fr_1fr] gap-8">
              {/* 最新の読書本 */}
              <a
                href={`/books/${formattedReadingBooks[0].id}`}
                class="group bg-white border border-zinc-200 rounded-none p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 hover:border-zinc-900 transition-colors duration-300"
              >
                <div class="shrink-0 mx-auto sm:mx-0 shadow-sm rounded-sm overflow-hidden bg-zinc-100">
                  <BookCover
                    src={formattedReadingBooks[0].thumbnailUrl}
                    alt={formattedReadingBooks[0].title}
                    size="lg"
                  />
                </div>
                <div class="flex flex-col justify-center flex-1 min-w-0">
                  <div class="mb-6">
                    <h3
                      class="text-2xl font-bold text-zinc-900 mb-2 line-clamp-2 leading-tight group-hover:underline decoration-2 underline-offset-4"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {formattedReadingBooks[0].title}
                    </h3>
                    <p
                      class="text-zinc-500 text-sm line-clamp-1"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {formattedReadingBooks[0].authors.join(", ")}
                    </p>
                  </div>

                  {formattedReadingBooks[0].pageCount > 0 && (
                    <div class="space-y-3">
                      <div class="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-900">
                        <span style={{ fontFamily: '"Arial", sans-serif' }}>
                          Progress
                        </span>
                        <span style={{ fontFamily: '"Arial", sans-serif' }}>
                          {Math.round(
                            (formattedReadingBooks[0].currentPage /
                              formattedReadingBooks[0].pageCount) *
                              100
                          )}
                          %
                        </span>
                      </div>
                      <div class="h-2 w-full bg-zinc-100 overflow-hidden">
                        <div
                          class="h-full bg-zinc-900 transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(
                              100,
                              (formattedReadingBooks[0].currentPage /
                                formattedReadingBooks[0].pageCount) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <p
                        class="text-xs text-zinc-500 text-right pt-1"
                        style={{ fontFamily: '"Arial", sans-serif' }}
                      >
                        {formattedReadingBooks[0].currentPage} /{" "}
                        {formattedReadingBooks[0].pageCount} pages
                      </p>
                    </div>
                  )}
                </div>
              </a>

              {/* 他に読んでいる本のリスト */}
              {formattedReadingBooks.length > 1 && (
                <div class="flex flex-col border-t border-zinc-100">
                  {formattedReadingBooks.slice(1, 4).map((book) => (
                    <a
                      href={`/books/${book.id}`}
                      class="flex items-center gap-4 py-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors group px-2"
                    >
                      <div class="shrink-0 w-10 h-14 bg-zinc-100 rounded-sm shadow-sm overflow-hidden opacity-90 group-hover:opacity-100 transition-opacity">
                        <BookCover
                          src={book.thumbnailUrl}
                          alt={book.title}
                          size="sm"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4
                          class="font-bold text-sm text-zinc-900 truncate group-hover:underline decoration-1 underline-offset-2"
                          style={{ fontFamily: '"Arial", sans-serif' }}
                        >
                          {book.title}
                        </h4>
                        <div class="flex items-center gap-3 mt-2">
                          <div class="flex-1 h-1 bg-zinc-100 overflow-hidden">
                            <div
                              class="h-full bg-zinc-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (book.currentPage / book.pageCount) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <span
                            class="text-[10px] font-bold text-zinc-500 tabular-nums"
                            style={{ fontFamily: '"Arial", sans-serif' }}
                          >
                            {Math.round(
                              (book.currentPage / book.pageCount) * 100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                  {formattedReadingBooks.length > 4 && (
                    <a
                      href="/books?status=reading"
                      class="text-xs font-medium text-zinc-500 hover:text-zinc-900 text-center py-4"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      +{formattedReadingBooks.length - 4} more books
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <div class="flex items-baseline justify-between mb-8 border-b border-zinc-200 pb-4">
            <h2
              class="text-3xl font-bold tracking-tight text-zinc-900"
              style={{ fontFamily: '"Arial", sans-serif' }}
            >
              最近の読書
            </h2>
            <a
              href="/books"
              class="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              style={{ fontFamily: '"Arial", sans-serif' }}
            >
              すべて見る
            </a>
          </div>
          {recentBooks.length > 0 ? (
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {formatBooks(recentBooks).map((book) => (
                <a href={`/books/${book.id}`} class="group flex flex-col gap-3">
                  <div class="aspect-2/3 w-full bg-zinc-100 rounded-sm overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                    <BookCover
                      src={book.thumbnailUrl}
                      alt={book.title}
                      size="md"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3
                      class="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:underline decoration-1 underline-offset-2"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {book.title}
                    </h3>
                    <p
                      class="text-xs text-zinc-500 mt-1 line-clamp-1"
                      style={{ fontFamily: '"Arial", sans-serif' }}
                    >
                      {book.authors.join(", ")}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <Card>
              <CardBody class="text-center py-16">
                <div class="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <p
                  class="text-zinc-500 mb-6 font-medium"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  読書記録をはじめましょう
                </p>
                <a
                  href="/books/new"
                  class="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm rounded-sm"
                  style={{ fontFamily: '"Arial", sans-serif' }}
                >
                  本を追加する
                </a>
              </CardBody>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
});
