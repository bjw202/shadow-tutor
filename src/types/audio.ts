/**
 * Audio playback state
 */
export type PlaybackState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "stopped";

/**
 * OpenAI TTS voice options
 */
export type VoiceOption =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

/**
 * TTS API error codes
 */
export type TTSErrorCode =
  | "INVALID_INPUT"
  | "TEXT_TOO_LONG"
  | "API_ERROR"
  | "RATE_LIMITED";

/**
 * TTS API request payload
 */
export interface TTSRequest {
  /** Text content to convert to speech */
  text: string;
  /** Voice to use for TTS */
  voice: VoiceOption;
  /** Optional playback speed (0.5 to 2.0) */
  speed?: number;
}

/**
 * TTS API success response
 */
export interface TTSResponse {
  /** Base64 encoded audio data */
  audioData: string;
  /** Audio content type (e.g., "audio/mpeg") */
  contentType: string;
  /** Optional audio duration in seconds */
  duration?: number;
}

/**
 * TTS API error response
 */
export interface TTSErrorResponse {
  /** Error message */
  error: string;
  /** Error code for categorization */
  code: TTSErrorCode;
}
