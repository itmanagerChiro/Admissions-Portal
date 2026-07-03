import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER } from "@/lib/stages";

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { studentId: session.user.id },
    select: { id: true, currentStage: true },
  });

  if (!application) return <div className="p-8 text-text-muted">Application not found.</div>;

  const events = await prisma.timelineEvent.findMany({
    where: { applicationId: application.id, isVisibleToStudent: true },
    orderBy: { occurredAt: "desc" },
  });

  const currentStageIndex = STAGE_ORDER.indexOf(application.currentStage);

  return (
    <div className="px-8 py-8 max-w-2xl">
      <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-1">Your Journey</p>
      <h1 className="font-serif text-3xl text-text mb-2">Application Timeline</h1>
      <p className="text-sm text-text-muted mb-8">A record of where you&apos;ve been and what&apos;s coming next.</p>

      <div className="flex flex-col gap-4">
        {events.map((event, i) => {
          const isFirst = i === 0;
          const stageKey = event.relatedStageKey;
          const stageIndex = stageKey ? STAGE_ORDER.indexOf(stageKey) : -1;
          const isCompleted = stageIndex < currentStageIndex || (!stageKey && true);
          const isActive = stageIndex === currentStageIndex;

          const node = isFirst && isActive ? (
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0" style={{ border: "2px solid #C79A3B" }}>
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: "#C79A3B" }} />
            </div>
          ) : isCompleted || !stageKey ? (
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#114E3B" }}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-white flex-shrink-0" style={{ border: "2px solid rgba(0,0,0,0.12)" }} />
          );

          return (
            <div key={event.id} className="flex gap-4 items-start">
              <div className="flex flex-col items-center flex-shrink-0" style={{ width: 28 }}>
                {node}
                {i < events.length - 1 && (
                  <div className="mt-1 flex-1" style={{ width: 2, minHeight: 24, backgroundColor: "rgba(0,0,0,0.08)" }} />
                )}
              </div>
              <div className="flex-1 bg-white rounded-xl shadow-sm px-5 py-4" style={{ marginTop: 2 }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#bbb" }}>
                  {new Date(event.occurredAt).toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" })}
                  {isFirst && isActive && <> · <span style={{ color: "#C79A3B" }}>Upcoming</span></>}
                </p>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "#222" }}>{event.title}</h3>
                {event.description && (
                  <p className="text-xs leading-relaxed" style={{ color: "#888" }}>{event.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
