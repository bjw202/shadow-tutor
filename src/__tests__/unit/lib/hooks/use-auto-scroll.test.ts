import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoScroll } from "@/lib/hooks/use-auto-scroll";

describe("useAutoScroll", () => {
  let mockElement: HTMLElement;
  let mockScrollIntoView: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockScrollIntoView = vi.fn();
    mockElement = document.createElement("div");
    mockElement.scrollIntoView = mockScrollIntoView as unknown as (arg?: boolean | ScrollIntoViewOptions) => void;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return isAutoScrollEnabled as true by default", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      expect(result.current.isAutoScrollEnabled).toBe(true);
    });

    it("should return a ref object", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      expect(result.current.containerRef).toBeDefined();
      expect(result.current.containerRef.current).toBeNull();
    });
  });

  describe("scrollToItem function", () => {
    it("should provide scrollToItem function", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      expect(typeof result.current.scrollToItem).toBe("function");
    });

    it("should call scrollIntoView on the target element", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      act(() => {
        result.current.scrollToItem(mockElement);
      });

      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "nearest",
      });
    });

    it("should not scroll when auto-scroll is disabled", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: false })
      );

      act(() => {
        result.current.scrollToItem(mockElement);
      });

      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("manual scroll detection", () => {
    it("should disable auto-scroll on manual scroll", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      // Create a container element
      const container = document.createElement("div");

      // Set the ref
      Object.defineProperty(result.current.containerRef, "current", {
        value: container,
        writable: true,
      });

      // Simulate manual scroll
      act(() => {
        result.current.handleManualScroll();
      });

      expect(result.current.isAutoScrollEnabled).toBe(false);
    });

    it("should re-enable auto-scroll after 3 seconds", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      // Simulate manual scroll
      act(() => {
        result.current.handleManualScroll();
      });

      expect(result.current.isAutoScrollEnabled).toBe(false);

      // Advance time by 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.isAutoScrollEnabled).toBe(true);
    });

    it("should reset timer on subsequent manual scrolls", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      // First manual scroll
      act(() => {
        result.current.handleManualScroll();
      });

      // Advance 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Another manual scroll
      act(() => {
        result.current.handleManualScroll();
      });

      // Advance 2 more seconds (total 4 from first, 2 from second)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should still be disabled because timer was reset
      expect(result.current.isAutoScrollEnabled).toBe(false);

      // Advance 1 more second (total 3 from second scroll)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.isAutoScrollEnabled).toBe(true);
    });
  });

  describe("enabled prop", () => {
    it("should respect enabled prop when false", () => {
      const { result } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: false })
      );

      expect(result.current.isAutoScrollEnabled).toBe(false);
    });

    it("should update when enabled prop changes", () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useAutoScroll({ currentIndex: 0, enabled }),
        { initialProps: { enabled: true } }
      );

      expect(result.current.isAutoScrollEnabled).toBe(true);

      rerender({ enabled: false });

      expect(result.current.isAutoScrollEnabled).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should clear timeout on unmount", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { result, unmount } = renderHook(() =>
        useAutoScroll({ currentIndex: 0, enabled: true })
      );

      // Trigger manual scroll to create a timeout
      act(() => {
        result.current.handleManualScroll();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
});
