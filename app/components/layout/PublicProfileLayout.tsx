import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "../../types/database";
import { Container } from "./Container";
import { Header } from "./Header";

interface PublicProfileLayoutProps {
  user?: User | null;
  title?: string;
}

export const PublicProfileLayout: FC<PropsWithChildren<PublicProfileLayoutProps>> = ({
  children,
  user,
  title,
}) => {
  return (
    <>
      {title && <title>{title} | gidoku</title>}
      <div class="min-h-screen bg-zinc-950 text-zinc-900 selection:bg-blue-500/20">
        <div class="h-screen p-2 sm:p-3">
          <div class="bg-white rounded-[20px] shadow-2xl border border-white/10 h-full flex flex-col overflow-hidden relative isolate">
            <Header user={user} />
            <main class="flex-1 overflow-y-auto">
              <div class="py-6 sm:py-8">
                <Container>{children}</Container>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
