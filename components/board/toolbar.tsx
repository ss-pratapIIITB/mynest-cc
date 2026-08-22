"use client";

import {
  Circle,
  Eraser,
  Hand,
  ImagePlus,
  Loader2,
  Maximize,
  MousePointer2,
  Pen,
  Redo2,
  Share2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";
import type { Tool } from "@/lib/board/types";

export const PALETTE = [
  "#111111",
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
];

/**
 * Dark-mode substitute for the near-black swatch, so ink stays visible.
 * Deliberately the same pair of values as the site's `--text` token, which is
 * how the swatch below can flip themes in pure CSS.
 */
export const DARK_DEFAULT_INK = "#e2e2df";

export const SIZES = [2, 4, 8, 16];

const TOOLS: { tool: Tool; icon: typeof Pen; label: string; key: string }[] = [
  { tool: "select", icon: MousePointer2, label: "Select", key: "V" },
  { tool: "pan", icon: Hand, label: "Pan", key: "H" },
  { tool: "pen", icon: Pen, label: "Pen", key: "P" },
  { tool: "rect", icon: Square, label: "Rectangle", key: "R" },
  { tool: "ellipse", icon: Circle, label: "Ellipse", key: "O" },
  { tool: "text", icon: Type, label: "Text", key: "T" },
  { tool: "eraser", icon: Eraser, label: "Eraser", key: "E" },
];

const btn =
  "grid place-items-center w-8 h-8 rounded-lg transition-colors duration-100 disabled:opacity-30 disabled:pointer-events-none";
const idle =
  "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-500/10";
const active = "bg-violet-600 text-white";

const shell =
  "flex items-center gap-1 p-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 " +
  "bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md shadow-lg shadow-black/5";

interface Props {
  tool: Tool;
  onTool: (t: Tool) => void;
  color: string;
  onColor: (c: string) => void;
  size: number;
  onSize: (s: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onFit: () => void;
  onImage: () => void;
  onShare: () => void;
  sharing: boolean;
  shareEnabled: boolean;
}

export default function Toolbar({
  tool,
  onTool,
  color,
  onColor,
  size,
  onSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onFit,
  onImage,
  onShare,
  sharing,
  shareEnabled,
}: Props) {
  // The default swatch tracks the theme through `--text` rather than a
  // JS-resolved colour: the theme is unknown during SSR, so branching on it
  // here renders one colour on the server and another on the client.
  const swatch = (c: string) => (c === PALETTE[0] ? "var(--text)" : c);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
        {/* Tools */}
        <div className={shell}>
          {TOOLS.map(({ tool: t, icon: Icon, label, key }) => (
            <button
              key={t}
              onClick={() => onTool(t)}
              title={`${label} (${key})`}
              aria-label={label}
              aria-pressed={tool === t}
              className={`${btn} ${tool === t ? active : idle}`}
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          ))}
          <span className="w-px h-5 mx-0.5 bg-zinc-200 dark:bg-zinc-800" />
          <button
            onClick={onImage}
            title="Insert image"
            aria-label="Insert image"
            className={`${btn} ${idle}`}
          >
            <ImagePlus size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Colour + weight */}
        <div className={shell}>
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => onColor(c)}
              title={c}
              aria-label={`Colour ${c}`}
              aria-pressed={color === c}
              className="grid place-items-center w-8 h-8 rounded-lg hover:bg-zinc-500/10 transition-colors"
            >
              <span
                className={`block rounded-full transition-all duration-100 ${
                  color === c
                    ? "w-4 h-4 ring-2 ring-offset-2 ring-violet-500 ring-offset-white dark:ring-offset-zinc-950"
                    : "w-3.5 h-3.5"
                }`}
                style={{ background: swatch(c) }}
              />
            </button>
          ))}
          <span className="w-px h-5 mx-0.5 bg-zinc-200 dark:bg-zinc-800" />
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onSize(s)}
              title={`${s}px`}
              aria-label={`Stroke width ${s}`}
              aria-pressed={size === s}
              className={`${btn} ${size === s ? "bg-zinc-500/15" : "hover:bg-zinc-500/10"}`}
            >
              <span
                className="block rounded-full bg-zinc-600 dark:bg-zinc-400"
                style={{ width: 2 + s * 0.7, height: 2 + s * 0.7 }}
              />
            </button>
          ))}
        </div>

        {/* Document actions */}
        <div className={shell}>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (⌘Z)"
            aria-label="Undo"
            className={`${btn} ${idle}`}
          >
            <Undo2 size={15} strokeWidth={2} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (⇧⌘Z)"
            aria-label="Redo"
            className={`${btn} ${idle}`}
          >
            <Redo2 size={15} strokeWidth={2} />
          </button>
          <button
            onClick={onFit}
            title="Zoom to fit (⇧1)"
            aria-label="Zoom to fit"
            className={`${btn} ${idle}`}
          >
            <Maximize size={15} strokeWidth={2} />
          </button>
          <button
            onClick={onClear}
            title="Clear board"
            aria-label="Clear board"
            className={`${btn} ${idle} hover:text-red-500`}
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
          {shareEnabled && (
            <>
              <span className="w-px h-5 mx-0.5 bg-zinc-200 dark:bg-zinc-800" />
              <button
                onClick={onShare}
                disabled={sharing}
                title="Publish a read-only link"
                aria-label="Share board"
                className={`${btn} ${idle}`}
              >
                {sharing ? (
                  <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                ) : (
                  <Share2 size={15} strokeWidth={2} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
