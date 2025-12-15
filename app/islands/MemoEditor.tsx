import { useState } from "hono/jsx";

interface MemoEditorProps {
  bookId: string;
  initialMemo: string;
}

interface ApiResponse {
  success: boolean;
  error?: { message: string };
}

export default function MemoEditor({ bookId, initialMemo }: MemoEditorProps) {
  const [memo, setMemo] = useState(initialMemo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (memo === initialMemo) return;

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = (await res.json()) as ApiResponse;
        alert(data.error?.message || "保存に失敗しました");
      }
    } catch {
      alert("保存中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div class="space-y-4">
      <div class="relative">
        <textarea
          value={memo}
          onInput={(e) => setMemo((e.target as HTMLTextAreaElement).value)}
          placeholder="気になったフレーズや感想を記録しましょう..."
          rows={8}
          class="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all resize-vertical leading-relaxed"
        />
        <div class="absolute bottom-3 right-3 text-xs text-zinc-400 pointer-events-none">
          Markdown 対応
        </div>
      </div>

      <div class="flex items-center justify-end gap-3">
        {saved && <span class="text-sm text-zinc-500">保存しました</span>}
        <button
          onClick={handleSave}
          disabled={saving || memo === initialMemo}
          class="px-5 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {saving ? "保存中..." : "メモを保存"}
        </button>
      </div>
    </div>
  );
}
