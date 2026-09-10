import type { ApplicationStageKey } from "@/generated/prisma/client";
import { STAGE_DISPLAY_STEPS, stageDisplayIndex } from "@/lib/stages";

interface ProgressTrackerProps {
  currentStage: ApplicationStageKey;
}

export function ProgressTracker({ currentStage }: ProgressTrackerProps) {
  const currentIndex = stageDisplayIndex(currentStage);

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-4 left-0 right-0 h-px bg-surface-dark" style={{ marginLeft: "2.5%", marginRight: "2.5%" }} />

      <div className="relative flex items-start justify-between">
        {STAGE_DISPLAY_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / STAGE_DISPLAY_STEPS.length}%` }}>
              {/* Node */}
              <div className="relative z-10 mb-2">
                {isCompleted && (
                  <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {isActive && (
                  <div className="w-8 h-8 rounded-full border-2 border-gold bg-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-gold rotate-45" />
                  </div>
                )}
                {isPending && (
                  <div className="w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center">
                    <span className="text-xs text-text-muted font-medium">{index + 1}</span>
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className={[
                  "text-[10px] text-center leading-tight font-medium",
                  isCompleted || isActive ? "text-text" : "text-text-muted",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
