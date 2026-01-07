"use client";

import { cn } from "@/lib/utils";

interface SegmentHighlightProps {
  text: string;
  segmentId: string;
  className?: string;
}

export function SegmentHighlight({
  text,
  segmentId,
  className,
}: SegmentHighlightProps) {
  const hasText = text.trim().length > 0;

  return (
    <div
      key={segmentId}
      className={cn(
        "segment-highlight animate-fade-in text-lg text-center",
        className
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {hasText ? (
        <p className="font-medium">{text}</p>
      ) : (
        <p className="text-muted-foreground italic">No segment selected</p>
      )}
    </div>
  );
}
