import { createRoute } from "honox/factory";
import { requirePageAuth, getSidebarExpanded } from "../lib/page-auth";
import { Layout } from "../components/layout/Layout";
import { Input, Textarea, Label } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

export default createRoute(async (c) => {
  const authResult = await requirePageAuth(c);
  if (authResult instanceof Response) {
    return authResult;
  }
  const user = authResult;
  const sidebarExpanded = getSidebarExpanded(c);

  return c.render(
    <Layout user={user} title="設定" sidebarExpanded={sidebarExpanded}>
      <div class="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div class="border-b border-zinc-100 pb-8">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
            設定
          </h1>
          <p class="text-zinc-500">プロフィールとアカウント設定の管理</p>
        </div>

        {/* Profile Section */}
        <section class="grid md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <div>
            <h2 class="text-lg font-bold text-zinc-900 mb-2">プロフィール</h2>
            <p class="text-sm text-zinc-500 leading-relaxed">
              公開プロフィールに表示される情報です。
              <br />
              他のユーザーも閲覧できます。
            </p>
          </div>

          <form id="profile-form" class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100 space-y-8">
            <div class="flex items-center gap-6 pb-6 border-b border-zinc-50">
              <Avatar
                src={user.avatar_url}
                alt={user.name}
                size="xl"
                class="w-20 h-20 ring-4 ring-zinc-50"
              />
              <div class="flex-1">
                <p class="text-sm font-bold text-zinc-900 mb-1">
                  プロフィール画像
                </p>
                <p class="text-xs text-zinc-500">
                  {user.provider === "github" ? "GitHub" : "Google"}
                  のアカウント写真を使用中
                </p>
              </div>
            </div>

            <div class="space-y-6">
              <div>
                <Label for="username" class="mb-2 block text-sm font-bold text-zinc-700">ユーザーID</Label>
                <div class="flex rounded-xl shadow-sm ring-1 ring-zinc-200 overflow-hidden">
                  <span class="inline-flex items-center px-4 border-r border-zinc-200 bg-zinc-50 text-zinc-500 text-sm font-medium">
                    gidoku.com/@
                  </span>
                  <Input
                    name="username"
                    value={user.username}
                    class="rounded-none border-0 focus:ring-0 bg-white"
                  />
                </div>
              </div>

              <div>
                <Label for="name" class="mb-2 block text-sm font-bold text-zinc-700">表示名</Label>
                <Input name="name" value={user.name} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
              </div>

              <div>
                <Label for="bio" class="mb-2 block text-sm font-bold text-zinc-700">自己紹介</Label>
                <Textarea name="bio" value={user.bio || ""} rows={4} class="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white transition-colors" />
                <p class="mt-2 text-xs text-zinc-500 font-medium">
                  簡単な自己紹介を書いてください。
                </p>
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-zinc-50">
              <Button
                type="button"
                class="rounded-full px-6 py-2.5 font-bold shadow-sm"
                onClick={`
                  const form = document.getElementById('profile-form');
                  const btn = this;
                  const originalText = btn.innerText;
                  btn.innerText = '保存中...';
                  btn.disabled = true;

                  const formData = new FormData(form);
                  const data = {
                    username: formData.get('username'),
                    name: formData.get('name'),
                    bio: formData.get('bio') || null
                  };
                  fetch('/api/users/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                  }).then(async r => {
                    if (r.ok) {
                      btn.innerText = '保存しました';
                      setTimeout(() => {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        location.reload();
                      }, 1000);
                    } else {
                      const d = await r.json();
                      alert(d.error?.message || '保存に失敗しました');
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
        </section>

        <hr class="border-zinc-100" />

        {/* Account Section */}
        <section class="grid md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <div>
            <h2 class="text-lg font-bold text-zinc-900 mb-2">アカウント</h2>
            <p class="text-sm text-zinc-500 leading-relaxed">
              アカウントの基本情報と連携設定。
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100 space-y-8">
            <div class="grid gap-6">
              <div>
                <Label for="email" class="mb-2 block text-sm font-bold text-zinc-700">メールアドレス</Label>
                <Input
                  name="email"
                  value={user.email}
                  disabled
                  class="bg-zinc-50/50 rounded-xl border-zinc-200 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <Label for="provider" class="mb-2 block text-sm font-bold text-zinc-700">連携アカウント</Label>
                <div class="flex items-center gap-3 p-4 border border-zinc-200 rounded-xl bg-zinc-50/50">
                  {user.provider === "github" ? (
                    // GitHub icon
                    <svg
                      class="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  ) : (
                    // Google icon
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span class="text-sm font-bold text-zinc-700">
                    {user.provider === "github" ? "GitHub" : "Google"}で連携済み
                  </span>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-zinc-50">
              <Button
                type="button"
                variant="danger"
                class="bg-red-50 text-red-600 hover:bg-red-100 shadow-none border border-red-100 rounded-full px-6 font-bold"
                onClick={`
                  if (confirm('ログアウトしますか？')) {
                    fetch('/api/auth/logout', {
                      method: 'POST'
                    }).then(r => {
                      if (r.ok) {
                        window.location.href = '/login';
                      } else {
                        alert('ログアウトに失敗しました');
                      }
                    });
                  }
                `}
              >
                ログアウト
              </Button>
            </div>
          </div>
        </section>

        <hr class="border-zinc-100" />

        {/* Credits Section */}
        <section class="grid md:grid-cols-[240px_1fr] gap-8 md:gap-12 items-start">
          <div>
            <h2 class="text-lg font-bold text-zinc-900 mb-2">クレジット</h2>
            <p class="text-sm text-zinc-500 leading-relaxed">
              このサービスで使用している素材やライブラリの提供元。
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-zinc-100">
            <div class="space-y-4">
              <div>
                <p class="text-sm font-bold text-zinc-700 mb-2">アイコン</p>
                <a
                  href="https://lordicon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-zinc-500 hover:underline transition-colors"
                  onmouseenter="this.style.color='#0cc18a'"
                  onmouseleave="this.style.color=''"
                >
                  Icons by Lordicon.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
});
