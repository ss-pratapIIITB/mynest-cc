"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Check, X } from "lucide-react";

import { BoardStore } from "@/lib/board/store";
import type {
  BoardDoc,
  Box,
  Element,
  EllipseElement,
  PenElement,
  RectElement,
  Tool,
} from "@/lib/board/types";
import { emptyDoc } from "@/lib/board/types";
import {
  cameraForBox,
  screenToWorld,
  viewportBox,
  zoomAt,
} from "@/lib/board/camera";
import {
  computeBox,
  hitTest,
  scaleElement,
  translateElement,
} from "@/lib/board/geometry";
import { quantizeStroke, shouldSample, simplifyStroke } from "@/lib/board/ink";
import {
  DARK_THEME,
  LIGHT_THEME,
  drawOverlay,
  drawScene,
  resizeSurface,
  type OverlayState,
  type Surface,
} from "@/lib/board/render";
import {
  BitmapCache,
  prepareImage,
  type AssetSource,
} from "@/lib/board/assets";
import {
  BoardPersister,
  clearBoard,
  loadBoard,
  localAssetSource,
  putAsset,
} from "@/lib/board/persist";
import Toolbar, { DARK_DEFAULT_INK, PALETTE } from "./toolbar";
import { publishBoard } from "@/lib/board/share";

/** Screen-pixel slop for hit tests, converted to world units per zoom level. */
const HIT_SLOP_PX = 6;
/** Screen-pixel radius for grabbing a resize handle. */
const HANDLE_SLOP_PX = 9;
/** Max images a single insert can add, to keep one drop from wedging the tab. */
const MAX_IMAGES_PER_INSERT = 20;

type Mode =
  | { kind: "idle" }
  | { kind: "draw"; el: PenElement }
  | { kind: "shape"; el: RectElement | EllipseElement; ox: number; oy: number }
  | { kind: "pan"; lastX: number; lastY: number }
  | { kind: "marquee"; ox: number; oy: number; additive: boolean }
  | {
      kind: "drag";
      lastX: number;
      lastY: number;
      originals: Map<string, Element>;
    }
  | {
      kind: "resize";
      anchorX: number;
      anchorY: number;
      startBox: Box;
      originals: Map<string, Element>;
    }
  | { kind: "erase" };

interface TextDraft {
  /** Screen position of the editor. */
  left: number;
  top: number;
  worldX: number;
  worldY: number;
  value: string;
  /** Set when editing an existing element rather than creating one. */
  editingId: string | null;
  size: number;
  color: string;
  /** Zoom captured when the editor opened — see openTextEditor. */
  zoom: number;
}

export interface BoardProps {
  /** Namespaces the IndexedDB records. Shared boards use their share id. */
  boardId?: string;
  /** Pre-loaded document — used by the read-only shared view. */
  initialDoc?: ReturnType<typeof emptyDoc>;
  /** Where image bytes come from. Defaults to IndexedDB. */
  assetSource?: AssetSource;
  readOnly?: boolean;
  shareEnabled?: boolean;
  /** Shown top-left instead of the default label. */
  title?: string;
}

