"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { VOICES, type VoiceInfo } from "@/lib/constants/voices";
import { MIN_SPEED, MAX_SPEED } from "@/lib/constants/settings";
import type { VoiceOption } from "@/types/audio";

interface TTSSettingsProps {
  voice: VoiceOption;
  speed: number;
  volume: number;
  isMuted: boolean;
  onVoiceChange: (voice: VoiceOption) => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

/**
 * TTS Settings section component
 */
export function TTSSettings({
  voice,
  speed,
  volume,
  isMuted,
  onVoiceChange,
  onSpeedChange,
  onVolumeChange,
  onMuteToggle,
  className,
}: TTSSettingsProps) {
  const handleSpeedSliderChange = (values: number[]) => {
    onSpeedChange(values[0]);
  };

  const handleVolumeSliderChange = (values: number[]) => {
    onVolumeChange(values[0] / 100);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="h-4 w-4" data-testid="volume-muted" />;
    }
    if (volume <= 0.5) {
      return <Volume1 className="h-4 w-4" data-testid="volume-low" />;
    }
    return <Volume2 className="h-4 w-4" data-testid="volume-high" />;
  };

  const volumePercent = Math.round(volume * 100);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium">TTS Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice</label>
          <Select value={voice} onValueChange={(v) => onVoiceChange(v as VoiceOption)}>
            <SelectTrigger className="w-full" aria-label="Select voice">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v: VoiceInfo) => (
                <SelectItem key={v.id} value={v.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{v.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Speed</label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {speed.toFixed(2)}x
            </span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={handleSpeedSliderChange}
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
                variant={speed === preset ? "default" : "outline"}
                size="sm"
                onClick={() => onSpeedChange(preset)}
                className="text-xs"
              >
                {preset}x
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Volume</label>
            <span className="text-sm text-muted-foreground tabular-nums">
              {volumePercent}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMuteToggle}
              aria-label={isMuted ? "Unmute volume" : "Mute volume"}
              className="h-8 w-8 shrink-0"
            >
              {getVolumeIcon()}
            </Button>
            <Slider
              value={[volumePercent]}
              onValueChange={handleVolumeSliderChange}
              min={0}
              max={100}
              step={1}
              className="flex-1"
              aria-label="Volume"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
