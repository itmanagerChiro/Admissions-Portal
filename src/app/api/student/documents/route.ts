import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return Response.json({ error: "Not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const documentType = (formData.get("documentType") as string) ?? "GENERAL";
  const taskId = formData.get("taskId") as string | null;

  if (!file) return Response.json({ error: "No file provided." }, { status: 400 });

  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File exceeds 10MB limit." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storage = getStorageProvider();
  const { key, storedFilename } = await storage.upload(buffer, file.name, file.type);

  // If task linked, update task to IN_PROGRESS
  if (taskId) {
    await prisma.task.updateMany({
      where: { id: taskId, applicationId: application.id, status: "PENDING" },
      data: { status: "IN_PROGRESS" },
    });
  }

  const document = await prisma.document.create({
    data: {
      applicationId: application.id,
      taskId: taskId || undefined,
      filename: file.name,
      storedFilename,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey: key,
      documentType,
    },
  });

  return Response.json({ id: document.id }, { status: 201 });
}
