import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/apply", "/forgot-password", "/verify-email"];
const STUDENT_PATHS = ["/dashboard", "/tasks", "/documents", "/timeline", "/messages", "/profile"];

const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

async function getRole(req: NextRequest): Promise<{ role: string | null; hasInvalidCookie: boolean }> {
  const secureCookie = req.cookies.get(SECURE_SESSION_COOKIE)?.value;
  const plainCookie = req.cookies.get(SESSION_COOKIE)?.value;
  const token = secureCookie ?? plainCookie;
  const salt = secureCookie ? SECURE_SESSION_COOKIE : SESSION_COOKIE;
  if (!token) return { role: null, hasInvalidCookie: false };

  try {
    const payload = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt,
    });
    if (!payload) return { role: null, hasInvalidCookie: true };
    return { role: (payload.role as string) ?? null, hasInvalidCookie: false };
  } catch {
    return { role: null, hasInvalidCookie: true };
  }
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(SECURE_SESSION_COOKIE);
  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { role, hasInvalidCookie } = await getRole(req);
  const isAuthenticated = role !== null;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) {
      const dest = role === "STAFF" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    const response = NextResponse.next();
    return hasInvalidCookie ? clearSessionCookies(response) : response;
  }

  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    return hasInvalidCookie ? clearSessionCookies(response) : response;
  }

  if (pathname.startsWith("/admin") && role !== "STAFF") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (STUDENT_PATHS.some((p) => pathname.startsWith(p)) && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
