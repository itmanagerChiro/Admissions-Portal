import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { firstName, lastName, phone, address, city, postcode, country, guardianName, guardianEmail, guardianPhone } = data;

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { firstName, lastName },
    }),
    prisma.application.update({
      where: { studentId: session.user.id },
      data: { phone, address, city, postcode, country, guardianName, guardianEmail, guardianPhone },
    }),
  ]);

  await logAudit({
    applicationId: application.id,
    objectType: "Application",
    objectId: application.id,
    action: "UPDATE",
    actionDetail: "Student updated their own profile",
    userId: session.user.id,
  });

  return Response.json({ success: true });
}
