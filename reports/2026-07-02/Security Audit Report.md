# Security Audit Report — 2026-07-02

## Executive Summary

A full security audit of the NZCC Portal (Next.js 16 / Prisma / NextAuth) was conducted covering secrets management, authentication, authorisation, input validation, file access, and abuse prevention. The application has a solid foundation — permission guards are consistently applied across all admin API routes, passwords are bcrypt-hashed at cost 12, path traversal on file serving is blocked, and there is no middleware-only auth. The primary risk areas are a complete absence of rate limiting on public endpoints (enabling brute-force and spam), missing input validation on mutation routes, and a file access endpoint that does not verify ownership. **Immediate priority: add rate limiting to `/api/student/register` and `/api/auth`.**

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High     | 3 |
| Medium   | 3 |
| Low      | 0 |

---

## Findings

### Critical

**`src/app/api/student/register/route.ts:5` — No rate limiting on registration or login endpoints**

Anyone can POST to `/api/student/register` or `/api/auth/[...nextauth]` in an unlimited loop. This enables:
- Brute-force password attacks on login
- Mass account creation / spam registrations
- Account enumeration (the 409 response on register confirms whether an email is registered)

```typescript
// Before — no throttle, unlimited requests from any IP
export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password } = await req.json();

// After — add IP-based rate limiting at the top of both routes
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  if (!success) return Response.json({ error: "Too many requests" }, { status: 429 });
  // ...
}
```

---

### High

**`src/app/api/files/[...key]/route.ts:8` — File access has no ownership check**

Any authenticated user (student or staff) can fetch any uploaded file if they know the storage key. A student can download another student's documents by guessing or enumerating keys, since the only check is `if (!session?.user)`.

```typescript
// Before — checks login only, no ownership
if (!session?.user) return new Response("Unauthorized", { status: 401 });

// After — verify ownership for students
if (session.user.role === "STUDENT") {
  const doc = await prisma.document.findFirst({
    where: {
      storageKey: filename,
      application: { studentId: session.user.id },
    },
  });
  if (!doc) return new Response("Forbidden", { status: 403 });
} else if (session.user.role !== "STAFF") {
  return new Response("Forbidden", { status: 403 });
}
```

---

**`src/app/api/student/profile/route.ts:10` and `src/app/api/admin/applicants/[id]/profile/route.ts:12` — No input validation on PATCH mutation routes**

Both profile update endpoints destructure fields from `req.json()` and pass them directly to Prisma without validating types or length. TypeScript types provide no protection at runtime.

```typescript
// Before — trusts client types at runtime
const { firstName, lastName, phone, ... } = await req.json();

// After — validate with Zod first
const schema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  // ... etc
});
const parsed = schema.safeParse(await req.json());
if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
```

---

**`src/app/api/student/register/route.ts:26` — Applicant number race condition**

```typescript
const count = await prisma.application.count();
const applicantNumber = `#${String(count + 1).padStart(4, "0")}`;
```

Two simultaneous registrations will read the same `count` and produce duplicate applicant numbers. Use a database sequence or auto-increment field instead.

---

### Medium

**`src/lib/auth.ts:43` — Staff permissions baked into JWT, never re-read from DB**

Permissions are loaded once at login and stored in the JWT. Revoking a permission has no effect until the session expires. For a system where permissions gate stage advancement and staff management, this window is significant.

---

**`src/app/api/student/documents/route.ts:19` — `documentType` accepted from client without enum validation**

```typescript
const documentType = (formData.get("documentType") as string) ?? "GENERAL";
```

A student can store arbitrary strings in this field. Validate against the allowed enum values before writing to the database.

---

**`.env:4` — Weak `AUTH_SECRET` placeholder**

The committed `.env` file contains `AUTH_SECRET="change-me-generate-with-openssl-rand-base64-32"`. If used in any deployed environment, NextAuth session tokens become trivially forgeable. Replace `.env` with `.env.example` containing only placeholder comments.

---

## Prioritised Remediation

| Priority | Issue | File | Effort |
|----------|-------|------|--------|
| 1 | Add rate limiting to register + login | `api/student/register`, `api/auth/[...nextauth]` | Medium |
| 2 | Add file ownership check | `api/files/[...key]/route.ts` | Low |
| 3 | Add Zod validation to profile PATCH routes | `api/student/profile`, `api/admin/.../profile` | Low |
| 4 | Fix applicant number race condition | `api/student/register/route.ts` | Medium |
| 5 | Replace .env placeholder with .env.example | `.env` | Low |
| 6 | Validate documentType against enum | `api/student/documents/route.ts` | Low |
| 7 | Address JWT permission staleness | `lib/auth.ts` | High |
