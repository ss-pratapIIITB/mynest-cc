import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { BlogFilter } from "@/components/blog-filter";

export const metadata: Metadata = {
  title: "Blog — mynest.cc",
  description: "Writing on software, craft, and the things worth building.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-20 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="mb-10">
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

      {posts.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-600 font-mono text-sm">
          Nothing here yet.
        </p>
      ) : (
        <BlogFilter posts={posts} />
      )}
    </main>
  );
}
