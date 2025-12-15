import type { FC } from "hono/jsx";

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  class?: string;
}

export const ProgressBar: FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  class: className = "",
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div class={`w-full ${className}`}>
      <div class="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
        <div
          class="bg-zinc-900 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={`width: ${percentage}%`}
        />
      </div>
      {showLabel && (
        <div class="flex justify-between text-[10px] uppercase tracking-wide font-medium text-zinc-500 mt-2">
          <span>
            {current} / {total} PAGE
          </span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
};
