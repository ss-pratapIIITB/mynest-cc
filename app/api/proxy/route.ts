import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import postcss from "postcss";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

/* ── SSRF blocklist ── */
const PRIVATE = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0/,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /\.internal$/i,
  /\.local$/i,
  /^metadata\.google\.internal$/i,
];

function ssrfSafe(u: URL): boolean {
  return !PRIVATE.some((r) => r.test(u.hostname));
}

/* ── In-memory rate limiter (60 req / 5 min / IP) ── */
const rl = new Map<string, { n: number; reset: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const TTL = 5 * 60 * 1000;
  const MAX = 60;
  const e = rl.get(ip) ?? { n: 0, reset: now + TTL };
  if (now > e.reset) { rl.set(ip, { n: 1, reset: now + TTL }); return false; }
  if (e.n >= MAX) return true;
  rl.set(ip, { n: e.n + 1, reset: e.reset });
  return false;
}

/* ── URL rewriter ── */
function rewriteUrl(href: string, base: string): string {
  if (!href) return href;
  const skip = ["data:", "javascript:", "#", "mailto:", "tel:", "blob:", "{"];
  if (skip.some((p) => href.startsWith(p))) return href;
  if (href.startsWith("//")) href = "https:" + href;
  try {
    return `/api/proxy?url=${encodeURIComponent(new URL(href, base).toString())}`;
  } catch {
    return href;
  }
}

