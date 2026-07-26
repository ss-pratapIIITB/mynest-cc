"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BOOK_CATEGORIES } from "@/lib/ceo-library";

export default function BookShelf() {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([BOOK_CATEGORIES[0].id]));

  const total = useMemo(() => BOOK_CATEGORIES.reduce((n, c) => n + c.books.length, 0), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BOOK_CATEGORIES;
    return BOOK_CATEGORIES.map((cat) => ({
      ...cat,
      books: cat.books.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.why.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.books.length > 0);
  }, [query]);

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, or reason..."
          className="w-full max-w-xs rounded-lg px-3 py-1.5 font-mono text-[11px] outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <span className="flex-shrink-0 font-mono text-[10px]" style={{ color: "var(--subtle)" }}>
          {total} books, curated for depth over a round number
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((cat) => {
          const open = query.trim().length > 0 || openIds.has(cat.id);
          return (
            <div key={cat.id} className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <button
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left cursor-pointer"
              >
                <span className="font-mono text-xs" style={{ color: "var(--text)" }}>{cat.name}</span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-[10px]" style={{ color: "var(--subtle)" }}>{cat.books.length}</span>
                  <motion.span animate={{ rotate: open ? 90 : 0 }} className="font-mono text-xs" style={{ color: "var(--muted)" }}>
                    ›
                  </motion.span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="px-4 pb-3 space-y-2.5">
                      {cat.books.map((b) => (
                        <li key={b.title} className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                          <p className="font-mono text-[11px]" style={{ color: "var(--text)" }}>
                            {b.title} <span style={{ color: "var(--muted)" }}>— {b.author}</span>
                          </p>
                          <p className="font-mono text-[10px] leading-relaxed mt-0.5" style={{ color: "var(--subtle)" }}>
                            {b.why}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="font-mono text-[11px]" style={{ color: "var(--subtle)" }}>No matches.</p>
        )}
      </div>
    </div>
  );
}
