import type { FC, PropsWithChildren } from "hono/jsx";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export const EmptyState: FC<PropsWithChildren<EmptyStateProps>> = ({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}) => {
  return (
    <div class="text-center py-12">
      {children}
      <h3 class="mt-4 text-lg font-bold tracking-tight text-zinc-900">
        {title}
      </h3>
      {description && (
        <p class="mt-2 text-zinc-500 max-w-sm mx-auto">{description}</p>
      )}
      {actionHref && actionLabel && (
        <a
          href={actionHref}
          class="inline-flex items-center justify-center mt-6 px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
        >
          {actionLabel}
        </a>
      )}
    </div>
  );
};
