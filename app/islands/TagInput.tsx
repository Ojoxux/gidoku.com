import { useState, useEffect } from "hono/jsx";

interface Tag {
  id: string;
  name: string;
}

interface TagInputProps {
  bookId: string;
  initialTags?: Tag[];
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

export default function TagInput({ bookId, initialTags = [] }: TagInputProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ユーザーのタグ一覧を取得
    fetch("/api/tags")
      .then((res) => res.json())
      .then((json: unknown) => {
        const data = json as ApiResponse<Tag[]>;
        if (data.success) {
          setAllTags(data.data || []);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddTag = async (tagName: string) => {
    const name = tagName.trim();
    if (!name) return;

    // 既に追加済みかチェック
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setInput("");
      return;
    }

    setLoading(true);

    try {
      // 既存のタグを検索
      let tag = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());

      // なければ新規作成
      if (!tag) {
        const createRes = await fetch("/api/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const createData = (await createRes.json()) as ApiResponse<Tag>;
        if (createData.success && createData.data) {
          tag = createData.data;
          setAllTags([...allTags, tag]);
        } else {
          alert(createData.error?.message || "タグの作成に失敗しました");
          return;
        }
      }

      // 書籍にタグを追加
      const res = await fetch(`/api/books/${bookId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: tag.id }),
      });

      if (res.ok) {
        setTags([...tags, tag]);
        setInput("");
      } else {
        const data = (await res.json()) as ApiResponse;
        alert(data.error?.message || "タグの追加に失敗しました");
      }
    } catch {
      alert("タグの追加中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true);

    try {
      const res = await fetch(`/api/books/${bookId}/tags/${tagId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTags(tags.filter((t) => t.id !== tagId));
      } else {
        const data = (await res.json()) as ApiResponse;
        alert(data.error?.message || "タグの削除に失敗しました");
      }
    } catch {
      alert("タグの削除中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = allTags.filter(
    (t) =>
      t.name.toLowerCase().includes(input.toLowerCase()) &&
      !tags.some((tag) => tag.id === t.id)
  );

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.id)}
              disabled={loading}
              class="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div class="relative">
        <input
          type="text"
          value={input}
          onInput={(e) => setInput((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag(input);
            }
          }}
          placeholder="タグを追加..."
          disabled={loading}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />

        {input && suggestions.length > 0 && (
          <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.slice(0, 5).map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.name)}
                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
