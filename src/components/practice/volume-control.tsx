"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className,
}: VolumeControlProps) {
  // Convert volume (0-1) to percentage (0-100) for slider
  const volumePercent = Math.round(volume * 100);

  // Determine which icon to show
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" data-testid="volume-muted" />;
    }
    if (volume <= 0.5) {
      return <Volume1 className="h-4 w-4" data-testid="volume-low" />;
    }
    return <Volume2 className="h-4 w-4" data-testid="volume-high" />;
  };

  const handleVolumeChange = (values: number[]) => {
    // Convert percentage back to 0-1 range
    const newVolume = values[0] / 100;
    onVolumeChange(newVolume);
  };

  return (
    <div className={cn("hidden items-center gap-2 md:flex", className)}>
      {/* Mute toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        aria-label={isMuted ? "Unmute volume" : "Mute volume"}
        className="h-8 w-8"
      >
        {getVolumeIcon()}
      </Button>

      {/* Volume slider */}
      <Slider
        value={[volumePercent]}
        min={0}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
        aria-label="Volume"
        className="w-24"
      />
    </div>
  );
}
