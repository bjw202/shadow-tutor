"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TextSegment } from "@/types";

interface SegmentListProps {
  segments: TextSegment[];
  currentIndex: number;
  onSelect: (index: number) => void;
  isAutoScrollEnabled?: boolean;
  className?: string;
}

export function SegmentList({
  segments,
  currentIndex,
  onSelect,
  isAutoScrollEnabled = true,
  className,
}: SegmentListProps) {
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Auto-scroll to current segment when it changes
  useEffect(() => {
    if (!isAutoScrollEnabled) return;

    const currentItem = itemRefs.current.get(currentIndex);
    if (currentItem) {
      currentItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentIndex, isAutoScrollEnabled]);
  if (segments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">
            No segments available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Segments</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ul className="max-h-[300px] space-y-1 overflow-y-auto">
          {segments.map((segment, index) => (
            <li key={segment.id}>
              <button
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(index, el);
                  } else {
                    itemRefs.current.delete(index);
                  }
                }}
                onClick={() => onSelect(index)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  index === currentIndex &&
                    "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                aria-current={index === currentIndex ? "true" : undefined}
              >
                <span className="mr-2 text-xs opacity-60">{index + 1}.</span>
                <span className="line-clamp-2">{segment.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
