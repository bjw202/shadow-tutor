"use client";

import { useCallback, useEffect } from "react";

/**
 * Configuration for keyboard shortcut handlers
 */
export interface KeyboardShortcutsHandlers {
  /** Called when user seeks forward (ArrowRight) */
  onSeekForward: (seconds: number) => void;
  /** Called when user seeks backward (ArrowLeft) */
  onSeekBackward: (seconds: number) => void;
  /** Called when user toggles play/pause (Space or K) */
  onTogglePlayPause: () => void;
  /** Called when user increases volume (ArrowUp) */
  onVolumeUp: () => void;
  /** Called when user decreases volume (ArrowDown) */
  onVolumeDown: () => void;
  /** Called when user toggles mute (M) */
  onToggleMute: () => void;
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

/** Default seek amount in seconds */
const SEEK_AMOUNT = 5;
/** Seek amount when Shift key is held */
const SEEK_AMOUNT_SHIFT = 10;

export function useKeyboardShortcuts({
  onSeekForward,
  onSeekBackward,
  onTogglePlayPause,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  enabled = true,
}: KeyboardShortcutsHandlers): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const seekAmount = event.shiftKey ? SEEK_AMOUNT_SHIFT : SEEK_AMOUNT;

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          onSeekForward(seekAmount);
          break;

        case "ArrowLeft":
          event.preventDefault();
          onSeekBackward(seekAmount);
          break;

        case " ": // Space
          event.preventDefault();
          onTogglePlayPause();
          break;

        case "k":
        case "K":
          event.preventDefault();
          onTogglePlayPause();
          break;

        case "ArrowUp":
          event.preventDefault();
          onVolumeUp();
          break;

        case "ArrowDown":
          event.preventDefault();
          onVolumeDown();
          break;

        case "m":
        case "M":
          event.preventDefault();
          onToggleMute();
          break;
      }
    },
    [
      enabled,
      onSeekForward,
      onSeekBackward,
      onTogglePlayPause,
      onVolumeUp,
      onVolumeDown,
      onToggleMute,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
