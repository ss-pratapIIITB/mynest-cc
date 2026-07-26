"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  CEO_SESSION_COOKIE,
  clearLoginAttempts,
  createSessionToken,
  isLoginRateLimited,
  recordFailedLogin,
  sessionMaxAgeSeconds,
  verifyCredentials,
} from "@/lib/ceo-auth";

export interface LoginState {
  error?: string;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Only ever redirect back into /ceo — never off-site, never to /ceo/login itself. */
function safeDestination(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "/ceo";
  if (value.startsWith("/ceo") && !value.startsWith("/ceo/login")) return value;
  return "/ceo";
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const destination = safeDestination(formData.get("from"));

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isLoginRateLimited(ip)) {
    await delay(400);
    return { error: "Too many attempts. Try again in about 15 minutes." };
  }

  // Fixed delay regardless of outcome, so response time can't be used to
  // fingerprint valid usernames or partial password matches.
  await delay(250);

  if (!username || !password || !verifyCredentials(username, password)) {
    recordFailedLogin(ip);
    return { error: "Invalid username or password." };
  }

  clearLoginAttempts(ip);

  const cookieStore = await cookies();
  cookieStore.set(CEO_SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAgeSeconds(),
  });

  redirect(destination);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(CEO_SESSION_COOKIE);
  redirect("/ceo/login");
}
