import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CEO_SESSION_COOKIE,
  createSessionToken,
  sessionMaxAgeSeconds,
  shouldRefreshSession,
  verifySessionToken,
} from "@/lib/ceo-auth";

const LOGIN_PATH = "/ceo/login";

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "private, no-store");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return res;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(CEO_SESSION_COOKIE)?.value);

  if (pathname === LOGIN_PATH) {
    if (session) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/ceo", request.url)));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // Internal-only redirect target — never echo a full URL back.
    loginUrl.searchParams.set("from", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  const res = withSecurityHeaders(NextResponse.next());

  if (shouldRefreshSession(session)) {
    res.cookies.set(CEO_SESSION_COOKIE, createSessionToken(session.u), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAgeSeconds(),
    });
  }

  return res;
}

export const config = {
  matcher: ["/ceo", "/ceo/:path*"],
};
