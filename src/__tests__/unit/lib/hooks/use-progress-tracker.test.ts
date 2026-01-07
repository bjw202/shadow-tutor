import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useProgressTracker } from "@/lib/hooks/use-progress-tracker";
import { usePracticeStore } from "@/stores/practice-store";
import { useProgressStore } from "@/stores/progress-store";

// Mock stores
vi.mock("@/stores/practice-store", () => ({
  usePracticeStore: vi.fn(),
}));

vi.mock("@/stores/progress-store", () => ({
  useProgressStore: vi.fn(),
}));

describe("use-progress-tracker", () => {
  const mockUpdateSegmentStatus = vi.fn();
  const mockCompleteSegment = vi.fn();
  const mockSetLastSegmentIndex = vi.fn();
  const mockGetCurrentSegmentProgress = vi.fn();
  const mockGetCompletionRate = vi.fn().mockReturnValue(0);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompletionRate.mockReturnValue(0);
    mockGetCurrentSegmentProgress.mockReturnValue(null);

    // Default mock implementations
    vi.mocked(usePracticeStore).mockImplementation((selector) => {
      const state = {
        currentSegmentIndex: 0,
        segments: [
          { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
          { id: "seg-2", text: "World", startPosition: 6, endPosition: 11 },
        ],
        playbackState: "idle" as const,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return selector ? selector(state as any) : state;
    });

    vi.mocked(useProgressStore).mockImplementation((selector) => {
      const state = {
        currentSession: {
          id: "session-1",
          segmentProgress: [
            { segmentId: "seg-1", status: "not_started", completedAt: null, repeatCount: 0 },
            { segmentId: "seg-2", status: "not_started", completedAt: null, repeatCount: 0 },
          ],
        },
        updateSegmentStatus: mockUpdateSegmentStatus,
        completeSegment: mockCompleteSegment,
        setLastSegmentIndex: mockSetLastSegmentIndex,
        getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
        getCompletionRate: mockGetCompletionRate,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return selector ? selector(state as any) : state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("segment change tracking", () => {
    it("should update segment status when segment changes", async () => {
      let currentIndex = 0;

      vi.mocked(usePracticeStore).mockImplementation((selector) => {
        const state = {
          currentSegmentIndex: currentIndex,
          segments: [
            { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
            { id: "seg-2", text: "World", startPosition: 6, endPosition: 11 },
          ],
          playbackState: "playing" as const,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            segmentProgress: [
              { segmentId: "seg-1", status: "not_started", completedAt: null, repeatCount: 0 },
              { segmentId: "seg-2", status: "not_started", completedAt: null, repeatCount: 0 },
            ],
          },
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      const { rerender } = renderHook(() => useProgressTracker());

      // Change to next segment
      currentIndex = 1;
      rerender();

      await waitFor(() => {
        expect(mockSetLastSegmentIndex).toHaveBeenCalledWith(1);
      });
    });

    it("should mark current segment as in_progress", async () => {
      vi.mocked(usePracticeStore).mockImplementation((selector) => {
        const state = {
          currentSegmentIndex: 0,
          segments: [
            { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
          ],
          playbackState: "playing" as const,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            segmentProgress: [
              { segmentId: "seg-1", status: "not_started", completedAt: null, repeatCount: 0 },
            ],
          },
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      renderHook(() => useProgressTracker());

      await waitFor(() => {
        expect(mockUpdateSegmentStatus).toHaveBeenCalledWith("seg-1", "in_progress");
      });
    });
  });

  describe("playback completion tracking", () => {
    it("should mark segment as completed when playback ends", async () => {
      let playbackState: "playing" | "stopped" = "playing";

      vi.mocked(usePracticeStore).mockImplementation((selector) => {
        const state = {
          currentSegmentIndex: 0,
          segments: [
            { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
          ],
          playbackState,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            segmentProgress: [
              { segmentId: "seg-1", status: "in_progress", completedAt: null, repeatCount: 0 },
            ],
          },
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      const { rerender } = renderHook(() => useProgressTracker());

      // Simulate playback ending
      playbackState = "stopped";
      rerender();

      await waitFor(() => {
        expect(mockCompleteSegment).toHaveBeenCalledWith("seg-1");
      });
    });
  });

  describe("no session handling", () => {
    it("should not track when no session exists", () => {
      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: null,
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      renderHook(() => useProgressTracker());

      expect(mockUpdateSegmentStatus).not.toHaveBeenCalled();
      expect(mockCompleteSegment).not.toHaveBeenCalled();
    });
  });

  describe("return values", () => {
    it("should return current segment progress", () => {
      const mockProgress = {
        segmentId: "seg-1",
        status: "in_progress",
        completedAt: null,
        repeatCount: 1,
      };
      mockGetCurrentSegmentProgress.mockReturnValue(mockProgress);

      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            segmentProgress: [
              { segmentId: "seg-1", status: "in_progress", completedAt: null, repeatCount: 1 },
            ],
          },
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      const { result } = renderHook(() => useProgressTracker());

      expect(result.current.currentSegmentProgress).toBeDefined();
    });

    it("should return completion rate", () => {
      mockGetCompletionRate.mockReturnValue(0.5);

      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            segmentProgress: [
              { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 1 },
              { segmentId: "seg-2", status: "not_started", completedAt: null, repeatCount: 0 },
            ],
          },
          updateSegmentStatus: mockUpdateSegmentStatus,
          completeSegment: mockCompleteSegment,
          setLastSegmentIndex: mockSetLastSegmentIndex,
          getCurrentSegmentProgress: mockGetCurrentSegmentProgress,
          getCompletionRate: mockGetCompletionRate,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      const { result } = renderHook(() => useProgressTracker());

      expect(result.current.completionRate).toBe(0.5);
    });

    it("should return isTracking state", () => {
      const { result } = renderHook(() => useProgressTracker());

      expect(typeof result.current.isTracking).toBe("boolean");
    });
  });
});
