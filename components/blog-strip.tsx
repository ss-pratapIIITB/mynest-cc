import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogStrip() {
  const posts = getAllPosts().slice(0, 3); // show latest 3

  if (posts.length === 0) return null;

  return (
    <section className="w-full max-w-[1100px] mx-auto px-6 sm:px-10 py-16 border-t border-zinc-100 dark:border-zinc-800/60">
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-500 tracking-[0.18em] uppercase">
            Writing
          </span>
        </div>
        <Link
          href="/blog"
          className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          all posts →
        </Link>
      </div>

      {/* Post cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-100 dark:bg-zinc-800/40 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800/60">
        {posts.map((post, i) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-3 p-6 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            {/* Date */}
            <time
              dateTime={post.date}
              className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide"
            >
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>

            {/* Title */}
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Arrow */}
            <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-700 group-hover:text-violet-400 dark:group-hover:text-violet-500 transition-colors">
              read →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
