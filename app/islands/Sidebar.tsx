import { useState, useEffect } from "hono/jsx/dom";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

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
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: "/books",
      label: "自分の本棚",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: "設定",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
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
      style="box-shadow: 0 0 40px rgba(0, 0, 0, 0.15)"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        class="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:scale-110 transition-all cursor-pointer z-50 border border-zinc-50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={`transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div class="h-24 flex items-center justify-center">
        <a href="/" class="flex items-center gap-2">
          <span
            class="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-2xl pb-0.5 shadow-lg shadow-zinc-900/20"
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
      </div>

      <nav class="flex-1 py-4 flex flex-col gap-2 px-3">
        {navItems.map((item) => (
          <a
            href={item.href}
            class={`flex items-center gap-4 px-3 py-3.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all group ${
              isExpanded ? "justify-start" : "justify-center"
            }`}
          >
            <span class="min-w-[24px] group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </span>
            {isExpanded && (
              <span class="font-medium whitespace-nowrap overflow-hidden text-sm">
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
