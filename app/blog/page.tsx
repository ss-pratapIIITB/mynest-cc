import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — mynest.cc",
  description: "Writing on software, craft, and the things worth building.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-20 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="mb-14">
        <Link
          href="/"
          className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          ← home
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Writing
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-500 text-sm font-mono">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-600 font-mono text-sm">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-px">
          {posts.map((post) => (
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
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500"
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
    </main>
  );
}
