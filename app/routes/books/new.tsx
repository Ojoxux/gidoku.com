import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../../lib/page-auth";
import { Layout } from "../../components/layout/Layout";
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
          <p class="text-zinc-500">タイトルやISBNで検索して、新しい本をライブラリに追加します。</p>
        </div>

        {/* Search Section */}
        <section class="space-y-6">
          <div class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100">
            <BookSearchForm />
          </div>
        </section>
      </div>
    </Layout>
  );
});
