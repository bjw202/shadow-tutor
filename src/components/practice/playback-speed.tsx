"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MIN_SPEED, MAX_SPEED } from "@/lib/constants/voices";

interface PlaybackSpeedProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

// SPEC-PLAYBACK-001-FIX: Updated presets with more intuitive values
// Changed 0.75 -> 0.8 (20% slower) and 1.25 -> 1.2 (20% faster)
const SPEED_PRESETS = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

export function PlaybackSpeed({ value, onChange, className }: PlaybackSpeedProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Speed: {value.toFixed(2)}x
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Slider
          value={[value]}
          onValueChange={handleSliderChange}
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={0.05}
          className="w-full"
          aria-label="Playback speed"
        />
        <div className="flex flex-wrap gap-1">
          {SPEED_PRESETS.map((preset) => (
            <Button
              key={preset}
              variant={value === preset ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(preset)}
              className="text-xs"
            >
              {preset}x
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
