import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { PermissionKey } from "@/generated/prisma/client";

export function hasPermission(
  session: Session | null,
  key: PermissionKey
): boolean {
  if (!session || session.user.role !== "STAFF") return false;
  if (session.user.isGlobalAdmin) return true;
  return session.user.permissions.includes(key);
}

export function requirePermission(
  session: Session | null,
  key: PermissionKey
): void {
  if (!hasPermission(session, key)) {
    redirect("/admin/403");
  }
}

export function requireStaff(session: Session | null): void {
  if (!session || session.user.role !== "STAFF") {
    redirect("/login");
  }
}

export function requireStudent(session: Session | null): void {
  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }
}

export function permissionGuard(
  session: Session | null,
  key: PermissionKey
): Response | null {
  if (!hasPermission(session, key)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
