"use client";

import { useProgressStore } from "@/stores/progress-store";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  className?: string;
  showText?: boolean;
}

/**
 * Progress bar component that displays learning progress
 * Shows completion percentage and segment count
 */
export function ProgressBar({ className, showText = true }: ProgressBarProps) {
  const currentSession = useProgressStore((state) => state.currentSession);
  const getCompletionRate = useProgressStore((state) => state.getCompletionRate);

  const completionRate = getCompletionRate();
  const percentage = Math.round(completionRate * 100);

  const totalSegments = currentSession?.totalSegments ?? 0;
  const completedSegments =
    currentSession?.segmentProgress.filter((p) => p.status === "completed").length ?? 0;

  return (
    <div className={cn("w-full", className)}>
      {showText && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-muted-foreground">
            Progress: <span className="font-medium text-foreground">{completedSegments}</span> /{" "}
            <span>{totalSegments}</span>
          </span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Learning progress: ${percentage}%`}
        className="relative h-2 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          data-testid="progress-fill"
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            percentage === 100
              ? "bg-green-500"
              : percentage >= 50
                ? "bg-primary"
                : "bg-primary/80"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
