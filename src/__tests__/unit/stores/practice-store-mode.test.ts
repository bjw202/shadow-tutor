import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePracticeStore } from "@/stores/practice-store";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Helper to fully reset the store to initial state
const resetStore = () => {
  const { result } = renderHook(() => usePracticeStore());
  act(() => {
    // Reset mode to default
    result.current.setMode("continuous");
    // Reset shadowing settings to defaults
    result.current.updateShadowingSettings({
      pauseDuration: 5,
      repeatCount: 1,
      autoAdvance: true,
    });
    // Clear session resets other state
    result.current.clearSession();
  });
};

describe("Practice Store - Mode Extensions", () => {
  beforeEach(() => {
    // Reset store state before each test
    resetStore();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("mode state", () => {
    it("should have 'continuous' as the default mode", () => {
      const { result } = renderHook(() => usePracticeStore());
      expect(result.current.mode).toBe("continuous");
    });

    it("should update mode when setMode is called with 'shadowing'", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.setMode("shadowing");
      });
      expect(result.current.mode).toBe("shadowing");
    });

    it("should update mode when setMode is called with 'continuous'", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.setMode("shadowing");
      });
      act(() => {
        result.current.setMode("continuous");
      });
      expect(result.current.mode).toBe("continuous");
    });
  });

  describe("shadowingSettings state", () => {
    it("should have default shadowing settings", () => {
      const { result } = renderHook(() => usePracticeStore());
      expect(result.current.shadowingSettings).toEqual({
        pauseDuration: 5,
        repeatCount: 1,
        autoAdvance: true,
      });
    });

    it("should update pauseDuration when updateShadowingSettings is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ pauseDuration: 10 });
      });
      expect(result.current.shadowingSettings.pauseDuration).toBe(10);
      expect(result.current.shadowingSettings.repeatCount).toBe(1);
      expect(result.current.shadowingSettings.autoAdvance).toBe(true);
    });

    it("should update repeatCount when updateShadowingSettings is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ repeatCount: 5 });
      });
      expect(result.current.shadowingSettings.repeatCount).toBe(5);
    });

    it("should update autoAdvance when updateShadowingSettings is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ autoAdvance: false });
      });
      expect(result.current.shadowingSettings.autoAdvance).toBe(false);
    });

    it("should update multiple settings at once", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({
          pauseDuration: 15,
          repeatCount: 3,
          autoAdvance: false,
        });
      });
      expect(result.current.shadowingSettings).toEqual({
        pauseDuration: 15,
        repeatCount: 3,
        autoAdvance: false,
      });
    });

    it("should reject invalid pauseDuration (below 1)", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ pauseDuration: 0 });
      });
      expect(result.current.shadowingSettings.pauseDuration).toBe(5);
    });

    it("should reject invalid pauseDuration (above 30)", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ pauseDuration: 31 });
      });
      expect(result.current.shadowingSettings.pauseDuration).toBe(5);
    });

    it("should reject invalid repeatCount (below 1)", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ repeatCount: 0 });
      });
      expect(result.current.shadowingSettings.repeatCount).toBe(1);
    });

    it("should reject invalid repeatCount (above 10)", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ repeatCount: 11 });
      });
      expect(result.current.shadowingSettings.repeatCount).toBe(1);
    });
  });

  describe("currentRepeat state", () => {
    it("should have 0 as the default currentRepeat", () => {
      const { result } = renderHook(() => usePracticeStore());
      expect(result.current.currentRepeat).toBe(0);
    });

    it("should increment currentRepeat when incrementRepeat is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.incrementRepeat();
      });
      expect(result.current.currentRepeat).toBe(1);
    });

    it("should reset currentRepeat when resetRepeat is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.incrementRepeat();
        result.current.incrementRepeat();
      });
      expect(result.current.currentRepeat).toBe(2);
      act(() => {
        result.current.resetRepeat();
      });
      expect(result.current.currentRepeat).toBe(0);
    });
  });

  describe("isPaused state (shadowing pause)", () => {
    it("should have false as the default isPaused", () => {
      const { result } = renderHook(() => usePracticeStore());
      expect(result.current.isShadowingPaused).toBe(false);
    });

    it("should set isPaused to true when startPause is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.startPause();
      });
      expect(result.current.isShadowingPaused).toBe(true);
    });

    it("should set isPaused to false when skipPause is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.startPause();
      });
      expect(result.current.isShadowingPaused).toBe(true);
      act(() => {
        result.current.skipPause();
      });
      expect(result.current.isShadowingPaused).toBe(false);
    });
  });

  describe("remainingTime state", () => {
    it("should have 0 as the default remainingTime", () => {
      const { result } = renderHook(() => usePracticeStore());
      expect(result.current.remainingTime).toBe(0);
    });

    it("should set remainingTime when startPause is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.updateShadowingSettings({ pauseDuration: 10 });
      });
      act(() => {
        result.current.startPause();
      });
      expect(result.current.remainingTime).toBe(10);
    });

    it("should update remainingTime when setRemainingTime is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.setRemainingTime(15);
      });
      expect(result.current.remainingTime).toBe(15);
    });

    it("should reset remainingTime to 0 when skipPause is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.startPause();
      });
      act(() => {
        result.current.skipPause();
      });
      expect(result.current.remainingTime).toBe(0);
    });
  });

  describe("clearSession with mode state", () => {
    it("should reset mode-related state when clearSession is called", () => {
      const { result } = renderHook(() => usePracticeStore());
      act(() => {
        result.current.setMode("shadowing");
        result.current.incrementRepeat();
        result.current.startPause();
      });
      expect(result.current.mode).toBe("shadowing");
      expect(result.current.currentRepeat).toBe(1);
      expect(result.current.isShadowingPaused).toBe(true);

      act(() => {
        result.current.clearSession();
      });
      expect(result.current.currentRepeat).toBe(0);
      expect(result.current.isShadowingPaused).toBe(false);
      expect(result.current.remainingTime).toBe(0);
      // Mode should persist (user preference)
      expect(result.current.mode).toBe("shadowing");
    });
  });
});

describe("Practice Store - localStorage persistence", () => {
  beforeEach(() => {
    resetStore();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should persist mode to localStorage when setMode is called", () => {
    const { result } = renderHook(() => usePracticeStore());
    act(() => {
      result.current.setMode("shadowing");
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "shadow-tutor:playback-mode",
      "shadowing"
    );
  });

  it("should persist shadowingSettings to localStorage when updateShadowingSettings is called", () => {
    const { result } = renderHook(() => usePracticeStore());
    act(() => {
      result.current.updateShadowingSettings({ pauseDuration: 10 });
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "shadow-tutor:shadowing-settings",
      JSON.stringify({
        pauseDuration: 10,
        repeatCount: 1,
        autoAdvance: true,
      })
    );
  });
});
