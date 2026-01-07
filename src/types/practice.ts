import type { TextSegment } from "./upload";
import type { PlaybackState, VoiceOption } from "./audio";

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
  /** Currently selected TTS voice */
  selectedVoice: VoiceOption;
  /** Cache of audio data by segment ID */
  audioCache: Map<string, string>;
  /** Error message, null if no error */
  error: string | null;
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
  /** Set the TTS voice */
  setVoice: (voice: VoiceOption) => void;
  /** Set the playback state */
  setPlaybackState: (state: PlaybackState) => void;
  /** Cache audio data for a segment */
  cacheAudio: (segmentId: string, audioData: string) => void;
  /** Set or clear error message */
  setError: (error: string | null) => void;
}
