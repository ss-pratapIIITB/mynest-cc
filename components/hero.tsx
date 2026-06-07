"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

/* ── Cultural reference tooltip ── */
function Ref({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="text-violet-600 dark:text-violet-300 border-b border-dashed border-violet-400/40 cursor-help">
        {children}
      </span>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-56 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed text-center z-50 shadow-xl pointer-events-none bg-white dark:bg-[#141416] border border-zinc-200 dark:border-[#2a2a2e] text-zinc-600 dark:text-zinc-400">
          {tip}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-200 dark:border-t-[#2a2a2e]" />
        </span>
      )}
    </span>
  );
}

/* ── Photo ── */
function Photo() {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-[#1c1c1e] bg-zinc-100 dark:bg-[#0f0f0f] flex-shrink-0">
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 dot-grid transition-opacity duration-500"
        style={{ opacity: loaded ? 0 : 1 }}
      >
        <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center">
          <span className="font-bold text-2xl tracking-tight text-violet-600 dark:text-violet-400">
            SPS
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-700">
          add /public/profile.jpg
        </span>
      </div>

      {!errored && (
        <img
          ref={imgRef}
          src="/profile.jpg"
          alt="Surendra Pratap Singh"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}

      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.04] dark:ring-white/[0.03] pointer-events-none" />
    </div>
  );
}

