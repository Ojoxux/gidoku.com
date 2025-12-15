import { useState } from "hono/jsx";

type BookStatus = "unread" | "reading" | "completed";

interface StatusToggleProps {
  bookId: string;
  currentStatus: BookStatus;
}

interface ApiResponse {
  success: boolean;
  error?: { message: string };
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "unread", label: "積読" },
  { value: "reading", label: "読書中" },
  { value: "completed", label: "読了" },
];

export default function StatusToggle({
  bookId,
  currentStatus,
}: StatusToggleProps) {
  const [status, setStatus] = useState<BookStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newStatus: BookStatus) => {
    if (newStatus === status) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
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

  return (
    <div class="items-center inline-flex gap-1 p-1 bg-zinc-100 rounded-lg">
      {statusOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          disabled={saving}
          class={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            status === option.value
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
          } disabled:opacity-50`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
