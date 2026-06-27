"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface BlogFilterProps {
  posts: PostMeta[];
}

export function BlogFilter({ posts }: BlogFilterProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Collect all unique tags, exclude series: prefix tags from the filter UI
  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!tag.startsWith("series:")) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        search === "" ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());

      const matchesTags =
        selectedTags.size === 0 ||
        [...selectedTags].every((tag) => post.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [posts, selectedTags, search]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  return (
    <>
      {/* Search + count */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="search"
          placeholder="Search posts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 font-mono text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">
          {filteredPosts.length} / {posts.length}
        </span>
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-1.5">
          {allTags.map(([tag, count]) => {
            const active = selectedTags.has(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`font-mono text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? "bg-violet-600 border-violet-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400"
                }`}
              >
                {tag}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
          {selectedTags.size > 0 && (
            <button
              onClick={() => setSelectedTags(new Set())}
              className="font-mono text-[10px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              clear ×
            </button>
          )}
        </div>
      )}

      {/* Post list */}
      {filteredPosts.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-600 font-mono text-sm">
          No posts match.
        </p>
      ) : (
        <ul className="space-y-px">
          {filteredPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Date */}
                <time
                  dateTime={post.date}
                  className="flex-shrink-0 font-mono text-[11px] text-zinc-400 dark:text-zinc-600 tracking-wide pt-0.5"
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>

                {/* Title + excerpt */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.tags
                        .filter((t) => !t.startsWith("series:"))
                        .map((tag) => (
                          <span
                            key={tag}
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                              selectedTags.has(tag)
                                ? "bg-violet-600 text-white"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <span className="hidden sm:block text-zinc-300 dark:text-zinc-700 group-hover:text-violet-400 transition-colors text-sm">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
