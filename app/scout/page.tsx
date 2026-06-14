"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/nav";

/* ── Types ── */
interface Note {
  id: string;
  type: "text" | "image";
  content: string;
  tag?: string;
  url: string;
  ts: number;
}

/* ── Icons (inline SVG, no emoji) ── */
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconX = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const IconChevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
  </svg>
);
const IconScan = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const IconGo = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ── Boot screen ── */
const BOOT_LINES = [
  "initializing scout v2.0...",
  "loading browser engine...",
  "injecting content scanner...",
  "binding knowledge extractor...",
  "ready.",
];

function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setLines((p) => [...p, BOOT_LINES[i]]);
      i++;
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
    }, 130);
    return () => clearInterval(interval);
  }, [onDone]);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="space-y-1.5 px-8">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-xs"
          >
            <span className="text-emerald-500 mr-2">$</span>
            <span className={l === "ready." ? "text-emerald-400" : "text-zinc-500"}>{l}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Empty state ── */
function EmptyState({ onGo }: { onGo: (url: string) => void }) {
  const SUGGESTIONS = [
    { label: "wikipedia", url: "https://en.wikipedia.org/wiki/Large_language_model" },
    { label: "hacker news", url: "https://news.ycombinator.com" },
    { label: "arxiv.org", url: "https://arxiv.org" },
    { label: "css-tricks", url: "https://css-tricks.com" },
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 select-none">
      {/* ASCII art */}
      <div className="text-center">
        <pre className="font-mono text-[10px] leading-relaxed text-zinc-800">
{`
  ┌─────────────────────────────┐
  │  ░░ SCOUT BROWSER v2.0 ░░  │
  │  ─────────────────────────  │
  │  enter a URL above to       │
  │  start scouting content     │
  │                             │
  │  enable SCAN to highlight   │
  │  text blocks and images     │
  └─────────────────────────────┘
`}
        </pre>
        <div className="font-mono text-[10px] text-emerald-900 mt-1 cursor-blink">
          awaiting target
        </div>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-xs space-y-1.5">
        <p className="font-mono text-[9px] text-zinc-800 tracking-widest text-center mb-3">
          SUGGESTED TARGETS
        </p>
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s.url}
            onClick={() => onGo(s.url)}
            whileHover={{ x: 4 }}
            className="w-full px-4 py-2.5 rounded-lg border border-[#1a1a1c] bg-[#0d0d0e] hover:border-zinc-700 hover:bg-[#111113] transition-colors text-left group cursor-pointer flex items-center justify-between"
          >
            <span className="font-mono text-[11px] text-zinc-500 group-hover:text-zinc-200 transition-colors">
              {s.label}
            </span>
            <span className="font-mono text-[9px] text-zinc-800 group-hover:text-zinc-600 transition-colors">
              ↗
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ── Scanline sweep animation ── */
function ScanSweep() {
  return (
    <motion.div
      className="absolute inset-x-0 h-[2px] pointer-events-none z-20"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.6) 40%, rgba(16,185,129,0.9) 50%, rgba(16,185,129,0.6) 60%, transparent 100%)",
        boxShadow: "0 0 16px 4px rgba(16,185,129,0.4)",
      }}
      initial={{ top: "-2px" }}
      animate={{ top: "100%" }}
      transition={{ duration: 1.4, ease: "linear" }}
    />
  );
}

