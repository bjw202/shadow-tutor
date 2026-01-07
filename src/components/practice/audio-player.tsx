"use client";

import { useCallback, useEffect, useRef } from "react";
import { Play, Pause, Square, SkipBack, SkipForward, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";
import { usePlaybackMode } from "@/lib/hooks/use-playback-mode";
import { usePracticeStore } from "@/stores/practice-store";
import { ProgressBar } from "./progress-bar";
import { VolumeControl } from "./volume-control";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  className?: string;
  /** Callback to expose goToSegment function to parent */
  onReady?: (actions: { goToSegment: (index: number) => Promise<void> }) => void;
}

export function AudioPlayer({ className, onReady }: AudioPlayerProps) {
  const { handleSegmentEnd } = usePlaybackMode();
  const segments = usePracticeStore((state) => state.segments);

  // Refs to hold latest values for the callback
  const actionsRef = useRef<{
    nextSegment: () => Promise<void>;
    play: () => Promise<void>;
  } | null>(null);
  const currentIndexRef = useRef(0);

  // Internal segment end handler - uses refs to avoid stale closures
  const handleInternalSegmentEnd = useCallback(() => {
    const totalSegments = segments.length;
    const isLastSegment = currentIndexRef.current >= totalSegments - 1;

    // Don't auto-advance on last segment (AC-003)
    if (isLastSegment) {
      return;
    }

    // Use playback mode logic to determine next action
    handleSegmentEnd(
      () => actionsRef.current?.nextSegment(), // onAdvance - go to next segment
      () => actionsRef.current?.play() // onRepeat - replay current segment
    );
  }, [segments.length, handleSegmentEnd]);

  const {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    currentSegment,
    currentIndex,
    totalSegments,
    error,
    togglePlayPause,
    stop,
    nextSegment,
    previousSegment,
    goToSegment,
    seekTo,
    play,
  } = useAudioPlayer({ onSegmentEnd: handleInternalSegmentEnd });

  // Keep refs updated with latest functions
  useEffect(() => {
    actionsRef.current = { nextSegment, play };
  }, [nextSegment, play]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Expose goToSegment to parent component
  useEffect(() => {
    onReady?.({ goToSegment });
  }, [goToSegment, onReady]);

  const { volume, isMuted, setVolume, toggleMute } = usePracticeStore();

  const isFirstSegment = currentIndex === 0;
  const isLastSegment = currentIndex === totalSegments - 1;
  const hasSegments = totalSegments > 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        {/* Current segment text */}
        <div className="mb-4 min-h-[60px] text-center">
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : currentSegment ? (
            <p className="text-lg">{currentSegment.text}</p>
          ) : (
            <p className="text-muted-foreground">No segment selected</p>
          )}
        </div>

        {/* Progress bar */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          isLoading={isLoading}
          onSeek={seekTo}
          className="mb-4"
        />

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-2">
          {/* Previous */}
          <Button
            variant="outline"
            size="icon"
            onClick={previousSegment}
            disabled={isFirstSegment || !hasSegments || isLoading}
            aria-label="Previous segment"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayPause}
            disabled={!hasSegments || isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="h-12 w-12"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          {/* Stop */}
          <Button
            variant="outline"
            size="icon"
            onClick={stop}
            disabled={!hasSegments}
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            size="icon"
            onClick={nextSegment}
            disabled={isLastSegment || !hasSegments || isLoading}
            aria-label="Next segment"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Volume control (hidden on mobile) */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onMuteToggle={toggleMute}
            className="ml-4"
          />
        </div>

        {/* Progress indicator */}
        {hasSegments && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Segment {currentIndex + 1} of {totalSegments}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
