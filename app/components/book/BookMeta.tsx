import type { FC } from "hono/jsx";

interface BookMetaProps {
  title: string;
  authors: string[];
  publisher?: string | null;
  class?: string;
}

export const BookMeta: FC<BookMetaProps> = ({
  title,
  authors,
  publisher,
  class: className = "",
}) => {
  return (
    <div class={className}>
      <h3 class="font-bold text-zinc-900 line-clamp-2 tracking-tight leading-snug">{title}</h3>
      <p class="text-xs font-medium text-zinc-600 mt-1 uppercase tracking-wide">
        {authors.join(", ")}
      </p>
      {publisher && (
        <p class="text-xs text-zinc-400 mt-0.5">{publisher}</p>
      )}
    </div>
  );
};
