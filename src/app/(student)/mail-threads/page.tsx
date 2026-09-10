import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MailThreadsPanel } from "@/components/shared/MailThreadsPanel";

export default async function StudentMailThreadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true },
  });
  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Admissions Office</p>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-3xl text-text">Threads</h1>
        <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: "rgba(199,154,59,0.15)", color: "#8a6416" }}>
          Trial feature
        </span>
      </div>
      <p className="text-sm text-text-muted mb-6">
        Start a new conversation with a subject line, similar to email. This is a trial alongside the existing
        Messages page — the two are kept separate.
      </p>

      <MailThreadsPanel
        baseUrl="/api/student/mail-threads"
        viewerRole="STUDENT"
        composerLabel="Write a reply…"
      />
    </div>
  );
}
