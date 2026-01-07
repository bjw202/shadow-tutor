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

    if (newRepeatCount < state.shadowingSettings.repeatCount) {
      // More repeats needed
      state.incrementRepeat();
      callbacksRef.current.onRepeat?.();
    } else {
      // All repeats done
      state.resetRepeat();

      if (state.shadowingSettings.autoAdvance) {
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

      if (state.mode === "continuous") {
        // In continuous mode, advance immediately
        onAdvance();
        return;
      }

      // In shadowing mode, start pause
      callbacksRef.current.onAdvance = onAdvance;
      callbacksRef.current.onRepeat = onRepeat || null;
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

    if (newRepeatCount < state.shadowingSettings.repeatCount) {
      // More repeats needed
      state.incrementRepeat();
      callbacksRef.current.onRepeat?.();
    } else {
      // All repeats done
      state.resetRepeat();

      if (state.shadowingSettings.autoAdvance) {
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
