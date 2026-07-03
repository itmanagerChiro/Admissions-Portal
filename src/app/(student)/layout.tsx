import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentSidebar } from "@/components/student/StudentSidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch unread counts for sidebar badges
  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: {
      id: true,
      _count: {
        select: {
          tasks: { where: { status: { in: ["PENDING", "IN_PROGRESS", "REJECTED"] } } },
        },
      },
      messageThread: {
        select: {
          messages: {
            where: { isRead: false, senderRole: "STAFF" },
            select: { id: true },
          },
        },
      },
    },
  });

  const pendingTaskCount = application?._count.tasks ?? 0;
  const unreadMessageCount = application?.messageThread?.messages.length ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar
        firstName={session.user.firstName}
        lastName={session.user.lastName}
        pendingTaskCount={pendingTaskCount}
        unreadMessageCount={unreadMessageCount}
      />
      <main className="flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}
