import type { FC } from "hono/jsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  class?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = "md",
  class: className = "",
}) => {
  return (
    <div
      class={`animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900 ${sizeStyles[size]} ${className}`}
    />
  );
};

export const LoadingPage: FC = () => {
  return (
    <div class="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>
  );
};
