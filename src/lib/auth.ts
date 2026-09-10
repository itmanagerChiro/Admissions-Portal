import NextAuth from "next-auth";
import { CredentialsSignin } from "@auth/core/errors";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole, PermissionKey } from "@/generated/prisma/client";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EMAIL_NOT_VERIFIED";
}

class AccountDeletionRequestedError extends CredentialsSignin {
  code = "ACCOUNT_DELETION_REQUESTED";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            staffPermissions: {
              where: { granted: true },
              select: { permissionKey: true },
            },
          },
        });

        if (!user || !user.isActive) return null;

        const validPassword = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!validPassword) return null;

        if (user.deletionRequestedAt) {
          throw new AccountDeletionRequestedError();
        }

        if (user.role === "STUDENT" && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isGlobalAdmin: user.isGlobalAdmin,
          permissions: user.staffPermissions.map((p) => p.permissionKey),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
        token.firstName = (user as { firstName: string }).firstName;
        token.lastName = (user as { lastName: string }).lastName;
        token.isGlobalAdmin = (user as { isGlobalAdmin: boolean }).isGlobalAdmin;
        token.permissions = (user as { permissions: PermissionKey[] }).permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole;
      session.user.firstName = token.firstName as string;
      session.user.lastName = token.lastName as string;
      session.user.isGlobalAdmin = token.isGlobalAdmin as boolean;
      session.user.permissions = token.permissions as PermissionKey[];
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
