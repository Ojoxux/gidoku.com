import type { FC, PropsWithChildren } from "hono/jsx";

interface ContainerProps {
  class?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-2xl",
  full: "max-w-full",
};

export const Container: FC<PropsWithChildren<ContainerProps>> = ({
  children,
  class: className = "",
  size = "lg",
}) => {
  return (
    <div class={`${sizeStyles[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};
