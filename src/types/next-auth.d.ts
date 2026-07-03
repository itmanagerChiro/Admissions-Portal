import type { UserRole, PermissionKey } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isGlobalAdmin: boolean;
      permissions: PermissionKey[];
    };
  }

  interface User {
    id?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isGlobalAdmin: boolean;
    permissions: PermissionKey[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    isGlobalAdmin: boolean;
    permissions: PermissionKey[];
  }
}
