import type { FC } from "hono/jsx";

type CoverSize = "sm" | "md" | "lg";

interface BookCoverProps {
  src?: string | null;
  alt: string;
  size?: CoverSize;
  class?: string;
}

const sizeStyles: Record<CoverSize, string> = {
  sm: "w-16 h-24",
  md: "w-24 h-36",
  lg: "w-32 h-48",
};

export const BookCover: FC<BookCoverProps> = ({
  src,
  alt,
  size = "md",
  class: className = "",
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        class={`object-cover rounded-md shadow-sm border border-zinc-200/50 ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      class={`bg-zinc-100 rounded-md shadow-sm border border-zinc-200 flex items-center justify-center ${sizeStyles[size]} ${className}`}
    >
      <span class="text-zinc-400 text-[10px] uppercase font-medium text-center px-1">
        No Image
      </span>
    </div>
  );
};
