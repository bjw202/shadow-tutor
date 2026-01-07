/**
 * Status of a segment's learning progress
 * - 'not_started': Segment has not been practiced yet
 * - 'in_progress': Segment is currently being practiced
 * - 'completed': Segment has been fully practiced
 */
export type SegmentStatus = "not_started" | "in_progress" | "completed";

/**
 * Progress tracking for a single segment
 */
export interface SegmentProgress {
  /** ID of the segment being tracked */
  segmentId: string;
  /** Current status of the segment */
  status: SegmentStatus;
  /** Timestamp when segment was completed, null if not completed */
  completedAt: number | null;
  /** Number of times the segment has been repeated */
  repeatCount: number;
}

/**
 * Complete session data stored in IndexedDB
 */
export interface SessionData {
  /** Unique identifier for the session */
  id: string;
  /** Hash of the content to identify same content across sessions */
  contentHash: string;
  /** Display title for the session */
  title: string;
  /** Total number of segments in this session */
  totalSegments: number;
  /** Progress tracking for each segment */
  segmentProgress: SegmentProgress[];
  /** Timestamp when the session was created */
  createdAt: number;
  /** Timestamp of last activity in this session */
  lastActiveAt: number;
  /** Timestamp when session was completed, null if not completed */
  completedAt: number | null;
  /** Total study time in seconds */
  totalStudyTime: number;
  /** Last segment index for resume functionality */
  lastSegmentIndex?: number;
}

/**
 * Summarized session info for list display
 */
export interface SessionListItem {
  /** Session ID */
  id: string;
  /** Display title */
  title: string;
  /** Completion rate (0.0 to 1.0) */
  completionRate: number;
  /** Total number of segments */
  totalSegments: number;
  /** Number of completed segments */
  completedSegments: number;
  /** Timestamp of last activity */
  lastActiveAt: number;
  /** Total study time in seconds */
  totalStudyTime: number;
}
