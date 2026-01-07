"use client";

import * as React from "react";
import { Play, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PlaybackMode } from "@/types/practice";

interface ModeSelectorProps {
  /** Current playback mode */
  mode: PlaybackMode;
  /** Callback when mode changes */
  onModeChange: (mode: PlaybackMode) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Mode selector component for switching between continuous and shadowing modes
 */
export function ModeSelector({
  mode,
  onModeChange,
  disabled = false,
  className,
}: ModeSelectorProps) {
  const handleModeChange = (newMode: PlaybackMode) => {
    if (newMode !== mode && !disabled) {
      onModeChange(newMode);
    }
  };

  return (
    <div
      role="group"
      aria-label="Playback mode"
      className={cn("flex gap-1 rounded-lg bg-muted p-1", className)}
    >
      <Button
        variant={mode === "continuous" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleModeChange("continuous")}
        disabled={disabled}
        aria-pressed={mode === "continuous"}
        className={cn(
          "flex-1 gap-2",
          mode === "continuous" && "shadow-sm"
        )}
      >
        <Play className="h-4 w-4" />
        Continuous
      </Button>
      <Button
        variant={mode === "shadowing" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleModeChange("shadowing")}
        disabled={disabled}
        aria-pressed={mode === "shadowing"}
        className={cn(
          "flex-1 gap-2",
          mode === "shadowing" && "shadow-sm"
        )}
      >
        <Mic className="h-4 w-4" />
        Shadowing
      </Button>
    </div>
  );
}
