"use client";

import * as React from "react";
import { RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParseMode } from "@/types";

interface SegmentEditorProps {
  /** Current parse mode */
  parseMode: ParseMode;
  /** Number of segments */
  segmentCount: number;
  /** Callback when parse mode changes */
  onParseModeChange: (mode: ParseMode) => void;
  /** Callback when reparse is requested */
  onReparse: () => void;
  /** Callback when segments are confirmed */
  onConfirm: () => void;
  /** Whether controls are disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const PARSE_MODE_OPTIONS: { value: ParseMode; label: string }[] = [
  { value: "sentence", label: "Sentence" },
  { value: "phrase", label: "Phrase" },
  { value: "paragraph", label: "Paragraph" },
];

/**
 * Segment editor component for configuring text parsing options
 */
export function SegmentEditor({
  parseMode,
  segmentCount,
  onParseModeChange,
  onReparse,
  onConfirm,
  disabled = false,
  className,
}: SegmentEditorProps) {
  const segmentText = segmentCount === 1 ? "1 segment" : `${segmentCount} segments`;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Parse Mode Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="parse-mode" className="text-sm font-medium whitespace-nowrap">
              Parse by:
            </label>
            <Select
              value={parseMode}
              onValueChange={(value) => onParseModeChange(value as ParseMode)}
              disabled={disabled}
            >
              <SelectTrigger id="parse-mode" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PARSE_MODE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Segment Count */}
          <div className="text-sm text-muted-foreground">
            {segmentText}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReparse}
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-parse
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={disabled || segmentCount === 0}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
