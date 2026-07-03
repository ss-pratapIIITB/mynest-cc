import type { Metadata } from "next";
import Link from "next/link";
import {
  CATEGORIES,
  TEMPLATE_GROUPS,
  TOTAL_PROBLEMS,
  TOTAL_TEMPLATES,
} from "@/lib/practice-data";

export const metadata: Metadata = {
  title: "Practice — mynest.cc",
  description:
    "A worked bank of data-structures & algorithms problems in Java — statement, approach, solution, complexity, and follow-ups. Plus muscle-memory code templates.",
};

export default function PracticeIndex() {
  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-20 max-w-[820px] mx-auto">
      <Link
        href="/"
        className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        ← home
      </Link>

      <div className="mt-6 mb-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Practice
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[560px]">
          A worked bank of data-structures & algorithms problems in Java. Every one:
          statement → approach → solution → complexity → follow-ups. Grouped by pattern,
          because the pattern is the transferable skill.
        </p>
        <p className="mt-3 font-mono text-xs text-zinc-400 dark:text-zinc-600">
          {TOTAL_PROBLEMS} problems · {CATEGORIES.length} patterns · {TOTAL_TEMPLATES} templates
        </p>
      </div>

      {/* Category grid */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/practice/${c.id}`}
            className="group flex flex-col gap-1.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {c.name}
              </h2>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 flex-shrink-0">
                {c.problems.length}
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
              {c.meta}
            </span>
          </Link>
        ))}
      </div>

      {/* Templates callout */}
      <Link
        href="/practice/templates"
        className="group mt-3 flex items-center gap-3 p-4 rounded-xl border border-violet-200 dark:border-violet-500/25 bg-violet-50/60 dark:bg-violet-500/[0.06] hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-700 dark:group-hover:text-violet-300">
            Muscle-Memory Templates
          </span>
          <span className="block font-mono text-[11px] text-zinc-500 dark:text-zinc-500 mt-0.5">
            {TEMPLATE_GROUPS.length} pattern skeletons you write without thinking · {TOTAL_TEMPLATES} templates
          </span>
        </span>
        <span className="font-mono text-xs text-violet-500 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </Link>
    </main>
  );
}
