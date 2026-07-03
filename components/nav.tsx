"use client";

import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function Nav() {
  return (
    <nav className="fixed top-0 right-0 z-50 px-6 sm:px-10 py-4 flex items-center gap-4">
      <Link
        href="https://linkedin.com/in/surendra-pratap-singh"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors hidden sm:block"
      >
        linkedin
      </Link>
      <Link
        href="https://github.com/ss-pratapIIITB"
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors hidden sm:block"
      >
        github
      </Link>
      <span className="font-mono text-xs hidden lg:flex items-center gap-1.5 text-zinc-400 dark:text-zinc-700">
        <span className="text-green-500 dark:text-green-400">●</span> open to work
      </span>
      <Link
        href="/practice"
        className="font-mono text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors hidden sm:block"
      >
        /practice
      </Link>
      <Link
        href="/play"
        className="font-mono text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors hidden sm:block"
      >
        /play
      </Link>
      <Link
        href="/blog"
        className="font-mono text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors hidden sm:block"
      >
        /blog
      </Link>
      <ThemeToggle />
    </nav>
  );
}
