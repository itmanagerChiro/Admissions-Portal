import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.isGlobalAdmin) return new NextResponse(null, { status: 403 });

  const { stageKey, title, description, audience, dueDays, requiresDocument, documentInstructions } = await req.json();

  if (!stageKey || !title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "Stage, title, and description are required." }, { status: 400 });
  }

  const maxSortOrder = await prisma.taskTemplate.aggregate({
    where: { stageKey },
    _max: { sortOrder: true },
  });

  const template = await prisma.taskTemplate.create({
    data: {
      stageKey,
      title,
      description,
      audience: audience === "STUDENT" ? "STUDENT" : "STAFF",
      dueDays: dueDays === "" || dueDays == null ? null : parseInt(dueDays, 10),
      requiresDocument: !!requiresDocument,
      documentInstructions: requiresDocument ? documentInstructions ?? null : null,
      sortOrder: (maxSortOrder._max.sortOrder ?? -1) + 1,
      createdById: session.user.id,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
