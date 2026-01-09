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
    it("should respect repeatCount in continuous mode (repeatCount=1)", () => {
      const mockOnAdvance = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      // Continuous mode is default, repeatCount=1 is default
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance);
      });

      // Should start pause
      expect(result.current.isShadowingPaused).toBe(true);

      // Complete pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Should advance after pause (repeatCount=1 means play once then advance)
      expect(mockOnAdvance).toHaveBeenCalled();
    });

    it("should repeat in continuous mode when repeatCount > 1", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      // Set repeatCount=2 in continuous mode
      act(() => {
        result.current.updateSettings({ repeatCount: 2, pauseDuration: 5 });
      });

      // First segment end
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete first pause - should repeat
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled();
      expect(result.current.currentRepeat).toBe(1);

      // Second segment end
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete second pause - should advance (all 2 repeats done)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockOnRepeat).toHaveBeenCalledTimes(1); // No new repeat
      expect(mockOnAdvance).toHaveBeenCalledTimes(1); // Now advance
      expect(result.current.currentRepeat).toBe(0); // Reset
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

  describe("SPEC-REPEAT-001-FIX: repeatCount bug fix", () => {
    // These tests verify that repeatCount=N plays exactly N times before advancing
    // The bug: comparison uses < instead of <=, causing N-1 plays for N > 1

    it("should play exactly 1 time when repeatCount=1 then advance", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 1, autoAdvance: true, pauseDuration: 5 });
      });

      // Start first segment end (play #1)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete pause timer
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // With repeatCount=1, should play 1 time then advance
      expect(mockOnRepeat).not.toHaveBeenCalled();
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
      expect(result.current.currentRepeat).toBe(0); // Reset after advance
    });

    it("should play exactly 2 times when repeatCount=2 then advance", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 2, autoAdvance: true, pauseDuration: 5 });
      });

      // First segment end (play #1)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete first pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After first pause: should repeat (onRepeat called), not advance
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled();
      expect(result.current.currentRepeat).toBe(1);

      // Second segment end (play #2) - simulating the repeat playback completion
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Complete second pause
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After second pause: should advance (all 2 repeats done)
      expect(mockOnRepeat).toHaveBeenCalledTimes(1); // Still 1 from before
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
      expect(result.current.currentRepeat).toBe(0); // Reset after advance
    });

    it("should play exactly 3 times when repeatCount=3 then advance", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 3, autoAdvance: true, pauseDuration: 5 });
      });

      // First segment end (play #1)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After first pause: repeat #1
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled();
      expect(result.current.currentRepeat).toBe(1);

      // Second segment end (play #2)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After second pause: repeat #2
      expect(mockOnRepeat).toHaveBeenCalledTimes(2);
      expect(mockOnAdvance).not.toHaveBeenCalled();
      expect(result.current.currentRepeat).toBe(2);

      // Third segment end (play #3)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After third pause: should advance (all 3 repeats done)
      expect(mockOnRepeat).toHaveBeenCalledTimes(2); // No more repeats
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
      expect(result.current.currentRepeat).toBe(0); // Reset after advance
    });

    it("should respect repeatCount when using skipPause", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 2, autoAdvance: true, pauseDuration: 5 });
      });

      // First segment end
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Skip first pause instead of waiting
      act(() => {
        result.current.skipPause();
      });

      // After first skip: should repeat, not advance
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled();
      expect(result.current.currentRepeat).toBe(1);

      // Second segment end (simulating repeat playback)
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });

      // Skip second pause
      act(() => {
        result.current.skipPause();
      });

      // After second skip: should advance (all 2 repeats done)
      expect(mockOnRepeat).toHaveBeenCalledTimes(1); // Still 1
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
      expect(result.current.currentRepeat).toBe(0); // Reset after advance
    });

    it("should not advance when autoAdvance is false after all repeats", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 2, autoAdvance: false, pauseDuration: 5 });
      });

      // First segment end
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After first pause: should repeat
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled();

      // Second segment end
      act(() => {
        result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // After second pause: all repeats done but autoAdvance=false
      expect(mockOnRepeat).toHaveBeenCalledTimes(1);
      expect(mockOnAdvance).not.toHaveBeenCalled(); // Should NOT advance
      expect(result.current.currentRepeat).toBe(0); // Still reset
    });

    // SPEC-REPEAT-001-FIX: Critical test to verify bug fix
    // This test specifically checks the off-by-one error scenario
    it("should call onRepeat exactly (repeatCount - 1) times before advance", () => {
      const mockOnAdvance = vi.fn();
      const mockOnRepeat = vi.fn();
      const { result } = renderHook(() => usePlaybackMode());

      // Test with repeatCount=3: should play 3 times total
      // - First play: already done (segment ended)
      // - onRepeat called: 2 times (for plays #2 and #3)
      // - onAdvance called: 1 time (after play #3)
      act(() => {
        result.current.setMode("shadowing");
        result.current.updateSettings({ repeatCount: 3, autoAdvance: true, pauseDuration: 1 });
      });

      // Simulate 3 complete play cycles
      for (let playCount = 1; playCount <= 3; playCount++) {
        act(() => {
          result.current.handleSegmentEnd(mockOnAdvance, mockOnRepeat);
        });
        act(() => {
          vi.advanceTimersByTime(1000);
        });
      }

      // Verify: for N=3, we expect:
      // - onRepeat called 2 times (N-1)
      // - onAdvance called 1 time
      expect(mockOnRepeat).toHaveBeenCalledTimes(2);
      expect(mockOnAdvance).toHaveBeenCalledTimes(1);
    });
  });
});
