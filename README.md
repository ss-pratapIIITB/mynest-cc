# mynest.cc

Personal site — [mynest.cc](https://mynest.cc)

## Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | [Framer Motion 12](https://www.framer.com/motion/) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Runtime | React 19 |
| Deploy | Vercel |

## `/board` — infinite canvas

A hand-rolled infinite drawing board. Pen, shapes, text, images; pan and zoom
without bounds. Everything lives in the visitor's own browser (IndexedDB), so
it loads instantly, works offline, and needs no backend.

How it stays fast with thousands of elements:

| Technique | Where | Why |
|---|---|---|
| World coordinates + camera transform | `lib/board/camera.ts` | Nothing is actually infinite — one viewport-sized canvas, projected |
| R-tree viewport culling | `lib/board/store.ts` | Draw and hit-test only what's on screen, not what exists |
| Layered canvases | `lib/board/render.ts` | In-flight ink redraws alone; the scene isn't rebuilt per sample |
| Level of detail | `lib/board/render.ts` | Tiny elements become proxies; small images use thumbnails |
| Stroke simplification | `lib/board/ink.ts` | Ramer–Douglas–Peucker cuts stored points ~10× |
| Incremental persistence | `lib/board/persist.ts` | Reference-diff writes only changed elements |
| Content-addressed images | `lib/board/assets.ts` | Downscaled client-side, hashed, deduped, cached with a byte budget |

Measured in Chromium, 5 000 stroke elements: **400 ms** cold load, 60 fps
panning (12 elements actually drawn at 100 % zoom). 20 000 elements: 672 ms.

Publishing a read-only link needs a Vercel Blob store (`BLOB_READ_WRITE_TOKEN`).
Without one the board still works completely; the share button is hidden.

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

Connected to Vercel via GitHub. Pushes to `main` auto-deploy to [mynest.cc](https://mynest.cc).
