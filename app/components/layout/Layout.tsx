import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "../../types/database";
import { Header } from "./Header";
import { Container } from "./Container";
import Sidebar from "../../islands/Sidebar";

interface LayoutProps {
  user?: User | null;
  title?: string;
  sidebarExpanded?: boolean;
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  children,
  user,
  title,
  sidebarExpanded = false,
}) => {
  return (
    <>
      {title && <title>{title} | gidoku</title>}
      <div class="min-h-screen flex bg-zinc-900 text-zinc-900">
        {user && <Sidebar initialExpanded={sidebarExpanded} />}

        <div
          id="main-layout"
          class="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out"
        >
          {user ? (
            <div class="flex-1 p-1 overflow-hidden">
              <div class="bg-white rounded-2xl shadow-sm border border-zinc-200/60 h-full flex flex-col overflow-hidden relative">
                <Header user={user} />
                <main class="flex-1 overflow-y-auto">
                  <div class="py-6 sm:py-8">
                    <Container>{children}</Container>
                  </div>
                </main>
              </div>
            </div>
          ) : (
            <div class="flex-1 flex flex-col overflow-y-auto">
              <Header user={user} />
              <main class="flex-1 py-8 sm:py-12">
                <Container>{children}</Container>
              </main>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
