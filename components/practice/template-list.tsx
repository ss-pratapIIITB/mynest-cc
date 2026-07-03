"use client";

import { useState } from "react";
import type { TemplateGroup } from "@/lib/practice-data";

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

function TemplateCard({
  template,
  defaultOpen = false,
}: {
  template: TemplateGroup["templates"][number];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <span className="font-mono text-[11px] font-bold text-white bg-violet-600 rounded w-6 h-6 flex items-center justify-center flex-shrink-0">
          {template.id}
        </span>
        <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {template.title}
        </span>
        <span className="hidden sm:block font-mono text-[10px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 flex-shrink-0">
          {template.when}
        </span>
        <span
          className={`text-zinc-400 dark:text-zinc-600 text-xs transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
      </button>
      {open && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          <div
            className="practice-rich px-4 py-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800"
            dangerouslySetInnerHTML={{ __html: template.note }}
          />
          <div className="px-4 py-4">
            <CodeBlock code={template.code} />
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplateList({ groups }: { groups: TemplateGroup[] }) {
  const [expandAll, setExpandAll] = useState(false);
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-violet-600 hover:border-violet-400 transition-colors"
        >
          {expandAll ? "collapse all" : "expand all"}
        </button>
      </div>
      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <div className="flex items-baseline gap-3 mb-1.5">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{g.name}</h2>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
                {g.meta}
              </span>
            </div>
            <div
              className="practice-rich text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 mb-4"
              dangerouslySetInnerHTML={{ __html: g.intro }}
            />
            <div className="space-y-2.5">
              {g.templates.map((t) => (
                <TemplateCard key={`${expandAll}-${t.id}`} template={t} defaultOpen={expandAll} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
