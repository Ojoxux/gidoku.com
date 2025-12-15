import type { FC } from "hono/jsx";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  class?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  class: className = "",
}) => {
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        class={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      class={`rounded-full bg-gray-300 flex items-center justify-center font-medium text-gray-600 ${sizeStyles[size]} ${className}`}
    >
      {initials}
    </div>
  );
};
