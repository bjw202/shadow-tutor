import type { VoiceOption } from "@/types/audio";

/**
 * Information about a TTS voice
 */
export interface VoiceInfo {
  /** Voice ID matching VoiceOption type */
  id: VoiceOption;
  /** Display name for the voice */
  name: string;
  /** Description of the voice characteristics */
  description: string;
}

/**
 * Available OpenAI TTS voices with metadata
 */
export const VOICES: VoiceInfo[] = [
  { id: "alloy", name: "Alloy", description: "Neutral, balanced" },
  { id: "echo", name: "Echo", description: "Warm, conversational" },
  { id: "fable", name: "Fable", description: "Expressive, narrative" },
  { id: "onyx", name: "Onyx", description: "Deep, authoritative" },
  { id: "nova", name: "Nova", description: "Friendly, upbeat" },
  { id: "shimmer", name: "Shimmer", description: "Clear, professional" },
];

/**
 * Default voice selection
 */
export const DEFAULT_VOICE: VoiceOption = "nova";

/**
 * Default playback speed (1.0 = normal speed)
 */
export const DEFAULT_SPEED = 1.0;

/**
 * Minimum allowed playback speed
 */
export const MIN_SPEED = 0.5;

/**
 * Maximum allowed playback speed
 */
export const MAX_SPEED = 2.0;

/**
 * Default volume level (1.0 = 100%)
 */
export const DEFAULT_VOLUME = 1.0;

/**
 * Maximum text length allowed for TTS
 */
export const MAX_TEXT_LENGTH = 1000;
