import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, getCategory } from "@/lib/practice-data";
import { ProblemList } from "@/components/practice/problem-list";

interface Props {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: `${cat.name} — Practice — mynest.cc`,
    description: `${cat.problems.length} worked ${cat.name} problems in Java, with approach, solution, complexity, and follow-ups.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const idx = CATEGORIES.findIndex((c) => c.id === cat.id);
  const next = CATEGORIES[idx + 1];

  return (
    <main className="min-h-screen px-6 sm:px-10 pt-28 pb-24 max-w-[820px] mx-auto">
      <Link
        href="/practice"
        className="font-mono text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
      >
        ← practice
      </Link>

      <div className="mt-6 mb-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {cat.name}
          </h1>
          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">{cat.meta}</span>
        </div>
        <div
          className="practice-rich mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-[600px]"
          dangerouslySetInnerHTML={{ __html: cat.intro }}
        />
        <p className="mt-3 font-mono text-xs text-zinc-400 dark:text-zinc-600">
          {cat.problems.length} problems
        </p>
      </div>

      <ProblemList problems={cat.problems} />

      {next && (
        <Link
          href={`/practice/${next.id}`}
          className="group mt-10 flex items-center justify-between gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-500/40 transition-colors"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-600">
              Next pattern
            </span>
            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 mt-0.5">
              {next.name}
            </span>
          </span>
          <span className="font-mono text-xs text-violet-500 group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>
      )}
    </main>
  );
}
