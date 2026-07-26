import "server-only";
import { createHmac, timingSafeEqual, scryptSync } from "node:crypto";

export const CEO_SESSION_COOKIE = "ceo_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, sliding

interface SessionPayload {
  u: string;
  iat: number;
  exp: number;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/** Constant-time string compare, safe for unequal lengths (hash first so
 *  buffer length never depends on the compared strings). */
function safeEqual(a: string, b: string): boolean {
  const bufA = createHmac("sha256", "cmp").update(a).digest();
  const bufB = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(username: string): string {
  const secret = requireEnv("CEO_SESSION_SECRET");
  const now = Date.now();
  const payload: SessionPayload = { u: username, iat: now, exp: now + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const secret = process.env.CEO_SESSION_SECRET;
  if (!secret) return null;

  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expectedSig = sign(body, secret);
  if (!safeEqual(sig, expectedSig)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return null;
  if (typeof payload.u !== "string") return null;

  return payload;
}

/** Should the cookie be reissued to slide the expiry forward? */
export function shouldRefreshSession(payload: SessionPayload): boolean {
  const age = Date.now() - payload.iat;
  return age > SESSION_TTL_MS / 4; // refresh once a session is 25%+ through its TTL
}

export function sessionMaxAgeSeconds(): number {
  return SESSION_TTL_MS / 1000;
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.CEO_USERNAME;
  const hashField = process.env.CEO_PASSWORD_HASH;
  if (!expectedUser || !hashField) return false;

  const userOk = safeEqual(username, expectedUser);

  const [saltHex, hashHex] = hashField.split(":");
  let passOk = false;
  if (saltHex && hashHex) {
    try {
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(hashHex, "hex");
      const actual = scryptSync(password, salt, expected.length);
      passOk = timingSafeEqual(actual, expected);
    } catch {
      passOk = false;
    }
  }

  // Both checks always run (no short-circuit) so a wrong username doesn't
  // return faster than a wrong password.
  return userOk && passOk;
}

/* ── Login attempt rate limiting (in-memory, per-process) ──
   Not distributed, but this is a single-instance personal site — good enough
   to blunt brute force without a database. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isLoginRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}
