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
}
