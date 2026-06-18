import type { FC, PropsWithChildren, CSSProperties } from "hono/jsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-soft"
  | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonShape = "md" | "pill" | "xl";
type ButtonWeight = "medium" | "bold";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  weight?: ButtonWeight;
  disabled?: boolean;
  class?: string;
  style?: CSSProperties;
  onClick?: string;
}

const baseStyles =
  "inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm focus:ring-zinc-900",
  secondary:
    "bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50 shadow-sm focus:ring-zinc-900",
  danger:
    "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 shadow-sm focus:ring-red-500",
  "danger-soft":
    "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-sm focus:ring-red-500",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-900",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const shapeStyles: Record<ButtonShape, string> = {
  md: "rounded-lg",
  pill: "rounded-full",
  xl: "rounded-xl",
};

const weightStyles: Record<ButtonWeight, string> = {
  medium: "font-medium",
  bold: "font-bold",
};

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  shape = "md",
  weight = "medium",
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
      class={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${shapeStyles[shape]} ${weightStyles[weight]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
