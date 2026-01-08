/**
 * Represents a single segment of parsed text
 */
export interface TextSegment {
  /** Unique identifier for the segment */
  id: string;
  /** The text content of this segment */
  text: string;
  /** Starting character position in the original content */
  startPosition: number;
  /** Ending character position in the original content */
  endPosition: number;
}

/**
 * Input method for content entry
 * - file: Upload a text file
 * - text: Direct text paste/input
 */
export type InputMethod = "file" | "text";

/**
 * State for text input area
 */
export interface TextInputState {
  /** The raw text content */
  text: string;
  /** Current character count */
  charCount: number;
  /** Whether the current text is valid for practice */
  isValid: boolean;
  /** Validation error message if any */
  validationError: string | null;
}

/**
 * Available modes for parsing text content
 * - sentence: Split by sentence terminators (. ! ?)
 * - phrase: Split by phrase separators (, ; :) and sentence terminators
 * - paragraph: Split by double newlines
 */
export type ParseMode = "sentence" | "phrase" | "paragraph";

/**
 * Current status of the upload process
 */
export type UploadStatus = "idle" | "uploading" | "parsing" | "complete" | "error";

/**
 * Complete state for the upload feature
 */
export interface UploadState {
  /** The uploaded file object */
  file: File | null;
  /** Raw text content from the file */
  content: string;
  /** Parsed text segments */
  segments: TextSegment[];
  /** Current upload/parsing status */
  status: UploadStatus;
  /** Error message if status is 'error' */
  error: string | null;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Currently selected parse mode */
  parseMode: ParseMode;
  /** Currently selected input method (file or text) */
  inputMethod: InputMethod;
  /** State for text input area */
  textInput: TextInputState;
}
