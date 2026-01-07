"use client";

import * as React from "react";
import { SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShadowingTimerProps {
  /** Whether the timer is visible */
  isVisible: boolean;
  /** Remaining time in seconds */
  remainingTime: number;
  /** Total time for the pause (used for progress calculation) */
  totalTime: number;
  /** Callback when skip button is clicked */
  onSkip: () => void;
  /** Callback when timer completes (reaches 0) */
  onComplete: () => void;
  /** Callback when time updates (for external state sync) */
  onTimeUpdate?: (time: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Circular countdown timer for shadowing practice pause
 */
export function ShadowingTimer({
  isVisible,
  remainingTime,
  totalTime,
  onSkip,
  onComplete,
  onTimeUpdate,
  className,
}: ShadowingTimerProps) {
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Calculate progress percentage (0 to 100)
  const progress = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;

  // Calculate SVG circle properties
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  // Handle countdown
  React.useEffect(() => {
    if (!isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const newTime = remainingTime - 1;
      if (newTime <= 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete();
      } else {
        onTimeUpdate?.(newTime);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, remainingTime, onComplete, onTimeUpdate]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="shadowing-timer"
      aria-label={`Shadowing pause timer: ${remainingTime} seconds remaining`}
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-6 rounded-lg bg-muted/50",
        className
      )}
    >
      {/* Instruction text */}
      <p className="text-sm text-muted-foreground text-center">
        Repeat the sentence
      </p>

      {/* Circular progress timer */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg
          className="absolute inset-0 -rotate-90"
          width="112"
          height="112"
          viewBox="0 0 112 112"
        >
          {/* Background circle */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            data-testid="progress-circle"
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display */}
        <span className="text-3xl font-bold tabular-nums">
          {remainingTime}
        </span>
      </div>

      {/* Skip button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onSkip}
        className="gap-2"
      >
        <SkipForward className="h-4 w-4" />
        Skip
      </Button>
    </div>
  );
}
