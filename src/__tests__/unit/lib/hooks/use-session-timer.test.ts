import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionTimer } from "@/lib/hooks/use-session-timer";

// Mock progress store
vi.mock("@/stores/progress-store", () => ({
  useProgressStore: vi.fn((selector) => {
    const state = {
      currentSession: { id: "session-1" },
      updateStudyTime: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return selector ? selector(state as any) : state;
  }),
}));

describe("use-session-timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("timer state", () => {
    it("should return elapsed time starting at 0", () => {
      const { result } = renderHook(() => useSessionTimer());

      expect(result.current.elapsedSeconds).toBe(0);
    });

    it("should return isRunning state", () => {
      const { result } = renderHook(() => useSessionTimer());

      expect(typeof result.current.isRunning).toBe("boolean");
    });

    it("should return formatted time string", () => {
      const { result } = renderHook(() => useSessionTimer());

      expect(result.current.formattedTime).toBe("0:00");
    });
  });

  describe("timer controls", () => {
    it("should start timer with start()", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);
    });

    it("should stop timer with stop()", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        result.current.stop();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it("should reset timer with reset()", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("time tracking", () => {
    it("should increment elapsed time every second when running", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.elapsedSeconds).toBe(3);
    });

    it("should not increment time when stopped", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.stop();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.elapsedSeconds).toBe(2);
    });

    it("should format time correctly", () => {
      const { result } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(65000); // 1 minute 5 seconds
      });

      expect(result.current.formattedTime).toBe("1:05");
    });
  });

  describe("auto-start option", () => {
    it("should auto-start when autoStart is true", () => {
      const { result } = renderHook(() => useSessionTimer({ autoStart: true }));

      expect(result.current.isRunning).toBe(true);
    });

    it("should not auto-start when autoStart is false", () => {
      const { result } = renderHook(() => useSessionTimer({ autoStart: false }));

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should clear interval on unmount", () => {
      const { result, unmount } = renderHook(() => useSessionTimer());

      act(() => {
        result.current.start();
      });

      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
