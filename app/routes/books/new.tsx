import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../lib/page-auth";
import { Layout } from "../../components/layout/Layout";
import { Input, Textarea, Label } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import BookSearchForm from "../../islands/BookSearchForm";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);

  return c.render(
    <Layout user={user} title="本を追加" sidebarExpanded={sidebarExpanded}>
      <div class="max-w-4xl mx-auto space-y-12">
        <div class="text-center pb-4">
          <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 mb-3 tracking-tight">
            本を追加する
          </h1>
          <p class="text-zinc-500">新しい本をライブラリに追加します。</p>
        </div>

        {/* Search Section */}
        <section class="space-y-6">
          <div class="text-center">
            <h2 class="text-lg font-bold text-zinc-900 mb-1">
              検索して追加
            </h2>
            <p class="text-sm text-zinc-500">
              タイトルやISBNで検索して、書籍情報を自動入力できます。
            </p>
          </div>
          <div class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100">
            <BookSearchForm />
          </div>
        </section>

        <div class="relative">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-zinc-200"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-[#fbfbfd] px-4 text-sm font-medium text-zinc-400">または</span>
          </div>
        </div>

        {/* Manual Entry Section */}
        <section class="space-y-8">
          <div class="text-center">
            <h2 class="text-lg font-bold text-zinc-900 mb-1">
              手動で追加
            </h2>
            <p class="text-sm text-zinc-500">
              検索で見つからない場合は手動で入力してください。
            </p>
          </div>

          <form method="post" action="/api/books" class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100 space-y-8">
            <div class="space-y-6">
              <div>
                <Label for="title" required class="mb-2 block text-sm font-bold text-zinc-700">
                  タイトル
                </Label>
                <Input name="title" required placeholder="本のタイトル" class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
              </div>

              <div>
                <Label for="authors" required class="mb-2 block text-sm font-bold text-zinc-700">
                  著者
                </Label>
                <Input
                  name="authors"
                  required
                  placeholder="著者名（複数の場合はカンマ区切り）"
                  class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
                />
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <Label for="publisher" class="mb-2 block text-sm font-bold text-zinc-700">出版社</Label>
                  <Input name="publisher" placeholder="出版社名" class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
                </div>
                <div>
                  <Label for="isbn" class="mb-2 block text-sm font-bold text-zinc-700">ISBN</Label>
                  <Input name="isbn" placeholder="ISBN-10 or ISBN-13" class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <Label for="pageCount" class="mb-2 block text-sm font-bold text-zinc-700">ページ数</Label>
                  <Input
                    type="number"
                    name="pageCount"
                    placeholder="総ページ数"
                    class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <Label for="status" class="mb-2 block text-sm font-bold text-zinc-700">ステータス</Label>
                  <div class="relative">
                    <select
                      name="status"
                      class="w-full appearance-none px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-zinc-50 focus:bg-white text-zinc-900 transition-colors"
                    >
                      <option value="unread">積読</option>
                      <option value="reading">読書中</option>
                      <option value="completed">読了</option>
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label for="memo" class="mb-2 block text-sm font-bold text-zinc-700">メモ</Label>
                <Textarea
                  name="memo"
                  placeholder="読書のきっかけなど（任意）"
                  rows={4}
                  class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-4 pt-4">
              <a
                href="/books"
                class="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-4 py-2"
              >
                キャンセル
              </a>
              <Button type="submit" class="rounded-full px-8 py-2.5 font-bold shadow-sm">登録する</Button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
});
