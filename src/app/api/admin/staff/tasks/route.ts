import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { permissionGuard } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = permissionGuard(session, "MANAGE_OWN_TASKS");
  if (guard) return guard;

  const { title, description, dueDate, assignedToId } = await req.json();

  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const task = await prisma.staffTask.create({
    data: {
      assignedToId: assignedToId ?? session!.user.id,
      createdById: session!.user.id,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
