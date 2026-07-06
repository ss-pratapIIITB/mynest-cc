import type { Metadata } from "next";
import Link from "next/link";
import {
  META_LOOP,
  META_CATEGORIES,
  META_SYSTEM_DESIGN,
  META_BEHAVIORAL,
  META_RESOURCES,
  META_TOTAL,
} from "@/lib/practice-meta";
import { ProblemList } from "@/components/practice/problem-list";

const RESOURCE_GROUPS = Array.from(new Set(META_RESOURCES.map((r) => r.group)));

export const metadata: Metadata = {
  title: "Lead Engineer (E5) Focus — Practice — mynest.cc",
  description:
    "A focused prep session for the Meta E5 (senior / lead IC) loop: the round structure, the current high-frequency coding questions with Java solutions, plus system-design and behavioral prompts.",
};

export default function MetaPracticePage() {
  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-24 max-w-[820px] mx-auto">
      <Link
        href="/practice"
        className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        ← practice
      </Link>

      <div className="mt-6 mb-6">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Lead Engineer Focus — E5
          </h1>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            meta
          </span>
        </div>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[620px]">
          A session built entirely around the current Meta senior-IC (E5) loop — the level
          some orgs call &ldquo;lead.&rdquo; The round breakdown, then {META_TOTAL} of the
          highest-frequency coding questions with Java solutions, plus system-design and
          behavioral prompts.
        </p>
        <p className="mt-3 font-mono text-[11px] text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-[620px]">
          Sourcing note: exact live frequency is Premium-gated and NDA-limited. This is a
          compiled best-view from recent public E5 guides and reports — a strong signal, not a
          leaked list.
        </p>
      </div>

      {/* The loop */}
      <section className="mb-12">
        <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-3">
          The loop
        </h2>
        <div className="space-y-2">
          {META_LOOP.map((round) => (
            <div
              key={round.name}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-4 py-3.5"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {round.name}
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 flex-shrink-0">
                  {round.weight}
                </span>
              </div>
              <div
                className="practice-rich mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
                dangerouslySetInnerHTML={{ __html: round.detail }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Coding questions */}
      <section className="mb-12">
        <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-1">
          Coding — {META_TOTAL} current high-frequency questions
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-5">
          No dynamic programming (effectively banned at Meta). Strings/parsing, trees, graphs,
          intervals, and hashing dominate.
        </p>
        <div className="space-y-10">
          {META_CATEGORIES.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-baseline gap-3 mb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</h3>
                <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                  {cat.meta}
                </span>
              </div>
              <ProblemList problems={cat.problems} />
            </div>
          ))}
        </div>
      </section>

      {/* System design */}
      <section className="mb-12">
        <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-1">
          System / product architecture
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-4">
          Meta pushes for concrete numbers — throughput, storage, cache invalidation. Practice
          driving the API and data model, not staying high-level.
        </p>
        <div className="space-y-2">
          {META_SYSTEM_DESIGN.map((d) => (
            <div
              key={d.title}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 px-4 py-3"
            >
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{d.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {d.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Behavioral */}
      <section>
        <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-1">
          Behavioral (&ldquo;Jedi&rdquo;)
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-4">
          A standalone 45-minute round, now heavy enough to down-level. Prepare specific,
          structured stories (situation → action → measurable result).
        </p>
        <ul className="space-y-2">
          {META_BEHAVIORAL.map((q) => (
            <li
              key={q}
              className="flex gap-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
            >
              <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">▸</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Resources */}
      <section className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800/60">
        <h2 className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-1">
          Resources — articles & guides
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-5">
          Curated external prep. Some (LeetCode&apos;s Meta tag, a couple of guides) need a free
          account.
        </p>
        <div className="space-y-6">
          {RESOURCE_GROUPS.map((group) => (
            <div key={group}>
              <h3 className="font-mono text-[11px] text-zinc-500 dark:text-zinc-500 mb-2">
                {group}
              </h3>
              <div className="space-y-2">
                {META_RESOURCES.filter((r) => r.group === group).map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {r.title}
                      </span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 leading-relaxed">
                        {r.note}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
