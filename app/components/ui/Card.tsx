import type { FC, PropsWithChildren } from "hono/jsx";

interface CardProps {
  class?: string;
  href?: string;
}

export const Card: FC<PropsWithChildren<CardProps>> = ({
  children,
  class: className = "",
  href,
}) => {
  const baseClass = `bg-white rounded-xl border border-zinc-200/60 shadow-sm/5 ${className}`;

  if (href) {
    return (
      <a
        href={href}
        class={`${baseClass} block hover:border-zinc-300 hover:shadow-sm transition-all duration-200`}
      >
        {children}
      </a>
    );
  }

  return <div class={baseClass}>{children}</div>;
};

export const CardHeader: FC<PropsWithChildren<{ class?: string }>> = ({
  children,
  class: className = "",
}) => {
  return (
    <div class={`px-6 py-4 border-b border-zinc-100 ${className}`}>
      {children}
    </div>
  );
};

export const CardBody: FC<PropsWithChildren<{ class?: string }>> = ({
  children,
  class: className = "",
}) => {
  return <div class={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: FC<PropsWithChildren<{ class?: string }>> = ({
  children,
  class: className = "",
}) => {
  return (
    <div
      class={`px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl ${className}`}
    >
      {children}
    </div>
  );
};
