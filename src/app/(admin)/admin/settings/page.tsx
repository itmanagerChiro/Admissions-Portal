import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IntakeYearForm } from "./IntakeYearForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF" || !session.user.isGlobalAdmin) redirect("/admin");

  const intakeYears = await prisma.intakeYear.findMany({ orderBy: { year: "desc" } });

  return (
    <div className="px-8 py-7 max-w-xl">
      <h1 className="font-serif text-2xl text-text mb-6">Settings</h1>

      <section>
        <h2 className="font-serif text-lg text-text mb-4">Intake Years</h2>
        <IntakeYearForm intakeYears={intakeYears} />
      </section>
    </div>
  );
}
