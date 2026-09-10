import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hasPermission } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { STAGE_LABELS } from "@/lib/stages";
import { resolveIntakeFilter } from "@/lib/intakeYears";
import { IntakeFilterPicker } from "@/components/admin/IntakeFilterPicker";
import { ComplianceRow } from "./ComplianceRow";

export default async function InternationalPage({
  searchParams,
}: {
  searchParams: Promise<{ intake?: string }>;
}) {
  const { intake } = await searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") redirect("/login");
  requirePermission(session, "VIEW_INTERNATIONAL");

  const canEdit = hasPermission(session, "EDIT_INTERNATIONAL");
  const intakeFilter = await resolveIntakeFilter(intake);

  const applications = await prisma.application.findMany({
    where: {
      category: "INTERNATIONAL",
      ...intakeFilter.where,
    },
    select: {
      id: true,
      applicantNumber: true,
      currentStage: true,
      student: { select: { firstName: true, lastName: true } },
      internationalCompliance: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const HEADERS = ["Name", "Stage", "Offer of Place", "Visa", "Insurance", "IELTS"];

  return (
    <div className="px-8 py-7">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">Compliance Tracking · {intakeFilter.label}</p>
          <h1 className="font-serif text-2xl text-text">International Applicants</h1>
          <p className="text-sm text-text-muted mt-1">
            {applications.length} international students · Track visa, insurance and IELTS status.
          </p>
        </div>
        <IntakeFilterPicker intakeYears={intakeFilter.visibleIntakes.map((iy) => ({ id: iy.id, label: iy.label }))} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F8F8F6" }}>
              {HEADERS.map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#999" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm" style={{ color: "#aaa" }}>
                  No international applicants in this intake.
                </td>
              </tr>
            ) : (
              applications.map((app, i) => (
                <ComplianceRow
                  key={app.id}
                  application={app}
                  canEdit={canEdit}
                  isLast={i === applications.length - 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
