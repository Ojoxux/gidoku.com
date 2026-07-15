import { useState, useEffect, useRef } from "hono/jsx/dom";
import { getScrollChromeState } from "../../lib/scroll-chrome";

interface SidebarProps {
  showLogout?: boolean;
}

export default function Sidebar({ showLogout = true }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const visibleRef = useRef(true);

  useEffect(() => {
    const scrollTarget = document.querySelector("main");
    if (!scrollTarget) return;

    const layout = document.getElementById("main-layout");
    const onScroll = () => {
      const st = scrollTarget.scrollTop;
      const { show, scrolledDataset } = getScrollChromeState({
        scrollTop: st,
        lastScrollTop: lastScrollTop.current,
        currentlyShown: visibleRef.current,
      });
      visibleRef.current = show;
      setVisible(show);
      if (layout) layout.dataset.scrolled = scrolledDataset;
      lastScrollTop.current = st;
    };

    scrollTarget.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollTarget.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    {
      href: "/",
      label: "ホーム",
      iconSrc: "/icons/home-white-icon.json",
      targetClass: "mobile-nav-home",
    },
    {
      href: "/books",
      label: "自分の本棚",
      iconSrc: "/icons/book-white-icon.json",
      targetClass: "mobile-nav-books",
    },
    {
      href: "/settings",
      label: "設定",
      iconSrc: "/icons/settings-white-icon.json",
      targetClass: "mobile-nav-settings",
    },
  ];

  const handleLogout = () => {
    if (confirm("ログアウトしますか？")) {
      fetch("/api/auth/logout", { method: "POST" }).then((r) => {
        if (r.ok) {
          window.location.href = "/login";
        } else {
          alert("ログアウトに失敗しました");
        }
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        class={`fixed top-5 left-6 sm:top-6 sm:left-7 z-40 w-10 h-10 rounded-xl bg-white shadow-md border border-zinc-200/60 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
        aria-label="メニューを開く"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <div class="fixed inset-0 z-50 flex">
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
            aria-label="メニューを閉じる"
          />

          <aside class="relative w-72 max-w-[80vw] bg-zinc-950 flex flex-col h-full shadow-2xl animate-slide-in">
            <div class="h-16 flex items-center justify-between px-5 shrink-0 mt-3">
              <a href="/" class="flex items-center">
                <span class="text-2xl font-bold tracking-tight text-white">gidoku</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                class="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                aria-label="メニューを閉じる"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav class="flex-1 py-4 px-3 overflow-hidden">
              <div class="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    href={item.href}
                    class={`${item.targetClass} flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-lg transition-all`}
                  >
                    <span class="min-w-[20px] flex items-center justify-center shrink-0">
                      <lord-icon
                        src={item.iconSrc}
                        trigger="hover"
                        target={`.${item.targetClass}`}
                        colors="primary:#f4f4f5"
                        style="width:20px;height:20px"
                      />
                    </span>
                    <span class="text-sm font-medium text-zinc-300">{item.label}</span>
                  </a>
                ))}
              </div>
            </nav>

            {showLogout && (
              <div class="p-3 shrink-0">
                <button
                  type="button"
                  onClick={handleLogout}
                  class="flex items-center gap-3 w-full px-3 py-3 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                  aria-label="ログアウト"
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    class="min-w-[18px] shrink-0"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span class="text-sm font-medium">ログアウト</span>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
