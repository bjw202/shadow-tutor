import type { VoiceOption } from "./audio";

/**
 * Settings state for the application
 */
export interface SettingsState {
  // TTS Settings
  /** Selected TTS voice */
  voice: VoiceOption;
  /** Playback speed (0.5 to 2.0) */
  speed: number;
  /** Volume level (0 to 1) */
  volume: number;
  /** Whether audio is muted */
  isMuted: boolean;

  // Shadowing Settings
  /** Pause duration in seconds (1 to 30) */
  pauseDuration: number;
  /** Number of repetitions (1 to 10) */
  repeatCount: number;
  /** Whether to automatically advance to next segment */
  autoAdvance: boolean;

  // Initialization state
  /** Whether settings have been initialized from localStorage */
  isInitialized: boolean;
}

/**
 * Actions for the settings store
 */
export interface SettingsActions {
  // TTS Actions
  /** Set the TTS voice */
  setVoice: (voice: VoiceOption) => void;
  /** Set the playback speed */
  setSpeed: (speed: number) => void;
  /** Set the volume level */
  setVolume: (volume: number) => void;
  /** Set the muted state */
  setMuted: (isMuted: boolean) => void;
  /** Toggle mute state */
  toggleMute: () => void;

  // Shadowing Actions
  /** Set the pause duration */
  setPauseDuration: (duration: number) => void;
  /** Set the repeat count */
  setRepeatCount: (count: number) => void;
  /** Set the auto-advance option */
  setAutoAdvance: (autoAdvance: boolean) => void;

  // General Actions
  /** Reset all settings to defaults */
  resetToDefaults: () => void;
  /** Mark settings as initialized */
  setInitialized: () => void;
}

/**
 * Combined settings store type
 */
export type SettingsStore = SettingsState & SettingsActions;
