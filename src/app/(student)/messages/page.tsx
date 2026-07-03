import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentChatWidget } from "./StudentChatWidget";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: {
      id: true,
      messageThread: {
        include: { messages: { orderBy: { sentAt: "asc" } } },
      },
    },
  });

  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  if (application.messageThread) {
    await prisma.message.updateMany({
      where: { threadId: application.messageThread.id, senderRole: "STAFF", isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Admissions Office</p>
      <h1 className="font-serif text-3xl text-text mb-2">Messages</h1>
      <p className="text-sm text-text-muted mb-6">Communications from the NZCC admissions team regarding your application.</p>

      <StudentChatWidget applicationId={application.id} thread={application.messageThread ?? null} />
    </div>
  );
}
