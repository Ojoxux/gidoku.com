import { useState, useEffect } from "hono/jsx/dom";

const SIDEBAR_STORAGE_KEY = "sidebar-expanded";
const SIDEBAR_COOKIE_NAME = "sidebar_expanded";

interface SidebarProps {
  initialExpanded?: boolean;
}

export default function Sidebar({ initialExpanded = false }: SidebarProps) {
  // SSR で渡された初期値（Cookie から読み取った値）を使う
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    const mainContent = document.getElementById("main-layout");
    if (mainContent) {
      // 左マージンも考慮してパディングを調整
      mainContent.style.paddingLeft = isExpanded ? "288px" : "112px"; // 64(w-20) + 16(left-4) + 32(gap) = 112px, 256 + 16 + 16 = 288px
    }
  }, [isExpanded]);

  const navItems = [
    {
      href: "/",
      label: "ホーム",
      iconSrc: "/icons/home-icon.json",
      targetClass: "nav-home",
    },
    {
      href: "/books",
      label: "自分の本棚",
      iconSrc: "/icons/book-icon.json",
      targetClass: "nav-books",
    },
    {
      href: "/settings",
      label: "設定",
      iconSrc: "/icons/setting-icon.json",
      targetClass: "nav-settings",
    },
  ];

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
      class={`fixed left-4 top-4 bottom-4 bg-white z-50 transition-all duration-300 ease-in-out flex flex-col rounded-[32px] ${
        isExpanded ? "w-64" : "w-20"
      }`}
      style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.15)"
    >
      {/* Header with Logo and Toggle Button */}
      <div class={`h-24 flex items-center px-3 ${isExpanded ? "justify-between" : "justify-center"}`}>
        <a href="/" class="flex items-center gap-2">
          <span
            class="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-2xl pb-0.5"
            style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
          >
            g
          </span>
          {isExpanded && (
            <span
              class="text-4xl tracking-tight text-zinc-900 whitespace-nowrap overflow-hidden"
              style={{ fontFamily: '"Apple Garamond", "Garamond", serif' }}
            >
              gidoku
            </span>
          )}
        </a>
        {isExpanded && (
          <button
            onClick={() => {
              const newState = !isExpanded;
              setIsExpanded(newState);
              localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
              document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=31536000`;
            }}
            class="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-all cursor-pointer"
            title="サイドバーを閉じる"
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
            >
              <path d="M11 19l-7-7 7-7" />
              <path d="M18 5v14" />
            </svg>
          </button>
        )}
      </div>

      {/* Toggle Button when collapsed - shown below logo */}
      {!isExpanded && (
        <div class="flex justify-center px-3 -mt-2">
          <button
            onClick={() => {
              const newState = !isExpanded;
              setIsExpanded(newState);
              localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
              document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=31536000`;
            }}
            class="w-14 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 transition-all cursor-pointer"
            title="サイドバーを開く"
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
            >
              <path d="M13 5l7 7-7 7" />
              <path d="M6 5v14" />
            </svg>
          </button>
        </div>
      )}

      <nav class="flex-1 py-4 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <a
            href={item.href}
            class={`${item.targetClass} flex items-center gap-4 px-3 py-3.5 hover:bg-zinc-50 rounded-2xl transition-all group ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <span class="min-w-[28px] flex items-center justify-center">
              <lord-icon
                src={item.iconSrc}
                trigger="hover"
                target={`.${item.targetClass}`}
                colors="primary:#71717a"
                style="width:28px;height:28px"
              />
            </span>
            {isExpanded && (
              <span class="font-medium whitespace-nowrap overflow-hidden text-sm text-zinc-500 group-hover:text-zinc-900">
                {item.label}
              </span>
            )}
          </a>
        ))}
      </nav>

      <div class="p-4 mb-2">
        <button
          onClick={handleLogout}
          class={`flex items-center gap-4 w-full text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all p-3 ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="min-w-[24px]"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {isExpanded && (
            <span class="font-medium whitespace-nowrap overflow-hidden text-sm">
              ログアウト
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
