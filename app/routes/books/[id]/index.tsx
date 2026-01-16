import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../../lib/page-auth";
import { Layout } from "../../../components/layout/Layout";
import { StatusBadge, Badge } from "../../../components/ui/Badge";
import { BookCover } from "../../../components/book/BookCover";
import { Button } from "../../../components/ui/Button";
import { bookRepo, bookTagRepo } from "../../../server/db/repositories";
import ProgressSlider from "../../../islands/ProgressSlider";
import StatusToggle from "../../../islands/StatusToggle";
import MemoEditor from "../../../islands/MemoEditor";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);

  const id = c.req.param("id")!;

  let book;
  try {
    book = await bookRepo.findById(c.env.DB, id, user.id);
  } catch {
    return c.redirect("/books");
  }

  const tags = await bookTagRepo.findTagsByBookId(c.env.DB, id);
  const authors = JSON.parse(book.authors) as string[];

  return c.render(
    <Layout user={user} title={book.title} sidebarExpanded={sidebarExpanded}>
      <div class="max-w-6xl mx-auto space-y-12">
        {/* Navigation */}
        <div class="flex items-center justify-between pb-6">
          <a
            href="/books"
            class="group inline-flex items-center text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors"
          >
            <svg
              class="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            本棚に戻る
          </a>
          <div class="flex items-center gap-3">
            <a
              href={`/books/${book.id}/edit`}
              class="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors px-4 py-2 bg-white rounded-full border border-zinc-200 hover:bg-zinc-50 shadow-sm"
            >
              編集
            </a>
            <Button
              variant="danger"
              size="sm"
              class="bg-white text-red-600 hover:bg-red-50 border border-red-100 font-bold rounded-full shadow-sm"
              onClick={`if(confirm('この本を削除しますか？')) { fetch('/api/books/${book.id}', { method: 'DELETE' }).then(() => location.href = '/books') }`}
            >
              削除
            </Button>
          </div>
        </div>

        <div class="grid md:grid-cols-[300px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left Column: Cover & Actions */}
          <div class="space-y-6 md:sticky md:top-8">
            <div class="aspect-2/3 w-full bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5">
              <BookCover
                src={book.thumbnail_url}
                alt={book.title}
                size="lg"
                class="w-full h-full object-cover"
              />
            </div>

            <div class="space-y-4 flex flex-col">
              <div class="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-zinc-100">
                <StatusToggle bookId={book.id} currentStatus={book.status} />
              </div>

              {book.rakuten_affiliate_url && (
                <a
                  href={book.rakuten_affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-white bg-[#bf0000] rounded-xl hover:bg-[#a00000] transition-colors shadow-sm"
                >
                  <span class="mr-2">楽天ブックスで見る</span>
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Details */}
          <div class="space-y-12">
            {/* Header Info */}
            <div class="space-y-6">
              <div class="flex flex-wrap gap-2">
                <StatusBadge status={book.status} />
                {tags.map((tag) => (
                  <Badge key={tag.id} class="bg-zinc-100 text-zinc-600 border-zinc-200">{tag.name}</Badge>
                ))}
              </div>

              <div>
                <h1 class="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight mb-4 tracking-tight">
                  {book.title}
                </h1>
                <div class="text-lg text-zinc-600 space-y-2">
                  <p class="font-medium text-zinc-800">{authors.join(", ")}</p>
                  {book.publisher && (
                    <p class="text-sm text-zinc-500">
                      {book.publisher} <span class="mx-1">・</span> {book.published_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <section class="bg-white rounded-[24px] p-8 shadow-sm ring-1 ring-zinc-100">
              <h2 class="text-lg font-bold text-zinc-900 mb-6">読書進捗</h2>
              <ProgressSlider
                bookId={book.id}
                initialPage={book.current_page}
                totalPages={book.page_count}
              />
            </section>

            {/* Description */}
            {book.description && (
              <section>
                <h2 class="text-xl font-bold text-zinc-900 mb-4">概要</h2>
                <div class="prose prose-zinc max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </div>
              </section>
            )}

            {/* Metadata */}
            {book.isbn && (
              <div class="pt-8 border-t border-zinc-100">
                <dl class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                  <div>
                    <dt class="text-zinc-400 mb-1 font-bold text-xs uppercase tracking-wider">ISBN</dt>
                    <dd class="font-mono text-zinc-900">{book.isbn}</dd>
                  </div>
                  {book.page_count > 0 && (
                    <div>
                      <dt class="text-zinc-400 mb-1 font-bold text-xs uppercase tracking-wider">ページ数</dt>
                      <dd class="font-mono text-zinc-900">
                        {book.page_count}ページ
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Memo Section */}
            <section class="pt-8 border-t border-zinc-100">
              <h2 class="text-xl font-bold text-zinc-900 mb-6">読書メモ</h2>
              <div class="bg-[#fbfbfd] rounded-2xl p-1 shadow-inner">
                 <MemoEditor bookId={book.id} initialMemo={book.memo || ""} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
});
