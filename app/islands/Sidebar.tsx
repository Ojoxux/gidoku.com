import { useState } from "hono/jsx/dom";

const SIDEBAR_STORAGE_KEY = "sidebar-expanded";
const SIDEBAR_COOKIE_NAME = "sidebar_expanded";

interface SidebarProps {
  initialExpanded?: boolean;
}

export default function Sidebar({ initialExpanded = false }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const navItems = [
    {
      href: "/",
      label: "ホーム",
      iconSrc: "/icons/home-white-icon.json",
      targetClass: "nav-home",
    },
    {
      href: "/books",
      label: "自分の本棚",
      iconSrc: "/icons/book-white-icon.json",
      targetClass: "nav-books",
    },
    {
      href: "/settings",
      label: "設定",
      iconSrc: "/icons/settings-white-icon.json",
      targetClass: "nav-settings",
    },
  ];

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=31536000`;
  };

  const handleLogout = () => {
    if (confirm("ログアウトしますか？")) {
      fetch("/api/auth/logout", {
        method: "POST",
      }).then((r) => {
        if (r.ok) {
          window.location.href = "/login";
        } else {
          alert("ログアウトに失敗しました");
        }
      });
    }
  };

  return (
    <aside
      class={`h-screen sticky top-0 bg-zinc-900 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${
        isExpanded ? "w-64" : "w-20"
      }`}
    >
      <div class="h-20 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        {isExpanded ? (
          <>
            <a href="/" class="flex items-center min-w-0 overflow-hidden">
              <span
                class={`text-3xl tracking-tight text-white whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded ? "opacity-100 delay-150" : "opacity-0"
                }`}
                style={{
                  fontFamily: '"Cormorant Garamond", "Garamond", serif',
                }}
              >
                gidoku
              </span>
            </a>
            <button
              onClick={toggleSidebar}
              class="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors shrink-0"
              title="サイドバーを閉じる"
              aria-label="サイドバーを閉じる"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 19l-7-7 7-7" />
                <path d="M18 5v14" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            class="w-12 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors mx-auto"
            title="サイドバーを開く"
            aria-label="サイドバーを開く"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M13 5l7 7-7 7" />
              <path d="M6 5v14" />
            </svg>
          </button>
        )}
      </div>

      {/* ナビゲーション */}
      <nav class="flex-1 py-6 px-3 overflow-hidden">
        <div class="flex flex-col gap-1">
          {navItems.map((item) => (
            <a
              href={item.href}
              class={`${
                item.targetClass
              } flex items-center gap-5 px-4 py-3 hover:bg-zinc-800 rounded-xl transition-colors group ${
                isExpanded ? "justify-start" : "justify-center"
              }`}
            >
              <span class="min-w-[24px] flex items-center justify-center shrink-0">
                <lord-icon
                  src={item.iconSrc}
                  trigger="hover"
                  target={`.${item.targetClass}`}
                  colors="primary:#f4f4f5"
                  style="width:24px;height:24px"
                />
              </span>
              {isExpanded && (
                <span
                  class={`text-md font-normal text-zinc-100 group-hover:text-white whitespace-nowrap transition-opacity duration-300 ${
                    isExpanded ? "opacity-100 delay-150" : "opacity-0"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </a>
          ))}
        </div>
      </nav>

      {/* ログアウトボタン */}
      <div class="p-3 border-t border-zinc-800 shrink-0">
        <button
          onClick={handleLogout}
          class={`flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
          title="ログアウト"
          aria-label="ログアウト"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="min-w-[20px] shrink-0"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {isExpanded && (
            <span
              class={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                isExpanded ? "opacity-100 delay-150" : "opacity-0"
              }`}
            >
              ログアウト
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
