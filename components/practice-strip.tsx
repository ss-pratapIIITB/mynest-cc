import Link from "next/link";
import { CATEGORIES, TOTAL_PROBLEMS, TOTAL_TEMPLATES } from "@/lib/practice-data";

export default function PracticeStrip() {
  return (
    <section className="w-full max-w-[1100px] mx-auto px-6 sm:px-10 py-16 border-t border-zinc-100 dark:border-zinc-800/60">
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-500 tracking-[0.18em] uppercase">
            Practice
          </span>
        </div>
        <Link
          href="/practice"
          className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          open practice →
        </Link>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-[560px] mb-6">
        A worked bank of {TOTAL_PROBLEMS} data-structures & algorithms problems in Java —
        statement, approach, solution, complexity, and follow-ups — plus {TOTAL_TEMPLATES}{" "}
        muscle-memory code templates. Grouped by pattern.
      </p>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/practice/${c.id}`}
            className="group font-mono text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            {c.name}
            <span className="ml-1.5 opacity-50 group-hover:opacity-80">{c.problems.length}</span>
          </Link>
        ))}
        <Link
          href="/practice/templates"
          className="font-mono text-[11px] px-2.5 py-1.5 rounded-lg border border-violet-200 dark:border-violet-500/25 bg-violet-50/60 dark:bg-violet-500/[0.06] text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
        >
          Templates
          <span className="ml-1.5 opacity-60">{TOTAL_TEMPLATES}</span>
        </Link>
      </div>
    </section>
  );
}
