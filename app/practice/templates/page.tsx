import type { Metadata } from "next";
import Link from "next/link";
import { TEMPLATE_GROUPS, TOTAL_TEMPLATES } from "@/lib/practice-data";
import { TemplateList } from "@/components/practice/template-list";

export const metadata: Metadata = {
  title: "Templates — Practice — mynest.cc",
  description:
    "Muscle-memory Java code skeletons: BFS/DFS, binary search, sliding window, heaps, DP, backtracking, and core structures. Type them from memory until automatic.",
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-24 max-w-[820px] mx-auto">
      <Link
        href="/practice"
        className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        ← practice
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Muscle-Memory Templates
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[600px]">
          The base code you write without thinking. Don&apos;t just read these — type each one
          from memory until it&apos;s automatic. Then solving becomes &ldquo;which template + what
          tweak&rdquo; instead of &ldquo;how do I start.&rdquo;
        </p>
        <p className="mt-3 font-mono text-xs text-zinc-400 dark:text-zinc-600">
          {TOTAL_TEMPLATES} templates · {TEMPLATE_GROUPS.length} categories
        </p>
      </div>

      <TemplateList groups={TEMPLATE_GROUPS} />
    </main>
  );
}
