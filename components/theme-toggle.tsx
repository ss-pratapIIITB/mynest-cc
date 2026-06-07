"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SystemIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const THEMES = ["system", "light", "dark"] as const;
type Theme = (typeof THEMES)[number];

const LABELS: Record<Theme, string> = {
  system: "system",
  light: "light",
  dark: "dark",
};

const ICONS: Record<Theme, React.ReactNode> = {
  system: <SystemIcon />,
  light: <SunIcon />,
  dark: <MoonIcon />,
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono opacity-0">
        <SystemIcon />
        <span>system</span>
      </button>
    );
  }

  const current = (theme as Theme) ?? "system";

  const cycle = () => {
    const idx = THEMES.indexOf(current);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-150
        text-zinc-500 dark:text-zinc-600
        hover:text-zinc-700 dark:hover:text-zinc-400
        hover:bg-zinc-100 dark:hover:bg-zinc-800/60
        border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50"
      title={`Theme: ${LABELS[current]} — click to cycle`}
    >
      {ICONS[current]}
      <span>{LABELS[current]}</span>
    </button>
  );
}
