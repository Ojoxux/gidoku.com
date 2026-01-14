import { createRoute } from "honox/factory";
import { getPageUser } from "../lib/page-auth";

export default createRoute(async (c) => {
  const user = await getPageUser(c);

  // すでにログイン済みの場合はダッシュボードへ
  if (user) {
    return c.redirect("/");
  }

  const error = c.req.query("error");

  return c.render(
    <>
      <title>ログイン | gidoku</title>
      <div class="flex min-h-screen w-full bg-[#fbfbfd]">
        {/* Centered Login Card */}
        <div class="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 py-12">
          <div class="w-full max-w-[400px] mx-auto space-y-8 bg-white p-8 sm:p-12 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-white/50">
            <div class="text-center space-y-2">
              <h1 class="text-4xl font-bold tracking-tight text-zinc-900 mb-2">
                gidoku
              </h1>
              <h2 class="text-lg font-medium text-zinc-900">
                読書記録をはじめましょう
              </h2>
            </div>

            {error && (
              <div class="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center justify-center">
                ログインに失敗しました
              </div>
            )}

            <div class="space-y-3">
              <a
                href="/api/auth/google"
                class="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-zinc-50 text-zinc-900 hover:bg-zinc-100 transition-all duration-200 rounded-xl group border border-zinc-200 font-medium relative overflow-hidden"
              >
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span class="text-sm">Googleで続ける</span>
              </a>

              <a
                href="/api/auth/github"
                class="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-zinc-900 text-white hover:bg-zinc-800 transition-all duration-200 rounded-xl group shadow-md hover:shadow-lg font-medium"
              >
                <svg
                  class="w-5 h-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span class="text-sm">GitHubで続ける</span>
              </a>
            </div>
          </div>
          <div class="mt-8 text-center text-xs text-zinc-400 font-medium">
            &copy; 2025 gidoku.com
          </div>
        </div>
      </div>
    </>
  );
});
