import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "../../types/database";
import { Header } from "./Header";
import { Container } from "./Container";
import Sidebar from "../../islands/Sidebar";

interface LayoutProps {
  user?: User | null;
  title?: string;
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  children,
  user,
  title,
}) => {
  return (
    <>
      {title && <title>{title} | gidoku</title>}
      {user && <Sidebar />}
      <div
        id="main-layout"
        class={`min-h-screen bg-zinc-50/30 text-zinc-900 transition-all duration-300 ease-in-out ${
          user ? "pl-[112px]" : ""
        }`}
      >
        <Header user={user} />
        <main class="py-8 sm:py-12">
          <Container>{children}</Container>
        </main>
      </div>
    </>
  );
};