/* ── Note card ── */
function NoteCard({
  note,
  onCopy,
  onDelete,
  copied,
}: {
  note: Note;
  onCopy: () => void;
  onDelete: () => void;
  copied: boolean;
}) {
  const isText = note.type === "text";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.94 }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative rounded-lg border bg-[#0d0d0e] group cursor-pointer overflow-hidden ${
        isText
          ? "border-l-[2px] border-l-emerald-500/50 border-t-[#1a1a1c] border-r-[#1a1a1c] border-b-[#1a1a1c]"
          : "border-l-[2px] border-l-sky-400/50 border-t-[#1a1a1c] border-r-[#1a1a1c] border-b-[#1a1a1c]"
      }`}
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
    >
      {/* 3D depth line at top */}
      <div
        className="absolute inset-x-0 top-0 h-px opacity-20"
        style={{
          background: isText
            ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.8), transparent)"
            : "linear-gradient(90deg, transparent, rgba(56,189,248,0.8), transparent)",
        }}
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`font-mono text-[8px] tracking-widest uppercase ${
              isText ? "text-emerald-600" : "text-sky-600"
            }`}
          >
            {isText ? `‹${note.tag || "text"}›` : "◆ img"}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onCopy}
              className="p-1 rounded text-zinc-600 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Copy"
            >
              {copied ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>
              ) : (
                <IconCopy />
              )}
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded text-zinc-700 hover:text-red-400 transition-colors cursor-pointer"
              title="Delete"
            >
              <IconX />
            </button>
          </div>
        </div>

        {isText ? (
          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-4 select-text">
            {note.content}
          </p>
        ) : (
          <>
            <img
              src={note.content}
              alt={note.tag || "captured image"}
              className="w-full h-20 object-cover rounded border border-[#1a1a1c] mb-1.5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="font-mono text-[9px] text-zinc-700 truncate">{note.content}</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Main page ── */
export default function ScoutPage() {
  const [booted, setBooted] = useState(false);
  const [urlInput, setUrlInput] = useState("https://en.wikipedia.org/wiki/Large_language_model");
  const [iframeSrc, setIframeSrc] = useState("");
  const [scanMode, setScanMode] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scanStats, setScanStats] = useState<{ tc: number; ic: number } | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; label: string }[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ── Toast helper ── */
  const toast = useCallback((label: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, label }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 1800);
  }, []);

  /* ── Bootstrap: restore localStorage ── */
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("scout:notes");
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (localStorage.getItem("scout:booted")) setBooted(true);
    } catch {}
  }, []);

  /* ── Persist notes ── */
  useEffect(() => {
    try { localStorage.setItem("scout:notes", JSON.stringify(notes)); } catch {}
  }, [notes]);

  /* ── postMessage listener ── */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "scout:capture") {
        const note: Note = {
          id: Math.random().toString(36).slice(2),
          type: e.data.contentType,
          content: e.data.content,
          tag: e.data.tag,
          url: e.data.url || iframeSrc,
          ts: Date.now(),
        };
        setNotes((p) => [note, ...p]);
        if (!panelOpen) setPanelOpen(true);
        toast(e.data.contentType === "image" ? "Image captured" : "Text captured");
      }
      if (e.data.type === "scout:scan-complete") {
        setScanStats({ tc: e.data.textCount, ic: e.data.imgCount });
      }
      if (e.data.type === "scout:navigate") {
        const raw: string = e.data.url;
        setUrlInput(raw);
        setIframeSrc(buildSrc(raw, scanMode));
        setIsLoading(true);
        setScanStats(null);
        setSweeping(scanMode);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [iframeSrc, panelOpen, toast, scanMode]);

  /* ── Navigate — always through proxy so X-Frame-Options is stripped ── */
  const buildSrc = useCallback((raw: string, reader = false) => {
    const u = raw.startsWith("http") ? raw : `https://${raw}`;
    const base = `/api/proxy?url=${encodeURIComponent(u)}`;
    return reader ? `${base}&reader=1` : base;
  }, []);

  const navigate = useCallback(
    (override?: string) => {
      const raw = (override ?? urlInput).trim();
      if (!raw) return;
      if (override) setUrlInput(override);
      setScanStats(null);
      setIsLoading(true);
      setSweeping(true);
      setIframeSrc(buildSrc(raw));
    },
    [urlInput, buildSrc]
  );

  /* Scan toggle — reloads iframe in reader mode when enabling, normal when disabling */
  const toggleScan = () => {
    const next = !scanMode;
    setScanMode(next);
    if (iframeSrc) {
      const raw = urlInput.trim();
      if (raw) {
        setScanStats(null);
        setIsLoading(true);
        setSweeping(true);
        setIframeSrc(buildSrc(raw, next));
      }
    }
  };

  /* Send current theme to iframe */
  const sendTheme = useCallback(() => {
    const dark = document.documentElement.classList.contains("dark");
    iframeRef.current?.contentWindow?.postMessage({ type: "scout:theme", dark }, "*");
  }, []);

  /* Watch for theme changes on <html> and forward to iframe */
  useEffect(() => {
    const observer = new MutationObserver(sendTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [sendTheme]);

  /* After iframe loads: sync URL bar + activate highlights + send theme */
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setSweeping(false);
    const src = iframeRef.current?.src ?? "";
    try {
      const proxyUrl = new URL(src);
      const real = proxyUrl.searchParams.get("url");
      if (real) setUrlInput(real);
    } catch {}
    setTimeout(() => {
      sendTheme();
      if (scanMode) {
        iframeRef.current?.contentWindow?.postMessage({ type: "scout:activate" }, "*");
      }
    }, 300);
  }, [scanMode, sendTheme]);

  const copyNote = (id: string, content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyAll = () => {
    const text = notes
      .map((n) => (n.type === "text" ? n.content : `[Image] ${n.content}`))
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
    toast("All notes copied");
  };

  const exportMarkdown = () => {
    const md = [
      "# Scout Notes",
      "",
      `> ${notes.length} items captured · ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`,
      "",
      ...notes.flatMap((n, i) => [
        `## [${i + 1}] ${n.type === "image" ? "Image" : `‹${n.tag || "text"}›`}`,
        "",
        n.type === "text" ? n.content : `![captured image](${n.content})`,
        "",
        `*Source: ${n.url}*`,
        "",
      ]),
    ].join("\n");
    navigator.clipboard.writeText(md).catch(() => {});
    toast("Exported as Markdown");
  };

  const handleBootDone = useCallback(() => {
    setBooted(true);
    try { localStorage.setItem("scout:booted", "1"); } catch {}
  }, []);

  if (!booted) {
    return (
      <AnimatePresence>
        <BootScreen onDone={handleBootDone} />
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Nav />

      {/* ── URL bar ── */}
      <div
        className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1c] mt-12 flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #0a0a0b 0%, #080808 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Mode indicator */}
        <div
          className="flex items-center gap-1.5 flex-shrink-0"
          title={scanMode ? "Scan mode active" : "Browse mode"}
        >
          <motion.div
            animate={
              scanMode
                ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                : { scale: 1, opacity: 0.4 }
            }
            transition={scanMode ? { duration: 2, repeat: Infinity } : {}}
            className={`w-1.5 h-1.5 rounded-full ${
              scanMode ? "bg-emerald-400" : "bg-zinc-700"
            }`}
            style={
              scanMode
                ? { boxShadow: "0 0 6px rgba(52,211,153,0.8)" }
                : {}
            }
          />
        </div>

        {/* Browser chrome dots */}
        <div className="flex gap-1.5 flex-shrink-0 mr-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e20] border border-[#2a2a2c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e20] border border-[#2a2a2c]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e1e20] border border-[#2a2a2c]" />
        </div>

        {/* URL input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate()}
            placeholder="https://..."
            className="w-full px-4 py-1.5 rounded-lg font-mono text-sm text-zinc-300 placeholder-zinc-800 outline-none transition-all duration-200"
            style={{
              background: "#0c0c0d",
              border: `1px solid ${scanMode ? "rgba(16,185,129,0.25)" : "#1e1e20"}`,
              boxShadow: scanMode
                ? "0 0 0 2px rgba(16,185,129,0.06), inset 0 1px 0 rgba(0,0,0,0.4)"
                : "inset 0 1px 0 rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Go */}
        <motion.button
          onClick={() => navigate()}
          whileTap={{ scale: 0.94, y: 1 }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-[11px] rounded-lg transition-all cursor-pointer flex-shrink-0"
          style={{
            background: "rgba(139,92,246,0.12)",
            border: "1px solid rgba(139,92,246,0.25)",
            color: "rgba(167,139,250,0.9)",
            boxShadow: "0 3px 0 rgba(0,0,0,0.4), 0 0 12px rgba(139,92,246,0.08)",
          }}
        >
          <IconGo />
          GO
        </motion.button>

        {/* Scan toggle */}
        <motion.button
          onClick={toggleScan}
          whileTap={{ scale: 0.94, y: 1 }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-[11px] rounded-lg transition-all cursor-pointer flex-shrink-0"
          style={
            scanMode
              ? {
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399",
                  boxShadow:
                    "0 3px 0 rgba(0,0,0,0.4), 0 0 16px rgba(16,185,129,0.15)",
                }
              : {
                  background: "#0c0c0d",
                  border: "1px solid #1e1e20",
                  color: "#52525b",
                  boxShadow: "0 3px 0 rgba(0,0,0,0.4)",
                }
          }
        >
          <IconScan />
          {scanMode ? "SCAN ON" : "SCAN"}
        </motion.button>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── Browser pane ── */}
        <div className="relative flex-1 overflow-hidden min-w-0">
          {/* Scan mode ambient glow */}
          {scanMode && (
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(16,185,129,0.04) 0%, transparent 15%, transparent 85%, rgba(16,185,129,0.04) 100%)",
                border: "1px solid rgba(16,185,129,0.1)",
              }}
            />
          )}

          {/* Scanline sweep */}
          <AnimatePresence onExitComplete={() => setSweeping(false)}>
            {sweeping && <ScanSweep key="sweep" />}
          </AnimatePresence>

          {/* Loading progress bar */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute top-0 inset-x-0 h-[2px] z-30 pointer-events-none overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.8) 40%, rgba(139,92,246,1) 50%, rgba(139,92,246,0.8) 60%, transparent 100%)",
                    boxShadow: "0 0 8px rgba(139,92,246,0.6)",
                    width: "40%",
                  }}
                  initial={{ x: "-50%" }}
                  animate={{ x: "300%" }}
                  transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {iframeSrc ? (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0 block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={handleIframeLoad}
              title="Scout Browser"
            />
          ) : (
            <EmptyState onGo={(url) => navigate(url)} />
          )}

          {/* Scan stats pill */}
          <AnimatePresence>
            {scanMode && scanStats && (
              <motion.div
                className="absolute bottom-3 left-3 flex items-center gap-2.5 px-3 py-1.5 rounded-lg font-mono text-[10px] pointer-events-none"
                style={{
                  background: "rgba(8,8,8,0.88)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                <span className="text-emerald-400">▪ {scanStats.tc} text</span>
                <div className="w-px h-3 bg-zinc-800" />
                <span className="text-sky-400">◆ {scanStats.ic} img</span>
                <div className="w-px h-3 bg-zinc-800" />
                <span className="text-zinc-700">ready</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast notifications */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2 pointer-events-none z-40">
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg font-mono text-[10px] text-emerald-300"
                  style={{
                    background: "rgba(8,8,8,0.9)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 12px rgba(16,185,129,0.12)",
                  }}
                >
                  ✓ {t.label}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Notes panel ── */}
        <motion.div
          animate={{ width: panelOpen ? 360 : 44 }}
          transition={{ type: "spring", stiffness: 320, damping: 38 }}
          className="h-full flex-shrink-0 flex flex-col relative overflow-hidden"
          style={{
            background: "rgba(8,8,8,0.98)",
            borderLeft: "1px solid #1a1a1c",
            boxShadow: panelOpen ? "-4px 0 24px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {/* Toggle handle */}
          <motion.button
            onClick={() => setPanelOpen((p) => !p)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer"
            style={{
              background: "#111113",
              border: "1px solid #222226",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            <span className="text-zinc-600 hover:text-zinc-300 transition-colors">
              {panelOpen ? <IconChevron dir="right" /> : <IconChevron dir="left" />}
            </span>
          </motion.button>

          {/* Collapsed state */}
          <AnimatePresence mode="wait">
            {!panelOpen && (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center pt-20 gap-5 w-[44px]"
              >
                <span
                  className="font-mono text-[8px] text-zinc-800 tracking-widest"
                  style={{ writingMode: "vertical-rl" }}
                >
                  NOTES
                </span>
                {notes.length > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px]"
                    style={{
                      background: "rgba(139,92,246,0.2)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "rgba(167,139,250,0.8)",
                    }}
                  >
                    {notes.length > 9 ? "9+" : notes.length}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded state */}
          <AnimatePresence mode="wait">
            {panelOpen && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 }}
                className="flex flex-col h-full w-full min-w-0"
              >
                {/* Panel header */}
                <div
                  className="px-4 py-3 flex items-center justify-between flex-shrink-0"
                  style={{
                    borderBottom: "1px solid #1a1a1c",
                    background:
                      "linear-gradient(180deg, #0d0d0e 0%, rgba(8,8,8,0) 100%)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-700">
                      SCOUT NOTES
                    </span>
                    {notes.length > 0 && (
                      <span
                        className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(139,92,246,0.15)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          color: "rgba(167,139,250,0.7)",
                        }}
                      >
                        {notes.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {notes.length > 0 && (
                      <button
                        onClick={exportMarkdown}
                        className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/40 rounded transition-all cursor-pointer"
                        title="Export as Markdown"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        MD
                      </button>
                    )}
                    {notes.length > 0 && (
                      <button
                        onClick={copyAll}
                        className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/40 rounded transition-all cursor-pointer"
                      >
                        <IconCopy />
                        ALL
                      </button>
                    )}
                    {notes.length > 0 && (
                      <button
                        onClick={() => setNotes([])}
                        className="flex items-center gap-1 px-2 py-1 font-mono text-[9px] text-zinc-800 hover:text-red-500 hover:bg-red-500/5 rounded transition-all cursor-pointer"
                      >
                        <IconX />
                        CLR
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Notes list ── */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-10">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: "rgba(16,185,129,0.06)",
                          border: "1px solid rgba(16,185,129,0.12)",
                        }}
                      >
                        <IconScan />
                      </div>
                      <p className="font-mono text-[10px] text-zinc-700 leading-loose">
                        {scanMode
                          ? "click any highlighted\nelement to capture it"
                          : "enable SCAN mode\nthen click elements"}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {notes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          copied={copiedId === note.id}
                          onCopy={() => copyNote(note.id, note.content)}
                          onDelete={() =>
                            setNotes((p) => p.filter((n) => n.id !== note.id))
                          }
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
