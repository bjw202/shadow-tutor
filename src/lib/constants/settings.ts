import type { VoiceOption } from "@/types/audio";
import type { SettingsState } from "@/types/settings";

/**
 * localStorage key for settings
 */
export const STORAGE_KEY_SETTINGS = "shadow-tutor:settings";

/**
 * Default TTS voice
 */
export const DEFAULT_VOICE: VoiceOption = "nova";

/**
 * Default playback speed
 */
export const DEFAULT_SPEED = 1.0;

/**
 * Minimum playback speed
 */
export const MIN_SPEED = 0.5;

/**
 * Maximum playback speed
 */
export const MAX_SPEED = 2.0;

/**
 * Speed step for slider/keyboard
 */
export const SPEED_STEP = 0.05;

/**
 * Default volume level
 */
export const DEFAULT_VOLUME = 1.0;

/**
 * Minimum volume level
 */
export const MIN_VOLUME = 0;

/**
 * Maximum volume level
 */
export const MAX_VOLUME = 1;

/**
 * Default pause duration in seconds
 */
export const DEFAULT_PAUSE_DURATION = 5;

/**
 * Minimum pause duration in seconds
 */
export const MIN_PAUSE_DURATION = 1;

/**
 * Maximum pause duration in seconds
 */
export const MAX_PAUSE_DURATION = 30;

/**
 * Default repeat count
 */
export const DEFAULT_REPEAT_COUNT = 1;

/**
 * Minimum repeat count
 */
export const MIN_REPEAT_COUNT = 1;

/**
 * Maximum repeat count
 */
export const MAX_REPEAT_COUNT = 10;

/**
 * Default auto-advance setting
 */
export const DEFAULT_AUTO_ADVANCE = true;

/**
 * Default settings state
 */
export const DEFAULT_SETTINGS: Omit<SettingsState, "isInitialized"> = {
  voice: DEFAULT_VOICE,
  speed: DEFAULT_SPEED,
  volume: DEFAULT_VOLUME,
  isMuted: false,
  pauseDuration: DEFAULT_PAUSE_DURATION,
  repeatCount: DEFAULT_REPEAT_COUNT,
  autoAdvance: DEFAULT_AUTO_ADVANCE,
};

/**
 * Validates if the speed is within allowed range
 * @param speed - Playback speed
 * @returns true if valid, false otherwise
 */
export function isValidSpeed(speed: number): boolean {
  return speed >= MIN_SPEED && speed <= MAX_SPEED;
}

/**
 * Validates if the volume is within allowed range
 * @param volume - Volume level
 * @returns true if valid, false otherwise
 */
export function isValidVolume(volume: number): boolean {
  return volume >= MIN_VOLUME && volume <= MAX_VOLUME;
}

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

/**
 * Clamps a speed value to the valid range
 * @param speed - Playback speed
 * @returns Clamped speed value
 */
export function clampSpeed(speed: number): number {
  return Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
}

/**
 * Clamps a volume value to the valid range
 * @param volume - Volume level
 * @returns Clamped volume value
 */
export function clampVolume(volume: number): number {
  return Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, volume));
}

/**
 * Clamps a pause duration to the valid range
 * @param duration - Pause duration in seconds
 * @returns Clamped duration value
 */
export function clampPauseDuration(duration: number): number {
  return Math.max(MIN_PAUSE_DURATION, Math.min(MAX_PAUSE_DURATION, duration));
}

/**
 * Clamps a repeat count to the valid range
 * @param count - Repeat count
 * @returns Clamped count value
 */
export function clampRepeatCount(count: number): number {
  return Math.max(MIN_REPEAT_COUNT, Math.min(MAX_REPEAT_COUNT, count));
}
