import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../../lib/page-auth";
import { Layout } from "../../../components/layout/Layout";
import { Input, Textarea, Label } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { bookRepo } from "../../../server/db/repositories";

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

  const authors = JSON.parse(book.authors) as string[];

  return c.render(
    <Layout user={user} title={`${book.title}を編集`} sidebarExpanded={sidebarExpanded}>
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="pb-4 border-b border-zinc-100">
          <div class="flex items-center gap-2 mb-4">
            <a
              href={`/books/${id}`}
              class="text-sm font-bold text-zinc-500 hover:text-blue-600 transition-colors inline-flex items-center"
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              キャンセルして戻る
            </a>
          </div>
          <h1 class="text-3xl font-bold text-zinc-900 tracking-tight">書籍情報を編集</h1>
        </div>

        <form id="edit-form" class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100 space-y-8">
          <div class="space-y-6">
            <div>
              <Label for="title" required class="mb-2 block text-sm font-bold text-zinc-700">
                タイトル
              </Label>
              <Input name="title" required value={book.title} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
            </div>

            <div>
              <Label for="authors" required class="mb-2 block text-sm font-bold text-zinc-700">
                著者
              </Label>
              <Input
                name="authors"
                required
                value={authors.join(", ")}
                placeholder="著者名（複数の場合はカンマ区切り）"
                class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <Label for="publisher" class="mb-2 block text-sm font-bold text-zinc-700">出版社</Label>
                <Input name="publisher" value={book.publisher || ""} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <Label for="isbn" class="mb-2 block text-sm font-bold text-zinc-700">ISBN</Label>
                <Input name="isbn" value={book.isbn || ""} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <Label for="pageCount" class="mb-2 block text-sm font-bold text-zinc-700">ページ数</Label>
                <Input type="number" name="pageCount" value={book.page_count} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <Label for="publishedDate" class="mb-2 block text-sm font-bold text-zinc-700">出版日</Label>
                <Input
                  name="publishedDate"
                  value={book.published_date || ""}
                  placeholder="YYYY-MM-DD"
                  class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <Label for="description" class="mb-2 block text-sm font-bold text-zinc-700">概要</Label>
              <Textarea
                name="description"
                value={book.description || ""}
                rows={6}
                class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <Label for="thumbnailUrl" class="mb-2 block text-sm font-bold text-zinc-700">表紙画像URL</Label>
              <Input
                name="thumbnailUrl"
                value={book.thumbnail_url || ""}
                placeholder="https://..."
                class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-zinc-100">
            <a
              href={`/books/${id}`}
              class="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2"
            >
              キャンセル
            </a>
            <Button
              type="button"
              class="rounded-full px-8 py-2.5 font-bold shadow-sm"
              onClick={`
                const form = document.getElementById('edit-form');
                const btn = this;
                const originalText = btn.innerText;
                btn.innerText = '保存中...';
                btn.disabled = true;

                const formData = new FormData(form);
                const data = {
                  title: formData.get('title'),
                  authors: formData.get('authors').split(',').map(a => a.trim()),
                  publisher: formData.get('publisher') || null,
                  isbn: formData.get('isbn') || null,
                  pageCount: parseInt(formData.get('pageCount')) || 0,
                  publishedDate: formData.get('publishedDate') || null,
                  description: formData.get('description') || null,
                  thumbnailUrl: formData.get('thumbnailUrl') || null
                };
                fetch('/api/books/${id}', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                }).then(async r => {
                  if (r.ok) {
                    location.href = '/books/${id}';
                  } else {
                    const d = await r.json();
                    alert(d.error?.message || '更新に失敗しました');
                    btn.innerText = originalText;
                    btn.disabled = false;
                  }
                });
              `}
            >
              変更を保存
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
});
