"use client";

import * as React from "react";
import { usePracticeStore } from "@/stores/practice-store";
import type { PlaybackMode, ShadowingSettings } from "@/types/practice";

interface UsePlaybackModeReturn {
  /** Current playback mode */
  mode: PlaybackMode;
  /** Shadowing settings */
  shadowingSettings: ShadowingSettings;
  /** Whether currently in shadowing pause */
  isShadowingPaused: boolean;
  /** Remaining pause time in seconds */
  remainingTime: number;
  /** Current repeat count (0-based) */
  currentRepeat: number;
  /** Set the playback mode */
  setMode: (mode: PlaybackMode) => void;
  /** Update shadowing settings */
  updateSettings: (settings: Partial<ShadowingSettings>) => void;
  /** Handle end of segment playback */
  handleSegmentEnd: (onAdvance: () => void, onRepeat?: () => void) => void;
  /** Skip the current shadowing pause */
  skipPause: () => void;
  /** Reset pause state and repeat count */
  reset: () => void;
}

/**
 * Hook for managing playback mode and shadowing logic
 */
export function usePlaybackMode(): UsePlaybackModeReturn {
  const {
    mode,
    shadowingSettings,
    isShadowingPaused,
    remainingTime,
    currentRepeat,
    setMode,
    updateShadowingSettings,
    skipPause: storeSkipPause,
    resetRepeat,
  } = usePracticeStore();

  // Store callbacks for timer completion
  const callbacksRef = React.useRef<{
    onAdvance: (() => void) | null;
    onRepeat: (() => void) | null;
  }>({ onAdvance: null, onRepeat: null });

  // Handle pause completion - defined as a function that reads from store directly
  const handlePauseComplete = React.useCallback(() => {
    const state = usePracticeStore.getState();
    const newRepeatCount = state.currentRepeat + 1;

    // Reset pause state
    state.skipPause();

    // SPEC-REPEAT-001-FIX: Both modes respect repeatCount setting
    // newRepeatCount starts at 1 (since currentRepeat starts at 0)
    // For repeatCount=N: plays N times (repeats N-1 times after first play)
    if (newRepeatCount < state.shadowingSettings.repeatCount) {
      // More repeats needed
      state.incrementRepeat();
      callbacksRef.current.onRepeat?.();
    } else {
      // All repeats done
      state.resetRepeat();

      // Continuous mode: always advance after all repeats
      // Shadowing mode: only advance if autoAdvance is enabled
      if (state.mode === "continuous" || state.shadowingSettings.autoAdvance) {
        callbacksRef.current.onAdvance?.();
      }
    }
  }, []);

  // Ref to hold the latest handlePauseComplete
  const handlePauseCompleteRef = React.useRef(handlePauseComplete);
  React.useEffect(() => {
    handlePauseCompleteRef.current = handlePauseComplete;
  }, [handlePauseComplete]);

  // Handle timer countdown
  React.useEffect(() => {
    if (!isShadowingPaused) {
      return;
    }

    const timer = setInterval(() => {
      const state = usePracticeStore.getState();
      const newTime = state.remainingTime - 1;

      if (newTime <= 0) {
        clearInterval(timer);
        handlePauseCompleteRef.current();
      } else {
        state.setRemainingTime(newTime);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isShadowingPaused]);

  // Handle segment end - called when audio playback finishes
  const handleSegmentEnd = React.useCallback(
    (onAdvance: () => void, onRepeat?: () => void) => {
      const state = usePracticeStore.getState();

      // Store callbacks for pause/repeat logic
      callbacksRef.current.onAdvance = onAdvance;
      callbacksRef.current.onRepeat = onRepeat || null;

      // Both modes now use pause for repeat control
      // The difference is: continuous advances immediately after all repeats,
      // shadowing waits for user (via pause) before advancing
      state.startPause();
    },
    []
  );

  // Skip pause handler
  const skipPause = React.useCallback(() => {
    const state = usePracticeStore.getState();
    const newRepeatCount = state.currentRepeat + 1;

    // Reset pause state
    state.skipPause();

    // SPEC-REPEAT-001-FIX: Both modes respect repeatCount setting
    // newRepeatCount starts at 1 (since currentRepeat starts at 0)
    // For repeatCount=N: plays N times (repeats N-1 times after first play)
    if (newRepeatCount < state.shadowingSettings.repeatCount) {
      // More repeats needed
      state.incrementRepeat();
      callbacksRef.current.onRepeat?.();
    } else {
      // All repeats done
      state.resetRepeat();

      // Continuous mode: always advance after all repeats
      // Shadowing mode: only advance if autoAdvance is enabled
      if (state.mode === "continuous" || state.shadowingSettings.autoAdvance) {
        callbacksRef.current.onAdvance?.();
      }
    }
  }, []);

  // Reset handler
  const reset = React.useCallback(() => {
    storeSkipPause();
    resetRepeat();
    callbacksRef.current = { onAdvance: null, onRepeat: null };
  }, [storeSkipPause, resetRepeat]);

  return {
    mode,
    shadowingSettings,
    isShadowingPaused,
    remainingTime,
    currentRepeat,
    setMode,
    updateSettings: updateShadowingSettings,
    handleSegmentEnd,
    skipPause,
    reset,
  };
}
