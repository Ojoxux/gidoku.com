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
      <div class="max-w-8xl mx-auto space-y-8">
        <div class="border-b border-zinc-100 pb-6">
          <a
            href={`/books/${id}`}
            class="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors mb-4 inline-block"
          >
            ← キャンセルして戻る
          </a>
          <h1 class="text-3xl font-bold text-zinc-900">書籍情報を編集</h1>
        </div>

        <form id="edit-form" class="space-y-8">
          <div class="space-y-6">
            <div>
              <Label for="title" required>
                タイトル
              </Label>
              <Input name="title" required value={book.title} />
            </div>

            <div>
              <Label for="authors" required>
                著者
              </Label>
              <Input
                name="authors"
                required
                value={authors.join(", ")}
                placeholder="著者名（複数の場合はカンマ区切り）"
              />
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <Label for="publisher">出版社</Label>
                <Input name="publisher" value={book.publisher || ""} />
              </div>
              <div>
                <Label for="isbn">ISBN</Label>
                <Input name="isbn" value={book.isbn || ""} />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div>
                <Label for="pageCount">ページ数</Label>
                <Input type="number" name="pageCount" value={book.page_count} />
              </div>
              <div>
                <Label for="publishedDate">出版日</Label>
                <Input
                  name="publishedDate"
                  value={book.published_date || ""}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div>
              <Label for="description">概要</Label>
              <Textarea
                name="description"
                value={book.description || ""}
                rows={6}
              />
            </div>

            <div>
              <Label for="thumbnailUrl">表紙画像URL</Label>
              <Input
                name="thumbnailUrl"
                value={book.thumbnail_url || ""}
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-zinc-100">
            <a
              href={`/books/${id}`}
              class="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              キャンセル
            </a>
            <Button
              type="button"
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
