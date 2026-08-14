import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../../lib/page-auth";
import { Layout } from "../../../components/layout/Layout";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);
  const bookId = c.req.query("id");

  return c.render(
    <Layout user={user} title="登録完了" sidebarExpanded={sidebarExpanded}>
      <div class="min-h-[70vh] flex items-center justify-center">
        <div class="max-w-xl mx-auto text-center space-y-6">
          <lord-icon
            src="/icons/success-icon.json"
            trigger="in"
            style="width:112px;height:112px"
            class="mx-auto"
          />

          <div class="space-y-2">
            <h1 class="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
              書籍を登録しました
            </h1>
            <p class="text-zinc-500 text-lg">本棚から登録した本を確認できます。</p>
          </div>

          <div class="flex items-center justify-center gap-3">
            {bookId && (
              <a
                href={`/books/${bookId}`}
                class="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-zinc-900 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 transition-all shadow-sm"
              >
                詳細を見る
              </a>
            )}
            <a
              href="/books"
              class="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-sm"
            >
              本棚へ戻る
            </a>
          </div>
        </div>
      </div>
    </Layout>,
  );
});
