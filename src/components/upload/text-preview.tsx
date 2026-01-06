"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TextSegment } from "@/types";

interface TextPreviewProps {
  /** Array of text segments to display */
  segments: TextSegment[];
  /** ID of the currently highlighted segment */
  currentSegmentId?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Text preview component that displays parsed text segments
 * in a scrollable list with segment numbers
 */
export function TextPreview({
  segments,
  currentSegmentId,
  className,
}: TextPreviewProps) {
  if (segments.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No segments to display.
            <br />
            Upload a file to see the parsed content.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Preview ({segments.length} segments)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          data-testid="segments-container"
          className="h-full overflow-y-auto px-6 pb-6"
        >
          <ul role="list" className="space-y-2">
            {segments.map((segment, index) => (
              <li
                key={segment.id}
                role="listitem"
                className={cn(
                  "flex gap-3 p-3 rounded-lg border transition-colors",
                  currentSegmentId === segment.id
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </span>
                <p className="flex-1 text-sm leading-relaxed">{segment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
