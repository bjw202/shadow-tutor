"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MIN_PAUSE_DURATION,
  MAX_PAUSE_DURATION,
  MIN_REPEAT_COUNT,
  MAX_REPEAT_COUNT,
} from "@/lib/constants/settings";

interface ShadowingSectionProps {
  pauseDuration: number;
  repeatCount: number;
  autoAdvance: boolean;
  onPauseDurationChange: (duration: number) => void;
  onRepeatCountChange: (count: number) => void;
  onAutoAdvanceChange: (autoAdvance: boolean) => void;
  className?: string;
}

/**
 * Shadowing Settings section component
 */
export function ShadowingSection({
  pauseDuration,
  repeatCount,
  autoAdvance,
  onPauseDurationChange,
  onRepeatCountChange,
  onAutoAdvanceChange,
  className,
}: ShadowingSectionProps) {
  const handlePauseDurationChange = (values: number[]) => {
    onPauseDurationChange(values[0]);
  };

  const handleRepeatIncrement = () => {
    if (repeatCount < MAX_REPEAT_COUNT) {
      onRepeatCountChange(repeatCount + 1);
    }
  };

  const handleRepeatDecrement = () => {
    if (repeatCount > MIN_REPEAT_COUNT) {
      onRepeatCountChange(repeatCount - 1);
    }
  };

  const handleAutoAdvanceChange = (checked: boolean) => {
    onAutoAdvanceChange(checked);
  };

  const repeatProgress =
    ((repeatCount - MIN_REPEAT_COUNT) / (MAX_REPEAT_COUNT - MIN_REPEAT_COUNT)) * 100;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">Shadowing Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pause Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="pause-duration" className="text-sm font-medium">
              Pause Duration
            </label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {pauseDuration}s
            </span>
          </div>
          <Slider
            id="pause-duration"
            value={[pauseDuration]}
            onValueChange={handlePauseDurationChange}
            min={MIN_PAUSE_DURATION}
            max={MAX_PAUSE_DURATION}
            step={1}
            className="w-full"
            aria-label="Pause duration"
          />
        </div>

        {/* Repeat Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Repeat Count</label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {repeatCount}x
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRepeatDecrement}
              disabled={repeatCount <= MIN_REPEAT_COUNT}
              aria-label="Decrease repeat count"
              className="h-9 w-9 shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${repeatProgress}%` }}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRepeatIncrement}
              disabled={repeatCount >= MAX_REPEAT_COUNT}
              aria-label="Increase repeat count"
              className="h-9 w-9 shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Auto-Advance Toggle */}
        <div className="flex items-center justify-between">
          <label htmlFor="auto-advance" className="text-sm font-medium">
            Auto-advance
          </label>
          <Switch
            id="auto-advance"
            checked={autoAdvance}
            onCheckedChange={handleAutoAdvanceChange}
            aria-label="Auto-advance to next segment"
          />
        </div>
      </CardContent>
    </Card>
  );
}
