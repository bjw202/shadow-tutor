import type { TextSegment } from "./upload";
import type { PlaybackState, VoiceOption } from "./audio";

/**
 * Playback mode for practice sessions
 * - 'continuous': Audio plays continuously through all segments
 * - 'shadowing': Audio pauses after each segment for user to repeat
 */
export type PlaybackMode = "continuous" | "shadowing";

/**
 * Settings for shadowing mode
 */
export interface ShadowingSettings {
  /** Duration of pause after each segment in seconds (1-30) */
  pauseDuration: number;
  /** Number of times to repeat each segment (1-10) */
  repeatCount: number;
  /** Whether to auto-advance to next segment after repeats complete */
  autoAdvance: boolean;
}

/**
 * Represents a practice session with segments to practice
 */
export interface PracticeSession {
  /** Unique identifier for the session */
  id: string;
  /** Session title/name */
  title: string;
  /** Text segments in this session */
  segments: TextSegment[];
  /** When the session was created */
  createdAt: Date;
}

/**
 * State for the practice store
 */
export interface PracticeState {
  /** Current session ID, null if no active session */
  sessionId: string | null;
  /** Segments in the current session */
  segments: TextSegment[];
  /** Index of the currently active segment */
  currentSegmentIndex: number;
  /** Current playback state */
  playbackState: PlaybackState;
  /** Playback speed (0.5 to 2.0) */
  playbackSpeed: number;
  /** Volume level (0.0 to 1.0) */
  volume: number;
  /** Whether audio is muted */
  isMuted: boolean;
  /** Currently selected TTS voice */
  selectedVoice: VoiceOption;
  /** Cache of audio data by segment ID */
  audioCache: Map<string, string>;
  /** Whether auto-scroll is enabled for segment list */
  isAutoScrollEnabled: boolean;
  /** Error message, null if no error */
  error: string | null;
  /** Current playback mode (continuous or shadowing) */
  mode: PlaybackMode;
  /** Settings for shadowing mode */
  shadowingSettings: ShadowingSettings;
  /** Current repeat count in shadowing mode */
  currentRepeat: number;
  /** Whether currently in shadowing pause state */
  isShadowingPaused: boolean;
  /** Remaining time in seconds for current shadowing pause */
  remainingTime: number;
}

/**
 * Actions available for the practice store
 */
export interface PracticeActions {
  /** Initialize a new session with segments */
  initSession: (segments: TextSegment[]) => void;
  /** Clear the current session */
  clearSession: () => void;
  /** Start or resume playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Stop playback and reset */
  stop: () => void;
  /** Move to the next segment */
  nextSegment: () => void;
  /** Move to the previous segment */
  previousSegment: () => void;
  /** Go to a specific segment by index */
  goToSegment: (index: number) => void;
  /** Set playback speed */
  setPlaybackSpeed: (speed: number) => void;
  /** Set volume level */
  setVolume: (volume: number) => void;
  /** Toggle mute state */
  toggleMute: () => void;
  /** Set the TTS voice */
  setVoice: (voice: VoiceOption) => void;
  /** Set the playback state */
  setPlaybackState: (state: PlaybackState) => void;
  /** Cache audio data for a segment */
  cacheAudio: (segmentId: string, audioData: string) => void;
  /** Set auto-scroll enabled state */
  setAutoScrollEnabled: (enabled: boolean) => void;
  /** Set or clear error message */
  setError: (error: string | null) => void;
  /** Set the playback mode */
  setMode: (mode: PlaybackMode) => void;
  /** Update shadowing settings (partial update supported) */
  updateShadowingSettings: (settings: Partial<ShadowingSettings>) => void;
  /** Start shadowing pause with remaining time set to pauseDuration */
  startPause: () => void;
  /** Skip the current shadowing pause */
  skipPause: () => void;
  /** Increment the current repeat count */
  incrementRepeat: () => void;
  /** Reset the current repeat count to 0 */
  resetRepeat: () => void;
  /** Set the remaining time for shadowing pause */
  setRemainingTime: (time: number) => void;
}
