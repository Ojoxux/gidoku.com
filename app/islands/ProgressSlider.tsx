import { useState } from "hono/jsx";

interface ProgressSliderProps {
  bookId: string;
  initialPage: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  error?: { message: string };
}

export default function ProgressSlider({
  bookId,
  initialPage,
  totalPages,
}: ProgressSliderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const percentage = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  const handleUpdate = async () => {
    if (currentPage === initialPage) return;

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/books/${bookId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = (await res.json()) as ApiResponse;
        alert(data.error?.message || "更新に失敗しました");
      }
    } catch {
      alert("更新中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  if (totalPages === 0) {
    return (
      <p class="text-sm text-zinc-500">
        ページ数が設定されていません
      </p>
    );
  }

  return (
    <div class="space-y-6">
      <div class="space-y-2">
        <div class="flex items-end justify-between">
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-bold text-zinc-900">{percentage}</span>
            <span class="text-sm font-medium text-zinc-500">%</span>
          </div>
          <div class="text-sm font-medium text-zinc-500">
            {currentPage} / {totalPages} ページ
          </div>
        </div>

        <div class="relative h-4 w-full group">
          <input
            type="range"
            min="0"
            max={totalPages}
            value={currentPage}
            onInput={(e) => setCurrentPage(Number((e.target as HTMLInputElement).value))}
            class="absolute w-full h-full opacity-0 z-10 cursor-pointer"
          />
          <div class="w-full h-2 bg-zinc-100 rounded-full overflow-hidden absolute top-1/2 -translate-y-1/2">
            <div
              class="h-full bg-zinc-900 transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div 
            class="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-zinc-900 rounded-full shadow transition-transform duration-200 pointer-events-none"
            style={{ left: `${percentage}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <div class="flex gap-2">
          {[-10, 10, 50].map((step) => (
            <button
              onClick={() => setCurrentPage(Math.max(0, Math.min(totalPages, currentPage + step)))}
              class="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 transition-colors"
            >
              {step > 0 ? `+${step}` : step}
            </button>
          ))}
        </div>

        <div class="flex items-center gap-3">
          {saved && (
            <span class="text-sm text-zinc-500 animate-fade-in">保存しました</span>
          )}
          <button
            onClick={handleUpdate}
            disabled={saving || currentPage === initialPage}
            class="px-4 py-2 text-sm font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {saving ? "保存中..." : "進捗を更新"}
          </button>
        </div>
      </div>
    </div>
  );
}
