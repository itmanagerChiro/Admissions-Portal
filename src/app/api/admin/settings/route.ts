import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF" || !session.user.isGlobalAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { emailNotificationsEnabled } = await req.json();
  if (typeof emailNotificationsEnabled !== "boolean") {
    return NextResponse.json({ error: "emailNotificationsEnabled must be a boolean" }, { status: 400 });
  }

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", emailNotificationsEnabled },
    update: { emailNotificationsEnabled },
  });

  return NextResponse.json({ success: true });
}
