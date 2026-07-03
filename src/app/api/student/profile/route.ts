import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const { firstName, lastName, phone, address, city, postcode, country, guardianName, guardianEmail, guardianPhone } = data;

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

  return Response.json({ success: true });
}
