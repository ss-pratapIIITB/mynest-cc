"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { login, type LoginState } from "@/app/ceo/actions";

const initialState: LoginState = {};

function LoginForm() {
  const params = useSearchParams();
  const from = params.get("from") ?? "/ceo";
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-sm rounded-xl border p-6 sm:p-8"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <input type="hidden" name="from" value={from} />

      <div className="mb-6 text-center">
        <div
          className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--accent)]">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="font-mono text-sm tracking-wide" style={{ color: "var(--text)" }}>
          private
        </h1>
        <p className="mt-1 font-mono text-[11px]" style={{ color: "var(--muted)" }}>
          sign in to continue
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="username" className="mb-1 block font-mono text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
            USERNAME
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            autoFocus
            className="w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block font-mono text-[10px] tracking-widest" style={{ color: "var(--muted)" }}>
            PASSWORD
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg px-3 py-2 font-mono text-sm outline-none"
            style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>
      </div>

      {state?.error && (
        <p className="mt-3 font-mono text-[11px]" style={{ color: "#e34948" }}>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 w-full rounded-lg py-2 font-mono text-xs tracking-wide transition-opacity disabled:opacity-50 cursor-pointer"
        style={{
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.3)",
          color: "var(--accent)",
        }}
      >
        {pending ? "verifying..." : "enter"}
      </button>

      <div className="mt-5 text-center">
        <Link href="/" className="font-mono text-[10px] hover:underline" style={{ color: "var(--subtle)" }}>
          ← back to mynest.cc
        </Link>
      </div>
    </motion.form>
  );
}

export default function CeoLoginPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