/* ── Floating badge ── */
function Badge({
  children,
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg backdrop-blur-sm bg-white dark:bg-[#111113] border border-zinc-200 dark:border-[#222226]"
      style={style}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { delay, duration: 0.4 },
        scale: { delay, duration: 0.4 },
        y: {
          delay: delay + 0.4,
          duration: 2.8 + delay * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── Hero ── */
export default function Hero() {
  const [typedDone, setTypedDone] = useState(false);

  // Refs to measure letter positions after mount
  const sRef = useRef<HTMLSpanElement>(null);
  const pRef = useRef<HTMLSpanElement>(null);
  const s2Ref = useRef<HTMLSpanElement>(null);
  // Stores ONE-TIME measurements (taken at mount, scrollY=0). Never re-reads live DOM in transforms.
  const measuredRef = useRef<{
    sTop0: number;   // S initial top from viewport
    pTop0: number;   // P initial top from viewport
    s2Top0: number;  // S2 initial top from viewport
    pX: number;      // P horizontal shift (S width)
    s2X: number;     // S2 horizontal shift (S+P width)
    navY: number;    // target viewport-Y for all letters at animation end
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTypedDone(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!sRef.current || !pRef.current || !s2Ref.current) return;
      // IMPORTANT: measure only when page is at rest (ideally scrollY=0).
      // getBoundingClientRect() here is fine — it's called once, not on every frame.
      const sRect  = sRef.current.getBoundingClientRect();
      const pRect  = pRef.current.getBoundingClientRect();
      const s2Rect = s2Ref.current.getBoundingClientRect();
      const sW = sRef.current.offsetWidth;
      const pW = pRef.current.offsetWidth;

      // The nav is fixed, py-4 (16px). Target the top of the letter to sit at 16px from viewport top.
      const NAV_TOP_Y = 16;

      measuredRef.current = {
        sTop0:  sRect.top,
        pTop0:  pRect.top,
        s2Top0: s2Rect.top,
        pX:     sW,
        s2X:    sW + pW,
        navY:   NAV_TOP_Y,
      };
    };

    const t = setTimeout(measure, 200);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(t); window.removeEventListener("resize", measure); };
  }, []);

  const { scrollY } = useScroll();

  // Clamped 0→1 progress used only for opacity/x transforms (no sticky needed there)
  const progress = useTransform(scrollY, [0, 80], [0, 1]);

  // Trailing letters fade out during first 55% of animation
  const trailOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  // Dot fades in once trailing text is mostly gone
  const dotOpacity = useTransform(progress, [0.5, 1], [0, 1]);

  // ─── Y transforms: computed from scrollY directly (not progress) ───────────
  // This lets us add sticky compensation for scrollY > 80, so SPS stays at
  // nav level instead of scrolling off the top of the page.
  //
  // At scrollY=s, a letter with initial top L0 sits at (L0 - s) in the viewport.
  // We want it at navY at animation end (scrollY=80) and PINNED there beyond.
  //
  //   Phase 1 (s ∈ [0, 80]):  transform = (s/80) * (navY - L0 + 80)
  //   Phase 2 (s > 80):       transform = (navY - L0 + 80) + (s - 80)
  //                         = navY - L0 + s   ← exactly cancels scroll so letter stays at navY

  const sY = useTransform(scrollY, (s) => {
    const m = measuredRef.current;
    if (!m || m.sTop0 === 0) return 0;
    const yFinal = m.navY - m.sTop0 + 80;
    if (s <= 80) return (s / 80) * yFinal;
    return yFinal + (s - 80);
  });

  const pY = useTransform(scrollY, (s) => {
    const m = measuredRef.current;
    if (!m || m.pTop0 === 0) return 0;
    const yFinal = m.navY - m.pTop0 + 80;
    if (s <= 80) return (s / 80) * yFinal;
    return yFinal + (s - 80);
  });

  const s2Y = useTransform(scrollY, (s) => {
    const m = measuredRef.current;
    if (!m || m.s2Top0 === 0) return 0;
    const yFinal = m.navY - m.s2Top0 + 80;
    if (s <= 80) return (s / 80) * yFinal;
    return yFinal + (s - 80);
  });

  // X transforms: only during animation phase (no sticky needed horizontally)
  const pX  = useTransform(progress, (p) => p * (measuredRef.current?.pX  ?? 0));
  const s2X = useTransform(progress, (p) => p * (measuredRef.current?.s2X ?? 0));

  return (
    <section className="flex-1 flex lg:items-center px-6 sm:px-10 pt-28 pb-16 max-w-[1100px] mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center w-full">

        {/* ── Left: text ── */}
        <motion.div
          className="lg:col-span-3 space-y-7"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* Greeting */}
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span
              className={`font-mono text-sm text-green-600 dark:text-green-400 opacity-90 ${
                typedDone ? "" : "cursor-blink"
              }`}
            >
              // hello, world.
            </span>
          </motion.div>

          {/* Name — scroll-driven S P S compression */}
          <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
            <div className="relative">
              {/* Invisible spacer — holds layout height constant so nothing jumps */}
              <h1
                className="text-[3.4rem] sm:text-[4.2rem] lg:text-[5rem] font-bold tracking-[-0.03em] leading-[0.92] invisible select-none pointer-events-none"
                aria-hidden="true"
              >
                Surendra<br />Pratap<br />Singh.
              </h1>

              {/* Animated overlay — overflow:visible so letters can travel outside container bounds */}
              <div className="absolute inset-0 overflow-visible">
                <h1 className="text-[3.4rem] sm:text-[4.2rem] lg:text-[5rem] font-bold tracking-[-0.03em] leading-[0.92] overflow-visible">
                  {/* Line 1: S = black, urendra = grey */}
                  <motion.span ref={sRef} style={{ display: "inline-block", y: sY }} className="text-zinc-900 dark:text-zinc-100">S</motion.span><motion.span style={{ display: "inline-block", opacity: trailOpacity }} className="text-zinc-400 dark:text-zinc-500">urendra</motion.span>
                  <br />
                  {/* Line 2: P = black, ratap = grey */}
                  <motion.span ref={pRef} style={{ display: "inline-block", x: pX, y: pY }} className="text-zinc-900 dark:text-zinc-100">P</motion.span><motion.span style={{ display: "inline-block", opacity: trailOpacity }} className="text-zinc-400 dark:text-zinc-500">ratap</motion.span>
                  <br />
                  {/* Line 3: S = black. Dot is position:absolute so it takes zero layout space → no gap before ingh. */}
                  <motion.span ref={s2Ref} style={{ display: "inline-block", position: "relative", x: s2X, y: s2Y }} className="text-zinc-900 dark:text-zinc-100">S<motion.span className="text-zinc-400 dark:text-zinc-500" style={{ opacity: dotOpacity, position: "absolute", left: "100%", top: 0 }}>.</motion.span></motion.span><motion.span style={{ display: "inline-block", opacity: trailOpacity }} className="text-zinc-400 dark:text-zinc-500">ingh.</motion.span>
                </h1>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-10 bg-zinc-300 dark:bg-zinc-700" />
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-500 tracking-[0.18em] uppercase">
              Software Engineer
            </span>
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="text-zinc-600 dark:text-zinc-400 text-[1.05rem] leading-[1.75] max-w-[480px]"
          >
            I write software. Like everyone, I started with a{" "}
            <code className="text-green-700 dark:text-green-400 font-mono text-[0.88em] bg-green-50 dark:bg-green-400/5 px-1.5 py-0.5 rounded-md border border-green-200 dark:border-green-400/10">
              Hello, World.
            </code>{" "}
            — that first moment of the machine listening back.
          </motion.p>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-zinc-400 dark:text-zinc-600 text-[0.95rem] leading-relaxed max-w-[420px]"
          >
            I care about the craft — interfaces that feel inevitable, systems
            that hold under pressure, code that reads like it was always going
            to be this way.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <Link
              href="https://linkedin.com/in/surendra-pratap-singh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/18 border border-violet-200 dark:border-violet-500/20 hover:border-violet-300 dark:hover:border-violet-500/40 text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 text-sm font-mono rounded-xl transition-all duration-200"
            >
              linkedin
              <span className="text-violet-400/60 text-xs">↗</span>
            </Link>
            <Link
              href="https://github.com/ss-pratapIIITB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-200 dark:border-[#222226] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-sm font-mono rounded-xl transition-all duration-200"
            >
              github
              <span className="text-zinc-400 dark:text-zinc-700 text-xs">↗</span>
            </Link>
            <a
              href="mailto:surendrapratap0501@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-200 dark:border-[#222226] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 text-sm font-mono rounded-xl transition-all duration-200"
            >
              email
              <span className="text-zinc-400 dark:text-zinc-700 text-xs">↗</span>
            </a>
          </motion.div>
        </motion.div>

        {/* ── Right: photo + badges ── */}
        <motion.div
          className="lg:col-span-2 flex justify-center lg:justify-end"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-violet-500/6 via-transparent to-transparent rounded-3xl blur-2xl pointer-events-none dark:from-violet-600/8" />

            <Photo />

            <Badge style={{ top: -16, right: -56 }} delay={0.9}>
              <span className="text-green-600 dark:text-green-400">$</span>{" "}
              <span className="text-zinc-600 dark:text-zinc-400">vim .</span>
            </Badge>

            <Badge style={{ bottom: -14, left: -64 }} delay={1.3}>
              <span className="text-amber-600 dark:text-amber-400">:wq!</span>
            </Badge>

            <Badge
              style={{ top: "42%", right: -72, transform: "translateY(-50%)" }}
              delay={1.1}
            >
              <span className="text-violet-600 dark:text-violet-400">// type-safe</span>
            </Badge>

            <Badge style={{ bottom: 48, left: -60 }} delay={1.5}>
              <span className="text-zinc-500 dark:text-zinc-500">git commit</span>
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
