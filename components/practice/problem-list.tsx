"use client";

import { useState } from "react";
import type { Problem } from "@/lib/practice-data";

const DIFF_STYLES: Record<string, string> = {
  easy: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25",
  med: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/25",
  hard: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/25",
};
const DIFF_LABEL: Record<string, string> = { easy: "EASY", med: "MEDIUM", hard: "HARD" };

/* Rich-text fields are trusted, hand-authored HTML (bold / code / em / q-spans). */
function Rich({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`practice-rich text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
        <span className="font-mono text-[10px] tracking-[0.15em] text-amber-600 dark:text-amber-400">
          JAVA
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
            copied
              ? "text-emerald-600 border-emerald-400"
              : "text-zinc-400 dark:text-zinc-500 border-zinc-300 dark:border-zinc-700 hover:text-violet-600 hover:border-violet-400"
          }`}
        >
          {copied ? "COPIED" : "COPY"}
        </button>
      </div>
      <pre className="bg-zinc-900 text-zinc-100 text-[0.78rem] leading-relaxed p-4 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ProblemCard({ problem, defaultOpen = false }: { problem: Problem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600 w-6 flex-shrink-0">
          {problem.n}
        </span>
        <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {problem.title}
        </span>
        <span className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded border ${DIFF_STYLES[problem.diff]}`}
          >
            {DIFF_LABEL[problem.diff]}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
            {problem.pat}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600">
            LC {problem.lc}
          </span>
        </span>
        <span
          className={`text-zinc-400 dark:text-zinc-600 text-xs transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>

      {open && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          <div className="px-4 py-4">
            <Label>Problem</Label>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 border-l-2 border-l-violet-400 dark:border-l-violet-500 bg-zinc-50 dark:bg-zinc-900/60 px-3.5 py-3">
              <Rich html={problem.statement} className="text-zinc-700 dark:text-zinc-300" />
              {problem.example && (
                <pre className="mt-2.5 font-mono text-[0.72rem] leading-relaxed text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap">
                  {problem.example}
                </pre>
              )}
            </div>
          </div>

          <div className="px-4 py-4">
            <Label>Approach</Label>
            <Rich html={problem.approach} />
          </div>

          <div className="px-4 py-4">
            <Label>Solution</Label>
            <CodeBlock code={problem.code} />
            <div className="flex flex-wrap gap-2 mt-3">
              <Pill label="Time" value={problem.tc} />
              <Pill label="Space" value={problem.sc} />
            </div>
          </div>

          {problem.followup && (
            <div className="px-4 py-4 bg-amber-50/40 dark:bg-amber-500/[0.04]">
              <Label className="text-amber-600 dark:text-amber-500">Follow-ups</Label>
              <Rich html={problem.followup} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-400 dark:text-zinc-600 mb-2 ${className}`}
    >
      {children}
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
      {label} <span className="text-violet-600 dark:text-violet-400 font-semibold">{value}</span>
    </span>
  );
}

export function ProblemList({ problems }: { problems: Problem[] }) {
  const [expandAll, setExpandAll] = useState(false);
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 hover:border-violet-400 transition-colors"
        >
          {expandAll ? "collapse all" : "expand all"}
        </button>
      </div>
      <div className="space-y-2.5">
        {/* key includes expandAll so toggling remounts cards to the new default open state */}
        {problems.map((p) => (
          <ProblemCard key={`${expandAll}-${p.n}`} problem={p} defaultOpen={expandAll} />
        ))}
      </div>
    </div>
  );
}
