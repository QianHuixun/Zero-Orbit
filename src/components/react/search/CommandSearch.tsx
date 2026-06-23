import { useEffect, useMemo, useState } from "react";

interface SearchItem {
  title: string;
  url: string;
  excerpt?: string;
}

export default function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const items = useMemo<SearchItem[]>(() => [], []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-void/80 p-4 backdrop-blur" role="dialog" aria-modal="true">
      <div className="panel mx-auto mt-24 max-w-2xl p-4">
        <div className="flex items-center justify-between gap-4 border-b border-line/50 pb-3">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-cyan">Command Search</p>
          <button className="text-sm text-muted hover:text-text" onClick={() => setOpen(false)}>Esc</button>
        </div>
        <input
          autoFocus
          className="mt-4 w-full rounded-md border border-line/60 bg-void/70 px-4 py-3 text-text outline-none focus:border-cyan"
          placeholder="搜索将在 Pagefind 接入后启用"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-4 min-h-24 rounded-md border border-line/40 bg-surface/40 p-4 text-sm text-muted">
          {items.length === 0 ? `等待接入 Pagefind 索引。当前输入：${query || "无"}` : null}
        </div>
      </div>
    </div>
  );
}
