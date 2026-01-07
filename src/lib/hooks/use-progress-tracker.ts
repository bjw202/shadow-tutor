import { useEffect, useRef } from "react";
import { usePracticeStore } from "@/stores/practice-store";
import { useProgressStore } from "@/stores/progress-store";
import type { SegmentProgress } from "@/types/progress";

interface UseProgressTrackerReturn {
  /** Current segment's progress data */
  currentSegmentProgress: SegmentProgress | null;
  /** Overall completion rate (0.0 to 1.0) */
  completionRate: number;
  /** Whether progress is being tracked */
  isTracking: boolean;
}

/**
 * Hook to track learning progress based on practice store state
 * Subscribes to practice-store currentSegmentIndex and playback state
 * Automatically updates progress in progress-store
 */
export function useProgressTracker(): UseProgressTrackerReturn {
  const previousIndexRef = useRef<number | null>(null);
  const previousPlaybackStateRef = useRef<string | null>(null);
  const hasMarkedInProgressRef = useRef<Set<string>>(new Set());

  // Subscribe to practice store state
  const currentSegmentIndex = usePracticeStore((state) => state.currentSegmentIndex);
  const segments = usePracticeStore((state) => state.segments);
  const playbackState = usePracticeStore((state) => state.playbackState);

  // Subscribe to progress store state and actions
  const currentSession = useProgressStore((state) => state.currentSession);
  const updateSegmentStatus = useProgressStore((state) => state.updateSegmentStatus);
  const completeSegment = useProgressStore((state) => state.completeSegment);
  const setLastSegmentIndex = useProgressStore((state) => state.setLastSegmentIndex);
  const getCompletionRate = useProgressStore((state) => state.getCompletionRate);
  const getCurrentSegmentProgress = useProgressStore(
    (state) => state.getCurrentSegmentProgress
  );

  // Get current segment
  const currentSegment = segments[currentSegmentIndex] ?? null;
  const currentSegmentId = currentSegment?.id ?? null;

  // Track segment changes
  useEffect(() => {
    if (!currentSession || !currentSegmentId) return;

    // Update last segment index when it changes
    if (previousIndexRef.current !== currentSegmentIndex) {
      setLastSegmentIndex(currentSegmentIndex);
      previousIndexRef.current = currentSegmentIndex;
    }
  }, [currentSession, currentSegmentIndex, currentSegmentId, setLastSegmentIndex]);

  // Mark segment as in_progress when playback starts
  useEffect(() => {
    if (!currentSession || !currentSegmentId) return;

    if (playbackState === "playing") {
      // Only mark as in_progress if not already marked
      if (!hasMarkedInProgressRef.current.has(currentSegmentId)) {
        updateSegmentStatus(currentSegmentId, "in_progress");
        hasMarkedInProgressRef.current.add(currentSegmentId);
      }
    }
  }, [currentSession, currentSegmentId, playbackState, updateSegmentStatus]);

  // Mark segment as completed when playback stops (after playing)
  useEffect(() => {
    if (!currentSession || !currentSegmentId) return;

    const wasPlaying = previousPlaybackStateRef.current === "playing";
    const isStopped = playbackState === "stopped";

    if (wasPlaying && isStopped) {
      completeSegment(currentSegmentId);
      // Clear the in_progress mark so it can be marked again on repeat
      hasMarkedInProgressRef.current.delete(currentSegmentId);
    }

    previousPlaybackStateRef.current = playbackState;
  }, [currentSession, currentSegmentId, playbackState, completeSegment]);

  // Get current segment progress
  const currentSegmentProgress = currentSegmentId
    ? getCurrentSegmentProgress(currentSegmentId)
    : null;

  // Calculate completion rate
  const completionRate = getCompletionRate();

  // Determine if tracking is active
  const isTracking = currentSession !== null && segments.length > 0;

  return {
    currentSegmentProgress,
    completionRate,
    isTracking,
  };
}
