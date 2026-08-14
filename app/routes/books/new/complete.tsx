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

  return c.render(
    <Layout user={user} title="登録完了" sidebarExpanded={sidebarExpanded}>
      <div class="max-w-xl mx-auto">
        <div class="bg-white rounded-2xl p-10 shadow-sm ring-1 ring-zinc-100 text-center space-y-6">
          <div class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50">
            <svg
              aria-hidden="true"
              class="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>登録完了</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl font-bold text-zinc-900 tracking-tight">書籍を登録しました</h1>
            <p class="text-zinc-500">本棚から登録した本を確認できます。</p>
          </div>

          <a
            href="/books"
            class="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-zinc-900 rounded-full hover:bg-zinc-800 transition-all shadow-sm"
          >
            本棚へ戻る
          </a>
        </div>
      </div>
    </Layout>,
  );
});
