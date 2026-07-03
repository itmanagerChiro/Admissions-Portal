import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const STUDENT_PATHS = ["/dashboard", "/tasks", "/documents", "/timeline", "/messages", "/profile"];

const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

async function getRole(req: NextRequest): Promise<string | null> {
  const secureCookie = req.cookies.get(SECURE_SESSION_COOKIE)?.value;
  const plainCookie = req.cookies.get(SESSION_COOKIE)?.value;
  const token = secureCookie ?? plainCookie;
  const salt = secureCookie ? SECURE_SESSION_COOKIE : SESSION_COOKIE;
  if (!token) return null;

  try {
    const payload = await decode({
      token,
      secret: process.env.AUTH_SECRET!,
      salt,
    });
    return (payload?.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await getRole(req);
  const isAuthenticated = role !== null;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) {
      const dest = role === "STAFF" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
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
