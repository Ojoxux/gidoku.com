import type { FC, PropsWithChildren } from "hono/jsx";
import type { BookStatus } from "../../types/database";

type BadgeVariant = "default" | "success" | "warning" | "info" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  class?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  success: "bg-zinc-100 text-zinc-900 border border-zinc-300",
  warning: "bg-zinc-50 text-zinc-600 border border-zinc-200",
  info: "bg-zinc-900 text-white border border-zinc-900",
  danger: "bg-red-50 text-red-700 border border-red-100",
};

export const Badge: FC<PropsWithChildren<BadgeProps>> = ({
  children,
  variant = "default",
  class: className = "",
}) => {
  return (
    <span
      class={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase whitespace-nowrap ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

const statusConfig: Record<
  BookStatus,
  { label: string; variant: BadgeVariant }
> = {
  unread: { label: "積読", variant: "default" },
  reading: { label: "読書中", variant: "info" },
  completed: { label: "読了", variant: "success" },
};

interface StatusBadgeProps {
  status: BookStatus;
  class?: string;
}

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  class: className = "",
}) => {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} class={className}>
      {config.label}
    </Badge>
  );
};
