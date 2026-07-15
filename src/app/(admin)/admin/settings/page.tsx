import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { IntakeYearForm } from "./IntakeYearForm";
import { TaskTemplateManager } from "./TaskTemplateManager";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF" || !session.user.isGlobalAdmin) redirect("/admin");

  const [intakeYears, taskTemplates] = await Promise.all([
    prisma.intakeYear.findMany({ orderBy: { year: "desc" } }),
    prisma.taskTemplate.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="px-8 py-7 max-w-xl">
      <h1 className="font-serif text-2xl text-text mb-6">Settings</h1>

      <section className="mb-10">
        <h2 className="font-serif text-lg text-text mb-4">Intake Years</h2>
        <IntakeYearForm intakeYears={intakeYears} />
      </section>

      <section>
        <h2 className="font-serif text-lg text-text mb-1">Stage Task Templates</h2>
        <p className="text-sm text-text-muted mb-4">
          Configure the tasks automatically created when an application enters each stage.
        </p>
        <TaskTemplateManager templates={taskTemplates} />
      </section>
    </div>
  );
}
