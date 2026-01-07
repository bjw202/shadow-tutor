import type { ShadowingSettings } from "@/types/practice";

/**
 * Minimum allowed pause duration in seconds
 */
export const MIN_PAUSE_DURATION = 1;

/**
 * Maximum allowed pause duration in seconds
 */
export const MAX_PAUSE_DURATION = 30;

/**
 * Minimum allowed repeat count
 */
export const MIN_REPEAT_COUNT = 1;

/**
 * Maximum allowed repeat count
 */
export const MAX_REPEAT_COUNT = 10;

/**
 * Default shadowing settings
 */
export const DEFAULT_SHADOWING_SETTINGS: ShadowingSettings = {
  pauseDuration: 5,
  repeatCount: 1,
  autoAdvance: true,
};

/**
 * localStorage key for playback mode
 */
export const STORAGE_KEY_MODE = "shadow-tutor:playback-mode";

/**
 * localStorage key for shadowing settings
 */
export const STORAGE_KEY_SETTINGS = "shadow-tutor:shadowing-settings";

/**
 * Validates if the pause duration is within allowed range
 * @param duration - Pause duration in seconds
 * @returns true if valid, false otherwise
 */
export function isValidPauseDuration(duration: number): boolean {
  return duration >= MIN_PAUSE_DURATION && duration <= MAX_PAUSE_DURATION;
}

/**
 * Validates if the repeat count is within allowed range
 * @param count - Repeat count
 * @returns true if valid, false otherwise
 */
export function isValidRepeatCount(count: number): boolean {
  return count >= MIN_REPEAT_COUNT && count <= MAX_REPEAT_COUNT;
}
