import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlaybackMode } from "@/lib/hooks/use-playback-mode";
import { usePracticeStore } from "@/stores/practice-store";

// Reset store helper
const resetStore = () => {
  const { result } = renderHook(() => usePracticeStore());
  act(() => {
    result.current.setMode("continuous");
    result.current.updateShadowingSettings({
      pauseDuration: 5,
      repeatCount: 1,
      autoAdvance: true,
    });
    result.current.clearSession();
  });
};

describe("usePlaybackMode", () => {
  beforeEach(() => {
    resetStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initialization", () => {
    it("should return current mode from store", () => {
      const { result } = renderHook(() => usePlaybackMode());

      expect(result.current.mode).toBe("continuous");
    });

    it("should return shadowing settings from store", () => {
      const { result } = renderHook(() => usePlaybackMode());

      expect(result.current.shadowingSettings).toEqual({
        pauseDuration: 5,
        repeatCount: 1,
        autoAdvance: true,
      });
    });

    it("should return shadowing pause state", () => {
      const { result } = renderHook(() => usePlaybackMode());

      expect(result.current.isShadowingPaused).toBe(false);
      expect(result.current.remainingTime).toBe(0);
      expect(result.current.currentRepeat).toBe(0);
    });
  });

  describe("mode switching", () => {
    it("should switch to shadowing mode", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
      });

      expect(result.current.mode).toBe("shadowing");
    });

    it("should switch to continuous mode", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
      });

      act(() => {
        result.current.setMode("continuous");
      });

      expect(result.current.mode).toBe("continuous");
    });
  });

  describe("settings update", () => {
    it("should update pause duration", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.updateSettings({ pauseDuration: 10 });
      });

      expect(result.current.shadowingSettings.pauseDuration).toBe(10);
    });

    it("should update repeat count", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.updateSettings({ repeatCount: 3 });
      });

      expect(result.current.shadowingSettings.repeatCount).toBe(3);
    });

    it("should update auto-advance setting", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.updateSettings({ autoAdvance: false });
      });

      expect(result.current.shadowingSettings.autoAdvance).toBe(false);
    });
  });

  describe("handleSegmentEnd (continuous mode)", () => {
    it("should call onAdvance immediately in continuous mode", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      expect(mockOnAdvance).toHaveBeenCalled();
    });
  });

  describe("handleSegmentEnd (shadowing mode)", () => {
    it("should start pause timer in shadowing mode", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      expect(result.current.isShadowingPaused).toBe(true);
      expect(result.current.remainingTime).toBe(5); // default pause duration
      expect(mockOnAdvance).not.toHaveBeenCalled();
    });

    it("should complete pause and advance when repeatCount is 1 (default)", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        // Ensure autoAdvance is true so onAdvance is called
        result.current.updateSettings({ autoAdvance: true });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      // Fast forward through the pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After all repeats complete, repeat count is reset to 0
      expect(result.current.currentRepeat).toBe(0);
      // And onAdvance should have been called
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it("should repeat segment if repeat count not reached", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 2 });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete first pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.currentRepeat).toBe(1);
      expect(mockOnRepeat).toHaveBeenCalled();
      expect(mockOnAdvance).not.toHaveBeenCalled();
    });

    it("should advance to next segment after all repeats complete with autoAdvance", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 1, autoAdvance: true });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.currentRepeat).toBe(0); // reset after advance
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it("should stop after all repeats if autoAdvance is false", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 1, autoAdvance: false });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockOnAdvance).not.toHaveBeenCalled();
    });
  });

  describe("skipPause", () => {
    it("should skip the current pause", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      expect(result.current.isShadowingPaused).toBe(true);

      act(() => {
        result.current.skipPause();
      });

      expect(result.current.isShadowingPaused).toBe(false);
      expect(result.current.remainingTime).toBe(0);
    });

    it("should increment repeat count when skipping", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 2 });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      act(() => {
        result.current.skipPause();
      });

      expect(result.current.currentRepeat).toBe(1);
    });
  });

  describe("timer management", () => {
    it("should decrement remaining time each second during pause", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ pauseDuration: 10 });
      });

      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      expect(result.current.remainingTime).toBe(10);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remainingTime).toBe(9);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.remainingTime).toBe(7);
    });
  });

  describe("reset", () => {
    it("should reset repeat count and pause state", () => {
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
      });

      // Simulate some progress
      const mockOnAdvance = vi.fn();
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      expect(result.current.isShadowingPaused).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isShadowingPaused).toBe(false);
      expect(result.current.remainingTime).toBe(0);
      expect(result.current.currentRepeat).toBe(0);
    });
  });
});
