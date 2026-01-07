"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { ShadowingSettings as ShadowingSettingsType } from "@/types/practice";
import {
  MIN_PAUSE_DURATION,
  MAX_PAUSE_DURATION,
  MIN_REPEAT_COUNT,
  MAX_REPEAT_COUNT,
} from "@/lib/constants/shadowing";

interface ShadowingSettingsProps {
  /** Current shadowing settings */
  settings: ShadowingSettingsType;
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<ShadowingSettingsType>) => void;
  /** Whether the controls are disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Settings panel for shadowing mode configuration
 */
export function ShadowingSettings({
  settings,
  onSettingsChange,
  disabled = false,
  className,
}: ShadowingSettingsProps) {
  const handlePauseDurationChange = (value: number[]) => {
    onSettingsChange({ pauseDuration: value[0] });
  };

  const handleRepeatIncrement = () => {
    if (settings.repeatCount < MAX_REPEAT_COUNT) {
      onSettingsChange({ repeatCount: settings.repeatCount + 1 });
    }
  };

  const handleRepeatDecrement = () => {
    if (settings.repeatCount > MIN_REPEAT_COUNT) {
      onSettingsChange({ repeatCount: settings.repeatCount - 1 });
    }
  };

  const handleAutoAdvanceChange = (checked: boolean) => {
    onSettingsChange({ autoAdvance: checked });
  };

  return (
    <div
      data-testid="shadowing-settings"
      className={cn("space-y-4 p-4 rounded-lg bg-muted/30", className)}
    >
      {/* Pause Duration Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="pause-duration-slider"
            className="text-sm font-medium"
          >
            Pause Duration
          </label>
          <span className="text-sm text-muted-foreground tabular-nums">
            {settings.pauseDuration}s
          </span>
        </div>
        <Slider
          id="pause-duration-slider"
          aria-label="Pause duration"
          value={[settings.pauseDuration]}
          min={MIN_PAUSE_DURATION}
          max={MAX_PAUSE_DURATION}
          step={1}
          onValueChange={handlePauseDurationChange}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Repeat Count Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Repeat Count</label>
          <span className="text-sm text-muted-foreground tabular-nums">
            {settings.repeatCount}x
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRepeatDecrement}
            disabled={disabled || settings.repeatCount <= MIN_REPEAT_COUNT}
            aria-label="Decrease repeat count"
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((settings.repeatCount - MIN_REPEAT_COUNT) / (MAX_REPEAT_COUNT - MIN_REPEAT_COUNT)) * 100}%`,
              }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRepeatIncrement}
            disabled={disabled || settings.repeatCount >= MAX_REPEAT_COUNT}
            aria-label="Increase repeat count"
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Auto-Advance Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="auto-advance-toggle"
          className="text-sm font-medium"
        >
          Auto-advance
        </label>
        <Switch
          id="auto-advance-toggle"
          aria-label="Auto-advance to next segment"
          checked={settings.autoAdvance}
          onCheckedChange={handleAutoAdvanceChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
