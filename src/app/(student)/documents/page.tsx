import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { DocumentUploadForm } from "./DocumentUploadForm";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    include: {
      documents: { orderBy: { uploadedAt: "desc" } },
      tasks: {
        where: { requiresDocument: true, status: { in: ["PENDING", "IN_PROGRESS", "REJECTED"] } },
        select: { id: true, title: true, requiredDocumentCategory: true },
      },
    },
  });

  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Secure Storage</p>
      <h1 className="font-serif text-3xl text-text mb-2">My Documents</h1>
      <p className="text-sm text-text-muted mb-8">All documents submitted as part of your application are stored securely here.</p>

      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#999" }}>Upload Required Document</p>
        <DocumentUploadForm applicationId={application.id} pendingTasks={application.tasks} />
      </div>

      {application.documents.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>Submitted Documents</p>
            <p className="text-xs" style={{ color: "#aaa" }}>{application.documents.length} on file</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {application.documents.map((doc, i) => {
              const isVerified = doc.status === "VERIFIED";
              const isRejected = doc.status === "REJECTED";
              const accentColor = isVerified ? "#22c55e" : isRejected ? "#c0392b" : "#C79A3B";

              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{
                    borderLeft: `3px solid ${accentColor}`,
                    borderBottom: i < application.documents.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "#222" }}>{doc.filename}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>
                      {isVerified
                        ? `Verified · ${doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString("en-NZ") : ""}`
                        : isRejected
                        ? "Rejected · Please re-upload"
                        : `Uploaded ${new Date(doc.uploadedAt).toLocaleDateString("en-NZ")} · Pending review`}
                    </p>
                    {doc.verificationNote && <p className="text-xs mt-0.5 italic" style={{ color: "#aaa" }}>{doc.verificationNote}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {isVerified && <Badge variant="green">Verified</Badge>}
                    {isRejected && <Badge variant="red">Rejected</Badge>}
                    <a href={`/api/files/${doc.storageKey}`} className="text-xs font-semibold transition-colors" style={{ color: "#114E3B" }}>
                      View
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
