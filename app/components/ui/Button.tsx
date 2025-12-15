import type { FC, PropsWithChildren, CSSProperties } from "hono/jsx";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  class?: string;
  style?: CSSProperties;
  onClick?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  class: className = "",
  style,
  onClick,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onclick={onClick}
      class={`inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