/* ── CSS rewriter (PostCSS synchronous parse/walk) ── */
function rewriteCss(css: string, base: string): string {
  try {
    const root = postcss.parse(css);
    root.walkDecls((decl) => {
      if (!decl.value.includes("url(")) return;
      decl.value = decl.value.replace(
        /url\(\s*(['"]?)([^'")\s]*)\1\s*\)/gi,
        (_, q, u) => u.startsWith("data:") ? `url(${q}${u}${q})` : `url(${q}${rewriteUrl(u, base)}${q})`
      );
    });
    root.walkAtRules("import", (rule) => {
      rule.params = rule.params
        .replace(/url\(\s*(['"]?)([^'")\s]*)\1\s*\)/gi, (_, q, u) =>
          `url(${q}${rewriteUrl(u, base)}${q})`
        )
        .replace(/^(['"])([^'"]+)\1$/, (_, q, u) =>
          `${q}${rewriteUrl(u, base)}${q}`
        );
    });
    return root.toString();
  } catch {
    return css;
  }
}

/* ── Early head script: runs before any page JS ──
   1. history.replaceState so SPA routers see the correct pathname
   2. fetch + XHR patches so even module-level fetches are intercepted
   3. Theme support
── */
const INJECT_HEAD = (actualUrl: string) => {
  const safe = actualUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  let u: URL;
  try { u = new URL(actualUrl); } catch { u = new URL("https://example.com"); }
  const pathname = u.pathname.replace(/'/g, "\\'");
  const search   = u.search.replace(/'/g, "\\'");
  const hash     = u.hash.replace(/'/g, "\\'");
  return `<script>
(function(){
  var SRC="${safe}";
  var ORIGIN=SRC.replace(/^(https?:\\/\\/[^\\/]+).*$/,'$1');

  /* ── Fix SPA routing: make window.location.pathname match the real URL ── */
  try{history.replaceState({},'','${pathname}${search}${hash}');}catch(e){}

  /* ── Route URL through proxy ── */
  function px(url){
    if(!url)return url;
    var s=String(url);
    if(s.startsWith('/api/proxy')||s.startsWith('data:')||s.startsWith('blob:')||s.startsWith('javascript:'))return s;
    try{
      if(s.startsWith('http://')||s.startsWith('https://')){}
      else if(s.startsWith('//'))s='https:'+s;
      else if(s.startsWith('/'))s=ORIGIN+s;
      else s=new URL(s,SRC).toString();
    }catch(e){return url;}
    return '/api/proxy?url='+encodeURIComponent(s);
  }
  window.__scoutPx=px;

  /* ── Patch fetch ── */
  var _fetch=window.fetch;
  window.fetch=function(input,init){
    try{
      var url=typeof input==='string'?input:(input&&input.url?input.url:String(input));
      var p=px(url);
      if(p!==url)input=typeof input==='string'?p:new Request(p,input);
    }catch(e){}
    return _fetch.apply(this,arguments);
  };

  /* ── Patch XHR ── */
  var _open=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(m,url){
    try{arguments[1]=px(String(url));}catch(e){}
    return _open.apply(this,arguments);
  };

  /* ── Theme (dark / light mode inheritance) ── */
  var DARK_STYLE=null;
  function applyTheme(dark){
    if(DARK_STYLE){DARK_STYLE.remove();DARK_STYLE=null;}
    if(!dark)return;
    DARK_STYLE=document.createElement('style');
    DARK_STYLE.id='__scout_theme__';
    DARK_STYLE.textContent=[
      'html{filter:invert(1) hue-rotate(180deg)!important;background:#000!important}',
      'img,video,canvas,picture,svg[width][height],iframe{filter:invert(1) hue-rotate(180deg)!important}'
    ].join('');
    document.head.appendChild(DARK_STYLE);
  }
  window.__scoutTheme=applyTheme;

  window.addEventListener('message',function(e){
    if(!e.data)return;
    if(e.data.type==='scout:theme')applyTheme(!!e.data.dark);
  });
})();
</script>`;
};

/* ── Late body script: scanner + capture ── */
const INJECT_BODY = (actualUrl: string) => {
  const safe = actualUrl.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `<script>
(function(){
  var SRC="${safe}";
  var px=window.__scoutPx||function(u){return u;};

  /* ── Scanner ── */
  var MIN=90,ACTIVE=false;
  function post(d){try{window.parent.postMessage(d,'*')}catch(e){}}
  function flash(el,c){var b=el.style.backgroundColor;el.style.backgroundColor=c;el.style.transition='background-color .5s';setTimeout(function(){el.style.backgroundColor=b;},500);}

  function applyStyles(){
    [].forEach.call(document.querySelectorAll('[data-s="t"]'),function(el){
      if(ACTIVE){el.style.outline='1.5px solid rgba(16,185,129,.4)';el.style.cursor='crosshair';}
      else{el.style.outline='';el.style.cursor='';el.style.boxShadow='';}
    });
    [].forEach.call(document.querySelectorAll('[data-s="i"]'),function(img){
      if(ACTIVE){img.style.outline='1.5px solid rgba(56,189,248,.4)';img.style.cursor='crosshair';}
      else{img.style.outline='';img.style.cursor='';img.style.boxShadow='';}
    });
  }

  function bindText(el){
    if(el.dataset.s)return;el.dataset.s='t';
    el.style.transition='outline .15s,box-shadow .15s,background-color .5s';
    el.onmouseenter=function(){if(!ACTIVE)return;el.style.outline='2px solid #10b981';el.style.boxShadow='0 0 14px rgba(16,185,129,.32),inset 0 0 8px rgba(16,185,129,.06)';};
    el.onmouseleave=function(){if(!ACTIVE)return;el.style.outline='1.5px solid rgba(16,185,129,.4)';el.style.boxShadow='';};
    el.onclick=function(e){if(!ACTIVE)return;e.preventDefault();e.stopPropagation();var t=(el.innerText||el.textContent||'').trim();post({type:'scout:capture',contentType:'text',content:t,tag:el.tagName.toLowerCase(),url:SRC});flash(el,'rgba(16,185,129,.1)');};
  }
  function bindImg(img){
    if(img.dataset.s)return;img.dataset.s='i';
    img.style.transition='outline .15s,box-shadow .15s';
    img.onmouseenter=function(){if(!ACTIVE)return;img.style.outline='2px solid #38bdf8';img.style.boxShadow='0 0 14px rgba(56,189,248,.32)';};
    img.onmouseleave=function(){if(!ACTIVE)return;img.style.outline='1.5px solid rgba(56,189,248,.4)';img.style.boxShadow='';};
    img.onclick=function(e){if(!ACTIVE)return;e.preventDefault();e.stopPropagation();post({type:'scout:capture',contentType:'image',content:img.src,alt:img.alt||'',url:SRC});flash(img,'rgba(56,189,248,.14)');};
  }
  function scan(){
    var tc=0,ic=0;
    ['p','h1','h2','h3','h4','h5','h6','li','blockquote','article','td','dd'].forEach(function(tag){
      [].forEach.call(document.querySelectorAll(tag),function(el){var t=(el.innerText||el.textContent||'').trim();if(t.length>=MIN){bindText(el);tc++;}});
    });
    [].forEach.call(document.querySelectorAll('img[src]'),function(img){var w=img.naturalWidth||img.width||0,h=img.naturalHeight||img.height||0;if(w>60&&h>60){bindImg(img);ic++;}});
    applyStyles();
    post({type:'scout:scan-complete',textCount:tc,imgCount:ic});
  }

  /* ── Intercept _blank / _top links ── */
  document.addEventListener('click',function(e){
    var a=e.target&&(e.target.tagName==='A'?e.target:e.target.closest('a'));
    if(!a)return;
    var href=a.getAttribute('href');
    if(!href||href.startsWith('javascript:')||href.startsWith('#'))return;
    if(a.target==='_blank'||a.target==='_top'||a.target==='_parent'){
      e.preventDefault();e.stopPropagation();
      try{
        var abs=href.startsWith('http')?href:(href.startsWith('//')?'https:'+href:new URL(href,SRC).toString());
        post({type:'scout:navigate',url:abs});
      }catch(err){}
    }
  },true);

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',function(){setTimeout(scan,400);})
    :setTimeout(scan,400);

  window.addEventListener('message',function(e){
    if(!e.data)return;
    if(e.data.type==='scout:activate'){ACTIVE=true;scan();}
    else if(e.data.type==='scout:deactivate'){ACTIVE=false;applyStyles();}
    else if(e.data.type==='scout:rescan')scan();
  });
})();
</script>`;
};

/* ── Reader mode HTML shell ── */
function readerHtml(article: { title: string; byline: string | null; content: string; siteName: string | null }, actualUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${article.title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--ink:#e4e4e7;--muted:#71717a;--bg:#0c0c0e;--line:#1e1e22;--accent:#10b981;--link:#a78bfa}
  html{background:var(--bg);color:var(--ink);font-family:Georgia,serif;font-size:18px;line-height:1.75;padding:0 1rem 4rem}
  body{max-width:680px;margin:0 auto;padding:2.5rem 0}
  header{border-bottom:1px solid var(--line);padding-bottom:1.5rem;margin-bottom:2rem}
  .site{font-family:monospace;font-size:11px;letter-spacing:.1em;color:var(--accent);text-transform:uppercase;margin-bottom:.75rem}
  h1{font-size:1.7rem;line-height:1.25;color:#f4f4f5;font-weight:700;margin-bottom:.6rem}
  .byline{font-family:monospace;font-size:12px;color:var(--muted)}
  .byline a{color:inherit;text-decoration:none}
  article h1,article h2,article h3,article h4{color:#f4f4f5;margin:1.8em 0 .5em;line-height:1.25}
  article h2{font-size:1.25rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
  article h3{font-size:1.05rem}
  article p{margin:.9em 0;color:var(--ink)}
  article a{color:var(--link);text-decoration:underline;text-underline-offset:3px}
  article img{max-width:100%;height:auto;border-radius:6px;margin:1.25em 0;border:1px solid var(--line)}
  article ul,article ol{padding-left:1.6rem;margin:.8em 0}
  article li{margin:.3em 0}
  article blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:var(--muted);margin:1.25em 0;font-style:italic}
  article pre,article code{font-family:monospace;background:#111114;border:1px solid var(--line);border-radius:4px}
  article pre{padding:.75rem 1rem;overflow-x:auto;margin:.8em 0;font-size:.85rem}
  article code{font-size:.85em;padding:.1em .35em}
  article pre code{padding:0;border:none;background:none}
  article figure{margin:1.5em 0}
  article figcaption{font-size:.8rem;color:var(--muted);text-align:center;margin-top:.4rem;font-family:monospace}
  article table{width:100%;border-collapse:collapse;margin:1em 0;font-size:.9rem}
  article th,article td{border:1px solid var(--line);padding:.45rem .7rem;text-align:left}
  article th{background:#111114;color:#f4f4f5;font-weight:600}
  article hr{border:none;border-top:1px solid var(--line);margin:2em 0}
  /* hide nav, ads, sidebars that Readability might miss */
  nav,aside,footer,[role="complementary"],[role="navigation"]{display:none!important}
</style>
</head>
<body>
${INJECT_HEAD(actualUrl)}
<header>
  ${article.siteName ? `<div class="site">${article.siteName}</div>` : ""}
  <h1>${article.title}</h1>
  ${article.byline ? `<div class="byline">${article.byline}</div>` : ""}
</header>
<article>${article.content}</article>
${INJECT_BODY(actualUrl)}
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  /* Rate limit */
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  const rawUrl = req.nextUrl.searchParams.get("url");
  const readerMode = req.nextUrl.searchParams.get("reader") === "1";
  if (!rawUrl) return htmlError("No URL provided");

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return htmlError("Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return htmlError("Only http/https URLs are allowed");
  }

  if (!ssrfSafe(parsed)) {
    return htmlError("That URL is not allowed");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    const ct = res.headers.get("content-type") || "";
    const finalUrl = res.url;

    /* ── CSS: rewrite via PostCSS ── */
    if (ct.includes("text/css")) {
      const rewritten = rewriteCss(await res.text(), finalUrl);
      return new NextResponse(rewritten, {
        headers: {
          "Content-Type": "text/css; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    /* ── Non-HTML/CSS: pass through ── */
    if (!ct.includes("text/html")) {
      return new NextResponse(await res.arrayBuffer(), {
        headers: {
          "Content-Type": ct,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    /* ── HTML: reader mode via @mozilla/readability ── */
    const rawHtml = await res.text();

    if (readerMode) {
      try {
        const { document } = parseHTML(rawHtml);
        const reader = new Readability(document as unknown as Document);
        const article = reader.parse();
        if (article?.title && article?.content) {
          return new NextResponse(readerHtml({
            title: article.title,
            byline: article.byline ?? null,
            content: article.content,
            siteName: article.siteName ?? null,
          }, finalUrl), {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      } catch {
        // fall through to normal proxy if readability fails
      }
    }

    /* ── HTML: rewrite via Cheerio ── */
    const $ = cheerio.load(rawHtml);

    /* Inject early head script: SPA routing fix + fetch/XHR patches + theme */
    $("head").prepend(INJECT_HEAD(finalUrl));

    /* Inject <base> after early script so relative URLs resolve correctly */
    if (!$("base").length) {
      $("head").prepend(`<base href="${finalUrl}">`);
    }

    /* Rewrite URL attributes — cheerio already decodes &amp; for us */
    (["href", "src", "action", "data-src"] as const).forEach((attr) => {
      $(`[${attr}]`).each((_, el) => {
        const val = $(el).attr(attr);
        if (val) $(el).attr(attr, rewriteUrl(val, finalUrl));
      });
    });

    /* Rewrite srcset */
    $("[srcset]").each((_, el) => {
      const val = $(el).attr("srcset");
      if (!val) return;
      $(el).attr(
        "srcset",
        val.split(",").map((p) => {
          const [u, ...rest] = p.trim().split(/\s+/);
          return [rewriteUrl(u, finalUrl), ...rest].join(" ");
        }).join(", ")
      );
    });

    /* Rewrite inline style attributes */
    $("[style]").each((_, el) => {
      const style = $(el).attr("style");
      if (!style) return;
      $(el).attr(
        "style",
        style.replace(
          /url\(\s*(['"]?)([^'")\s]*)\1\s*\)/gi,
          (_, q, u) => u.startsWith("data:") ? `url(${q}${u}${q})` : `url(${q}${rewriteUrl(u, finalUrl)}${q})`
        )
      );
    });

    /* Rewrite <style> blocks via PostCSS */
    $("style").each((_, el) => {
      const css = $(el).html();
      if (css) $(el).html(rewriteCss(css, finalUrl));
    });

    /* Inject scanner at end of body */
    $("body").append(INJECT_BODY(finalUrl));

    return new NextResponse($.html(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    clearTimeout(timeout);
    return htmlError(err instanceof Error ? err.message : String(err), parsed.toString());
  }
}

function htmlError(msg: string, url = "") {
  return new NextResponse(
    `<html><body style="font-family:monospace;background:#080808;color:#e2e2df;padding:2rem">
      <h2 style="color:#f87171;margin:0 0 .75rem">Scout — fetch error</h2>
      <pre style="color:#71717a;font-size:.8rem;white-space:pre-wrap">${msg}</pre>
      ${url ? `<p style="color:#3f3f46;font-size:.75rem;margin-top:.75rem">${url}</p>` : ""}
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