export default function Board({
  boardId = "local",
  initialDoc,
  assetSource,
  readOnly = false,
  shareEnabled = false,
  title,
}: BoardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // The engine must survive re-renders without causing them. Lazy `useState`
  // gives one stable instance; React only ever sees the coarse UI state below.
  const [store] = useState(() => new BoardStore());

  const bitmapsRef = useRef<BitmapCache | null>(null);
  const persisterRef = useRef<BoardPersister | null>(null);
  const modeRef = useRef<Mode>({ kind: "idle" });
  const spaceRef = useRef(false);
  const dirtyRef = useRef({ scene: true, overlay: true });
  const lastCamRef = useRef({ x: NaN, y: NaN, z: NaN });
  const lastRevRef = useRef(-1);
  const marqueeRef = useRef<Box | null>(null);
  const draftRef = useRef<Element | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const rafRef = useRef(0);
  /**
   * Mirror of `textDraft`, cleared synchronously by `commitText`. Dismissing
   * the editor fires blur *and* pointerdown in the same tick, and both call
   * commitText from the same render closure — without this the text would be
   * committed twice, as two separate elements.
   */
  const textDraftRef = useRef<TextDraft | null>(null);
  /** Live pointers by id — a second one turns any gesture into a pinch. */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; midX: number; midY: number } | null>(
    null,
  );

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(PALETTE[0]);
  const [size, setSize] = useState(4);
  const [history, setHistory] = useState({ undo: false, redo: false });
  const [stats, setStats] = useState({ visible: 0, total: 0, zoom: 100 });
  const [textDraft, setTextDraft] = useState<TextDraft | null>(null);
  const [ready, setReady] = useState(Boolean(initialDoc));
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState<{ text: string; href?: string } | null>(
    null,
  );

  // Near-black reads as invisible on the dark canvas; swap it for the site's
  // dark ink so the default swatch works in both themes.
  const inkColor = isDark && color === PALETTE[0] ? DARK_DEFAULT_INK : color;
  const activeTool: Tool = readOnly ? "pan" : tool;

  const invalidate = useCallback((what: "scene" | "overlay" | "both") => {
    if (what !== "overlay") dirtyRef.current.scene = true;
    if (what !== "scene") dirtyRef.current.overlay = true;
  }, []);

  /* ── boot: load the document, then start persisting ── */

  useEffect(() => {
    let cancelled = false;

    const bitmaps = new BitmapCache(assetSource ?? localAssetSource, () =>
      invalidate("both"),
    );
    bitmapsRef.current = bitmaps;

    async function boot() {
      const source = initialDoc ?? (await loadBoard(boardId));
      if (cancelled) return;

      // Copy before handing over: the store takes ownership of the document
      // and mutates it, and `initialDoc` is a prop we must not touch.
      const doc: BoardDoc = {
        version: 1,
        camera: { ...source.camera },
        elements: { ...source.elements },
      };

      // Centre the world origin in the viewport on a first, empty visit.
      const el = containerRef.current;
      if (el && Object.keys(doc.elements).length === 0) {
        doc.camera = {
          x: -el.clientWidth / 2,
          y: -el.clientHeight / 2,
          z: 1,
        };
      }

      store.load(doc);
      if (!readOnly) {
        const persister = new BoardPersister(boardId, () => store.doc);
        persister.primeFrom(doc);
        persisterRef.current = persister;
      }
      invalidate("both");
      setReady(true);
    }

    void boot();

    return () => {
      cancelled = true;
      persisterRef.current?.dispose();
      persisterRef.current = null;
      bitmaps.clear();
      bitmapsRef.current = null;
    };
    // Board identity is fixed for the lifetime of the route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  /* ── store subscription: only coarse UI signals reach React ── */

  useEffect(() => {
    return store.subscribe((reason) => {
      invalidate(reason === "selection" ? "overlay" : "both");
      setHistory((prev) =>
        prev.undo === store.canUndo && prev.redo === store.canRedo
          ? prev
          : { undo: store.canUndo, redo: store.canRedo },
      );
      if (reason !== "selection") persisterRef.current?.schedule();
    });
  }, [store, invalidate]);

  /* ── flush pending writes when the tab goes away ── */

  useEffect(() => {
    if (readOnly) return;
    const flush = () => void persisterRef.current?.flush();
    // `visibilitychange` is the reliable one; `pagehide` covers bfcache.
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [readOnly]);

  /* ── render loop ── */

  useEffect(() => {
    if (!ready) return;
    const container = containerRef.current;
    const sceneCanvas = sceneRef.current;
    const overlayCanvas = overlayRef.current;
    if (!container || !sceneCanvas || !overlayCanvas) return;

    const sceneCtx = sceneCanvas.getContext("2d", { alpha: false });
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!sceneCtx || !overlayCtx) return;

    const scene: Surface = { canvas: sceneCanvas, ctx: sceneCtx };
    const overlay: Surface = { canvas: overlayCanvas, ctx: overlayCtx };

    // Held in a ref rather than closure variables: the observer writes them
    // from outside the render pass, which the compiler (rightly) rejects for
    // plain locals.
    sizeRef.current = {
      w: container.clientWidth,
      h: container.clientHeight,
    };

    const observer = new ResizeObserver(() => {
      sizeRef.current = {
        w: container.clientWidth,
        h: container.clientHeight,
      };
      invalidate("both");
    });
    observer.observe(container);
    // The effect re-runs on theme change; repaint both layers unconditionally.
    invalidate("both");

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const bitmaps = bitmapsRef.current;
      if (!bitmaps) return;

      const dpr = window.devicePixelRatio || 1;
      // Read the resolved theme off the DOM rather than from `resolvedTheme`,
      // which is undefined until next-themes hydrates. This keeps the canvas
      // in step with the CSS on the very first painted frame.
      const theme = document.documentElement.classList.contains("dark")
        ? DARK_THEME
        : LIGHT_THEME;
      const cam = store.camera;
      const { w: width, h: height } = sizeRef.current;

      if (resizeSurface(scene, width, height, dpr)) invalidate("both");
      if (resizeSurface(overlay, width, height, dpr)) invalidate("overlay");

      const camMoved =
        cam.x !== lastCamRef.current.x ||
        cam.y !== lastCamRef.current.y ||
        cam.z !== lastCamRef.current.z;
      const docChanged = store.revision !== lastRevRef.current;

      // A camera move or document change invalidates both layers; nothing
      // else touches the scene, which is what keeps ink latency flat.
      if (camMoved || docChanged) invalidate("both");

      if (dirtyRef.current.scene) {
        dirtyRef.current.scene = false;
        const s = drawScene(
          scene,
          store,
          theme,
          bitmaps,
          width,
          height,
          dpr,
          () => invalidate("both"),
        );
        // Zoom is folded into the same state so the HUD re-renders on camera
        // moves — reading store.camera during render would leave it stale.
        const zoom = Math.round(cam.z * 100);
        setStats((prev) =>
          prev.visible === s.visible &&
          prev.total === s.total &&
          prev.zoom === zoom
            ? prev
            : { visible: s.visible, total: s.total, zoom },
        );
      }

      if (dirtyRef.current.overlay) {
        dirtyRef.current.overlay = false;
        const selectedBoxes: Box[] = [];
        for (const id of store.selection) {
          const el = store.get(id);
          if (el) selectedBoxes.push(el.box);
        }
        const state: OverlayState = {
          draft: draftRef.current,
          marquee: marqueeRef.current,
          selectionBox: store.selectionBounds(),
          selectedBoxes,
        };
        drawOverlay(overlay, cam, state, theme, bitmaps, dpr, () =>
          invalidate("both"),
        );
      }

      lastCamRef.current = { x: cam.x, y: cam.y, z: cam.z };
      lastRevRef.current = store.revision;
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [ready, isDark, store, invalidate]);

  /* ── coordinate helpers ── */

  const pointerWorld = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const rect = containerRef.current!.getBoundingClientRect();
      return screenToWorld(
        store.camera,
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
    },
    [store],
  );

  /**
   * Which resize handle, if any, is under this world point. Handles are
   * defined in screen space so their grab area is constant at every zoom.
   */
  const handleAt = useCallback(
    (wx: number, wy: number): { anchorX: number; anchorY: number } | null => {
      const box = store.selectionBounds();
      if (!box) return null;
      const slop = HANDLE_SLOP_PX / store.camera.z;
      const corners: [number, number, number, number][] = [
        // [handleX, handleY, anchorX, anchorY] — anchor is the opposite corner
        [box.minX, box.minY, box.maxX, box.maxY],
        [box.maxX, box.minY, box.minX, box.maxY],
        [box.minX, box.maxY, box.maxX, box.minY],
        [box.maxX, box.maxY, box.minX, box.minY],
      ];
      for (const [hx, hy, ax, ay] of corners) {
        if (Math.abs(wx - hx) <= slop && Math.abs(wy - hy) <= slop) {
          return { anchorX: ax, anchorY: ay };
        }
      }
      return null;
    },
    [store],
  );

  const pickAt = useCallback(
    (wx: number, wy: number): Element | null => {
      const slop = HIT_SLOP_PX / store.camera.z;
      const probe: Box = {
        minX: wx - slop,
        minY: wy - slop,
        maxX: wx + slop,
        maxY: wy + slop,
      };
      // Front-to-back so the topmost element wins.
      for (const el of store.queryReverse(probe)) {
        if (hitTest(el, wx, wy, slop)) return el;
      }
      return null;
    },
    [store],
  );

  /* ── text editing ── */

  const openTextEditor = useCallback(
    (worldX: number, worldY: number, existing?: Element) => {
      const cam = store.camera;
      const el = existing?.type === "text" ? existing : null;
      const wx = el ? el.x : worldX;
      const wy = el ? el.y : worldY;
      setTextDraft({
        left: (wx - cam.x) * cam.z,
        top: (wy - cam.y) * cam.z,
        worldX: wx,
        worldY: wy,
        value: el?.text ?? "",
        editingId: el?.id ?? null,
        size: el?.size ?? Math.max(12, size * 5),
        color: el?.color ?? inkColor,
        zoom: cam.z,
      });
      // Zoom is captured at open time: the editor is dismissed on any camera
      // change, so it never needs to track a live camera during render.
      if (el) store.setSelection([]);
    },
    [inkColor, size, store],
  );

  const commitText = useCallback(() => {
    const draft = textDraftRef.current;
    textDraftRef.current = null;
    setTextDraft(null);
    if (!draft) return;
    const text = draft.value.replace(/\s+$/, "");

    if (draft.editingId) {
      if (text === "") store.remove(draft.editingId);
      else store.update(draft.editingId, (el) => ({ ...el, text }) as Element);
      return;
    }
    if (text === "") return;

    const base = {
      id: newId(),
      z: store.topZ(),
      type: "text" as const,
      x: draft.worldX,
      y: draft.worldY,
      text,
      color: draft.color,
      size: draft.size,
    };
    store.add({ ...base, box: computeBox({ ...base, box: ZERO_BOX }) });
  }, [store]);

  // Keep the mirror in sync, and move focus into the editor. `autoFocus`
  // alone is not enough: the canvas captured the pointer that opened it, and
  // without focus every keystroke falls through to the tool shortcuts.
  useEffect(() => {
    textDraftRef.current = textDraft;
    if (textDraft) textRef.current?.focus();
  }, [textDraft]);

  /* ── pointer handling ── */

  /** Midpoint and separation of the two active pointers, in client space. */
  const pinchGeometry = useCallback(() => {
    const [a, b] = [...pointersRef.current.values()];
    if (!a || !b) return null;
    return {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      midX: (a.x + b.x) / 2,
      midY: (a.y + b.y) / 2,
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      // The text editor sits inside this container, so its own pointer events
      // bubble here. Let it handle its own clicks — otherwise clicking to move
      // the caret would close the editor.
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;

      if (textDraft) {
        commitText();
        return;
      }
      // Suppress the default focus shift. Without this, mouseup moves focus to
      // the body and blurs the text editor the instant a click opens it.
      e.preventDefault();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // A second finger means the user wants to pinch, not draw. Abandon
      // whatever the first finger started — a stray one-point stroke left
      // behind by the start of a pinch is the classic touch-canvas bug.
      if (pointersRef.current.size === 2) {
        const active = modeRef.current;
        if (active.kind === "drag" || active.kind === "resize") {
          for (const [id, original] of active.originals) {
            store.updateLive(id, () => original);
          }
        } else if (active.kind === "erase") {
          store.endBatch();
        }
        modeRef.current = { kind: "idle" };
        draftRef.current = null;
        marqueeRef.current = null;
        pinchRef.current = pinchGeometry();
        invalidate("both");
        return;
      }
      if (pointersRef.current.size > 2) return;

      const { x: wx, y: wy } = pointerWorld(e);
      const wantsPan =
        e.button === 1 || spaceRef.current || activeTool === "pan";

      if (wantsPan) {
        modeRef.current = { kind: "pan", lastX: e.clientX, lastY: e.clientY };
        return;
      }
      if (readOnly) return;

      switch (activeTool) {
        case "select": {
          const handle = handleAt(wx, wy);
          if (handle && store.selection.size > 0) {
            const box = store.selectionBounds()!;
            modeRef.current = {
              kind: "resize",
              anchorX: handle.anchorX,
              anchorY: handle.anchorY,
              startBox: box,
              originals: snapshot(store, store.selection),
            };
            return;
          }

          const hit = pickAt(wx, wy);
          if (hit) {
            if (e.shiftKey) {
              const next = new Set(store.selection);
              if (next.has(hit.id)) next.delete(hit.id);
              else next.add(hit.id);
              store.setSelection(next);
            } else if (!store.selection.has(hit.id)) {
              store.setSelection([hit.id]);
            }
            if (store.selection.size > 0) {
              modeRef.current = {
                kind: "drag",
                lastX: wx,
                lastY: wy,
                originals: snapshot(store, store.selection),
              };
            }
            return;
          }

          if (!e.shiftKey) store.clearSelection();
          modeRef.current = {
            kind: "marquee",
            ox: wx,
            oy: wy,
            additive: e.shiftKey,
          };
          marqueeRef.current = { minX: wx, minY: wy, maxX: wx, maxY: wy };
          invalidate("overlay");
          return;
        }

        case "pen": {
          const el: PenElement = {
            id: newId(),
            z: store.topZ(),
            type: "pen",
            points: [wx, wy, e.pressure > 0 ? e.pressure : 0.5],
            color: inkColor,
            size: size,
            box: ZERO_BOX,
          };
          el.box = computeBox(el);
          // The in-flight stroke lives on the overlay, never in the store, so
          // the scene layer isn't rebuilt on every pointer sample.
          draftRef.current = el;
          modeRef.current = { kind: "draw", el };
          invalidate("overlay");
          return;
        }

        case "rect":
        case "ellipse": {
          const el = {
            id: newId(),
            z: store.topZ(),
            type: activeTool,
            x: wx,
            y: wy,
            w: 0,
            h: 0,
            color: inkColor,
            fill: null,
            size: size,
            box: ZERO_BOX,
          } as RectElement | EllipseElement;
          el.box = computeBox(el);
          draftRef.current = el;
          modeRef.current = { kind: "shape", el, ox: wx, oy: wy };
          invalidate("overlay");
          return;
        }

        case "text": {
          const hit = pickAt(wx, wy);
          openTextEditor(wx, wy, hit?.type === "text" ? hit : undefined);
          return;
        }

        case "eraser": {
          modeRef.current = { kind: "erase" };
          store.beginBatch();
          eraseAt(store, wx, wy, HIT_SLOP_PX / store.camera.z);
          return;
        }
      }
    },
    [
      activeTool,
      commitText,
      handleAt,
      inkColor,
      invalidate,
      openTextEditor,
      pickAt,
      pinchGeometry,
      pointerWorld,
      readOnly,
      size,
      store,
      textDraft,
    ],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Pinch: scale about the midpoint of the two fingers and pan by however
      // far that midpoint travelled, so the canvas tracks the gesture exactly.
      if (pinchRef.current) {
        const next = pinchGeometry();
        const prev = pinchRef.current;
        if (!next || prev.dist < 1 || next.dist < 1) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const zoomed = zoomAt(
          store.camera,
          next.midX - rect.left,
          next.midY - rect.top,
          next.dist / prev.dist,
        );
        store.setCamera({
          ...zoomed,
          x: zoomed.x - (next.midX - prev.midX) / zoomed.z,
          y: zoomed.y - (next.midY - prev.midY) / zoomed.z,
        });
        pinchRef.current = next;
        return;
      }

      const mode = modeRef.current;
      if (mode.kind === "idle") return;

      if (mode.kind === "pan") {
        const dx = e.clientX - mode.lastX;
        const dy = e.clientY - mode.lastY;
        const cam = store.camera;
        store.setCamera({
          ...cam,
          x: cam.x - dx / cam.z,
          y: cam.y - dy / cam.z,
        });
        mode.lastX = e.clientX;
        mode.lastY = e.clientY;
        return;
      }

      const { x: wx, y: wy } = pointerWorld(e);

      switch (mode.kind) {
        case "draw": {
          // Coalesced events recover the full pointer sample rate; the browser
          // otherwise hands us one event per frame and strokes come out faceted.
          const events =
            typeof e.nativeEvent.getCoalescedEvents === "function"
              ? e.nativeEvent.getCoalescedEvents()
              : [e.nativeEvent];
          const rect = containerRef.current!.getBoundingClientRect();
          const cam = store.camera;
          for (const ev of events.length > 0 ? events : [e.nativeEvent]) {
            const px = (ev.clientX - rect.left) / cam.z + cam.x;
            const py = (ev.clientY - rect.top) / cam.z + cam.y;
            if (!shouldSample(mode.el.points, px, py, 0.35 / cam.z)) continue;
            mode.el.points.push(px, py, ev.pressure > 0 ? ev.pressure : 0.5);
          }
          mode.el.box = computeBox(mode.el);
          draftRef.current = { ...mode.el };
          invalidate("overlay");
          return;
        }

        case "shape": {
          const el = mode.el;
          // Shift constrains to a square / circle.
          let w = wx - mode.ox;
          let h = wy - mode.oy;
          if (e.shiftKey) {
            const s = Math.max(Math.abs(w), Math.abs(h));
            w = Math.sign(w || 1) * s;
            h = Math.sign(h || 1) * s;
          }
          el.w = w;
          el.h = h;
          el.box = computeBox(el);
          draftRef.current = { ...el };
          invalidate("overlay");
          return;
        }

        case "marquee": {
          marqueeRef.current = {
            minX: Math.min(mode.ox, wx),
            minY: Math.min(mode.oy, wy),
            maxX: Math.max(mode.ox, wx),
            maxY: Math.max(mode.oy, wy),
          };
          invalidate("overlay");
          return;
        }

        case "drag": {
          const dx = wx - mode.lastX;
          const dy = wy - mode.lastY;
          if (dx === 0 && dy === 0) return;
          mode.lastX = wx;
          mode.lastY = wy;
          for (const id of store.selection) {
            store.updateLive(id, (el) => translateElement(el, dx, dy));
          }
          invalidate("both");
          return;
        }

        case "resize": {
          const { anchorX, anchorY, startBox, originals } = mode;
          const startW = startBox.maxX - startBox.minX;
          const startH = startBox.maxY - startBox.minY;
          if (startW < 1e-6 || startH < 1e-6) return;

          // Scale is measured from the fixed anchor corner to the pointer.
          const spanX = Math.abs(wx - anchorX);
          const spanY = Math.abs(wy - anchorY);
          let sx = spanX / startW;
          let sy = spanY / startH;
          if (e.shiftKey || originals.size > 1) {
            // Uniform scale keeps multi-selections and shift-drags proportional.
            const s = Math.max(sx, sy);
            sx = s;
            sy = s;
          }
          sx = Math.max(0.02, sx);
          sy = Math.max(0.02, sy);

          for (const [id, original] of originals) {
            store.updateLive(id, () =>
              scaleElement(original, anchorX, anchorY, sx, sy),
            );
          }
          invalidate("both");
          return;
        }

        case "erase": {
          eraseAt(store, wx, wy, HIT_SLOP_PX / store.camera.z);
          return;
        }
      }
    },
    [invalidate, pinchGeometry, pointerWorld, store],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pinchRef.current) {
        // Lifting one finger of a pinch must not start a new gesture with the
        // other, so stay idle until every pointer is up.
        if (pointersRef.current.size < 2) pinchRef.current = null;
        return;
      }

      const mode = modeRef.current;
      modeRef.current = { kind: "idle" };
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      switch (mode.kind) {
        case "draw": {
          draftRef.current = null;
          const el = mode.el;
          // A tap with no travel is a dot, which is legitimate — but an empty
          // buffer is not.
          if (el.points.length < 3) {
            invalidate("overlay");
            return;
          }
          const points = quantizeStroke(
            simplifyStroke(el.points, 0.6 / store.camera.z),
          );
          const committed: PenElement = { ...el, points, box: ZERO_BOX };
          committed.box = computeBox(committed);
          store.add(committed);
          invalidate("both");
          return;
        }

        case "shape": {
          draftRef.current = null;
          const el = mode.el;
          // Discard degenerate drags — usually a mis-click, not a shape.
          if (Math.abs(el.w) < 2 && Math.abs(el.h) < 2) {
            invalidate("overlay");
            return;
          }
          store.add(el);
          store.setSelection([el.id]);
          invalidate("both");
          return;
        }

        case "marquee": {
          const box = marqueeRef.current;
          marqueeRef.current = null;
          if (box) {
            const hits = store.selectInBox(box);
            store.setSelection(
              mode.additive ? [...store.selection, ...hits] : hits,
            );
          }
          invalidate("overlay");
          return;
        }

        case "drag":
        case "resize": {
          // One history entry for the whole gesture.
          store.commitLive(mode.originals);
          invalidate("both");
          return;
        }

        case "erase": {
          store.endBatch();
          return;
        }
      }
    },
    [invalidate, store],
  );

  /* ── wheel: pan, and pinch/ctrl to zoom ── */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Must be non-passive: browsers zoom the page otherwise.
      e.preventDefault();
      if (textDraft) commitText();

      const rect = container.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      // Trackpad pinch arrives as a wheel event with ctrlKey set.
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        store.setCamera(zoomAt(store.camera, sx, sy, factor));
        return;
      }
      const cam = store.camera;
      store.setCamera({
        ...cam,
        x: cam.x + e.deltaX / cam.z,
        y: cam.y + e.deltaY / cam.z,
      });
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [store, textDraft, commitText]);

  /* ── keyboard ── */

  const zoomToFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = store.bounds();
    if (!bounds) {
      store.setCamera({
        x: -container.clientWidth / 2,
        y: -container.clientHeight / 2,
        z: 1,
      });
      return;
    }
    store.setCamera(
      cameraForBox(bounds, container.clientWidth, container.clientHeight, 0.12),
    );
  }, [store]);

  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) {
        spaceRef.current = true;
        e.preventDefault();
        return;
      }
      if (isTyping(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (readOnly) return;
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        // Reset zoom about the viewport centre, not the world origin.
        const cam = store.camera;
        const cx = cam.x + container.clientWidth / 2 / cam.z;
        const cy = cam.y + container.clientHeight / 2 / cam.z;
        store.setCamera({
          x: cx - container.clientWidth / 2,
          y: cy - container.clientHeight / 2,
          z: 1,
        });
        return;
      }
      if (e.shiftKey && e.key === "!") {
        e.preventDefault();
        zoomToFit();
        return;
      }
      if (mod) return;

      if (e.key === "Escape") {
        store.clearSelection();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !readOnly) {
        if (store.selection.size === 0) return;
        e.preventDefault();
        store.removeMany([...store.selection]);
        store.clearSelection();
        return;
      }
      if (readOnly) return;

      const map: Record<string, Tool> = {
        v: "select",
        h: "pan",
        p: "pen",
        r: "rect",
        o: "ellipse",
        t: "text",
        e: "eraser",
      };
      const next = map[e.key.toLowerCase()];
      if (next) setTool(next);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceRef.current = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [readOnly, store, zoomToFit]);

  /* ── images: file picker, paste, drop ── */

  const insertImages = useCallback(
    async (files: File[], atWorld?: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container || readOnly) return;

      const images = files
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, MAX_IMAGES_PER_INSERT);
      if (images.length === 0) return;

      const cam = store.camera;
      const view = viewportBox(
        cam,
        container.clientWidth,
        container.clientHeight,
      );
      let cursorX = atWorld?.x ?? view.minX + (view.maxX - view.minX) * 0.5;
      let cursorY = atWorld?.y ?? view.minY + (view.maxY - view.minY) * 0.5;

      store.beginBatch();
      for (const file of images) {
        try {
          const prepared = await prepareImage(file);
          await Promise.all([
            putAsset(prepared.assetId, "full", prepared.full),
            putAsset(prepared.assetId, "thumb", prepared.thumb),
          ]);

          // Fit to ~45% of the viewport's shorter side, so a huge photo
          // doesn't land larger than the screen.
          const target =
            Math.min(view.maxX - view.minX, view.maxY - view.minY) * 0.45;
          const scale = Math.min(
            1,
            target / Math.max(prepared.width, prepared.height),
          );
          const w = prepared.width * scale;
          const h = prepared.height * scale;

          const el: Element = {
            id: newId(),
            z: store.topZ(),
            type: "image",
            x: cursorX - w / 2,
            y: cursorY - h / 2,
            w,
            h,
            assetId: prepared.assetId,
            naturalW: prepared.width,
            naturalH: prepared.height,
            placeholder: prepared.placeholder,
            box: ZERO_BOX,
          };
          el.box = computeBox(el);
          store.add(el);

          // Cascade multiple drops so they don't stack exactly.
          cursorX += 24;
          cursorY += 24;
        } catch {
          setToast({ text: "Could not read that image." });
        }
      }
      store.endBatch();
      invalidate("both");
    },
    [invalidate, readOnly, store],
  );

  useEffect(() => {
    if (readOnly) return;
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.some((f) => f.type.startsWith("image/"))) {
        e.preventDefault();
        void insertImages(files);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [insertImages, readOnly]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (readOnly) return;
      void insertImages([...e.dataTransfer.files], pointerWorld(e));
    },
    [insertImages, pointerWorld, readOnly],
  );

  /* ── actions ── */

  const onClear = useCallback(() => {
    if (store.size === 0) return;
    if (!window.confirm("Clear the whole board? This cannot be undone."))
      return;
    store.load(emptyDoc());
    void clearBoard(boardId);
    zoomToFit();
    invalidate("both");
  }, [boardId, invalidate, store, zoomToFit]);

  const onShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);
    setToast(null);
    try {
      const url = await publishBoard(store);
      await navigator.clipboard?.writeText(url).catch(() => {});
      setToast({ text: "Link copied", href: url });
    } catch (err) {
      setToast({
        text: err instanceof Error ? err.message : "Could not publish board.",
      });
    } finally {
      setSharing(false);
    }
  }, [sharing, store]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── render ── */

  const cursor =
    activeTool === "pan"
      ? "grab"
      : tool === "select"
        ? "default"
        : tool === "text"
          ? "text"
          : "crosshair";

  return (
    // Chrome is a *sibling* of the canvas container, not a child: nested
    // inside it, every toolbar click would also bubble into the pointer
    // handlers and start a phantom stroke behind the button.
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden touch-none select-none"
        // The site's own token, not a JS-derived colour: `resolvedTheme` is
      // undefined during SSR, so branching on it here renders a light
      // background on the server and a dark one on the client.
      style={{ cursor, background: "var(--bg)" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={sceneRef} className="absolute inset-0" />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Text editor — a real textarea so IME, autocorrect and a11y all work. */}
        {textDraft && (
          <textarea
            ref={textRef}
            autoFocus
            value={textDraft.value}
            onChange={(e) =>
              setTextDraft((d) => (d ? { ...d, value: e.target.value } : d))
            }
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setTextDraft(null);
              }
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                commitText();
              }
            }}
            spellCheck={false}
            className="absolute z-30 bg-transparent border-none outline-none resize-none overflow-hidden p-0 m-0"
            style={{
              left: textDraft.left,
              top: textDraft.top,
              color: textDraft.color,
              fontSize: textDraft.size * textDraft.zoom,
              lineHeight: 1.3,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", monospace',
              minWidth: 8,
              width: `${Math.max(
                8,
                Math.max(
                  ...textDraft.value.split("\n").map((l) => l.length),
                  8,
                ) *
                  textDraft.size *
                  textDraft.zoom *
                  0.6,
              )}px`,
              height: `${
                textDraft.value.split("\n").length *
                textDraft.size *
                textDraft.zoom *
                1.3
              }px`,
            }}
          />
        )}
      </div>

      {/* Top-left: back link and status */}
      <div className="fixed top-4 left-4 z-40 flex items-center gap-3">
        <Link
          href="/"
          className="font-mono text-xs px-2.5 py-1.5 rounded-lg text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 transition-colors"
        >
          ← home
        </Link>
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 tabular-nums hidden sm:block">
          {title ?? "/board"} · {stats.visible}/{stats.total} drawn ·{" "}
          {stats.zoom}%
        </span>
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-xs bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-lg">
          <Check size={13} className="text-green-500 shrink-0" />
          {toast.href ? (
            <a
              href={toast.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 dark:text-zinc-300 underline underline-offset-2 truncate max-w-[50vw]"
            >
              {toast.text} — open
            </a>
          ) : (
            <span className="text-zinc-700 dark:text-zinc-300">
              {toast.text}
            </span>
          )}
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {!readOnly && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void insertImages([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <Toolbar
            tool={tool}
            onTool={setTool}
            color={color}
            onColor={setColor}
            size={size}
            onSize={setSize}
            canUndo={history.undo}
            canRedo={history.redo}
            onUndo={() => store.undo()}
            onRedo={() => store.redo()}
            onClear={onClear}
            onFit={zoomToFit}
            onImage={() => fileRef.current?.click()}
            onShare={() => void onShare()}
            sharing={sharing}
            shareEnabled={shareEnabled}
          />
        </>
      )}
    </>
  );
}

/* ── helpers ── */

const ZERO_BOX: Box = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
}

function snapshot(store: BoardStore, ids: Iterable<string>) {
  const out = new Map<string, Element>();
  for (const id of ids) {
    const el = store.get(id);
    if (el) out.set(id, el);
  }
  return out;
}

function eraseAt(store: BoardStore, wx: number, wy: number, slop: number) {
  const probe: Box = {
    minX: wx - slop,
    minY: wy - slop,
    maxX: wx + slop,
    maxY: wy + slop,
  };
  for (const el of store.queryReverse(probe)) {
    if (hitTest(el, wx, wy, slop)) {
      store.remove(el.id);
      return; // one element per sample keeps erasing feel deliberate
    }
  }
}
