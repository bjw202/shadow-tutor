"use client";

import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils/format-time";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isLoading: boolean;
  onSeek: (time: number) => void;
  className?: string;
}

export function ProgressBar({
  currentTime,
  duration,
  isLoading,
  onSeek,
  className,
}: ProgressBarProps) {
  // Handle edge cases for time values
  const safeCurrentTime = Number.isFinite(currentTime) ? currentTime : 0;
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  // Clamp current time to valid range
  const clampedCurrentTime = Math.min(Math.max(0, safeCurrentTime), safeDuration);

  const handleValueChange = (values: number[]) => {
    const newTime = values[0];
    if (Number.isFinite(newTime)) {
      onSeek(newTime);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Current time display */}
      <span className="min-w-[40px] text-xs text-muted-foreground tabular-nums">
        {formatTime(clampedCurrentTime)}
      </span>

      {/* Progress slider */}
      <div className="relative flex-1">
        <Slider
          value={[clampedCurrentTime]}
          min={0}
          max={safeDuration || 1}
          step={1}
          onValueChange={handleValueChange}
          disabled={isLoading}
          aria-label="Audio progress"
          aria-valuetext={`${formatTime(clampedCurrentTime)} of ${formatTime(safeDuration)}`}
          className="w-full"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div
            data-testid="progress-loading"
            className="absolute inset-0 flex items-center justify-center bg-background/50"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Duration display */}
      <span className="min-w-[40px] text-xs text-muted-foreground tabular-nums">
        {formatTime(safeDuration)}
      </span>
    </div>
  );
}
