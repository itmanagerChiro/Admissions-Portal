import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ApplyWizard } from "./ApplyWizard";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const openIntakeYears = await prisma.intakeYear.findMany({
    where: { isOpenForApplications: true, isArchived: false },
    orderBy: { year: "asc" },
    select: { id: true, year: true, label: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <div className="w-full bg-green h-8" />
      <div className="flex-1 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Image
              src="/nzcc-ws-logo-black.png"
              alt="New Zealand College of Chiropractic"
              width={280}
              height={94}
              className="mx-auto mb-6"
            />
            <h1 className="font-serif text-2xl font-bold text-text">Apply to the New Zealand College of Chiropractic</h1>
            <p className="text-sm text-text-muted mt-1">Bachelor of Chiropractic — Online Application</p>
          </div>

          <ApplyWizard openIntakeYears={openIntakeYears} />
        </div>
      </div>
      <footer className="text-center text-xs text-text-light py-4">
        Designed by Kinetics Group
      </footer>
    </div>
  );
}
