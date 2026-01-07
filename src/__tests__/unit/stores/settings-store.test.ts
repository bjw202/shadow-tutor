import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSettingsStore } from "@/stores/settings-store";
import {
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_VOLUME,
  DEFAULT_PAUSE_DURATION,
  DEFAULT_REPEAT_COUNT,
  DEFAULT_AUTO_ADVANCE,
  MIN_SPEED,
  MAX_SPEED,
  MIN_VOLUME,
  MAX_VOLUME,
  MIN_PAUSE_DURATION,
  MAX_PAUSE_DURATION,
  MIN_REPEAT_COUNT,
  MAX_REPEAT_COUNT,
} from "@/lib/constants/settings";

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

describe("useSettingsStore", () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorageMock.clear();
    vi.clearAllMocks();

    // Reset the store to initial state
    const { result } = renderHook(() => useSettingsStore());
    act(() => {
      result.current.resetToDefaults();
    });
  });

  describe("Initial State", () => {
    it("should have default TTS settings", () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.voice).toBe(DEFAULT_VOICE);
      expect(result.current.speed).toBe(DEFAULT_SPEED);
      expect(result.current.volume).toBe(DEFAULT_VOLUME);
      expect(result.current.isMuted).toBe(false);
    });

    it("should have default shadowing settings", () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.pauseDuration).toBe(DEFAULT_PAUSE_DURATION);
      expect(result.current.repeatCount).toBe(DEFAULT_REPEAT_COUNT);
      expect(result.current.autoAdvance).toBe(DEFAULT_AUTO_ADVANCE);
    });
  });

  describe("Voice Settings", () => {
    it("should set voice", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setVoice("echo");
      });

      expect(result.current.voice).toBe("echo");
    });

    it("should update voice value correctly", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setVoice("shimmer");
      });

      // Verify the voice was updated in the store
      expect(result.current.voice).toBe("shimmer");
    });
  });

  describe("Speed Settings", () => {
    it("should set speed within valid range", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setSpeed(1.5);
      });

      expect(result.current.speed).toBe(1.5);
    });

    it("should clamp speed to minimum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setSpeed(0.1);
      });

      expect(result.current.speed).toBe(MIN_SPEED);
    });

    it("should clamp speed to maximum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setSpeed(3.0);
      });

      expect(result.current.speed).toBe(MAX_SPEED);
    });

    it("should update speed value correctly", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setSpeed(1.25);
      });

      // Verify the speed was updated in the store
      expect(result.current.speed).toBe(1.25);
    });
  });

  describe("Volume Settings", () => {
    it("should set volume within valid range", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it("should clamp volume to minimum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.volume).toBe(MIN_VOLUME);
    });

    it("should clamp volume to maximum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.volume).toBe(MAX_VOLUME);
    });

    it("should set muted state", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.isMuted).toBe(true);
    });

    it("should toggle mute", () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.isMuted).toBe(false);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(true);

      act(() => {
        result.current.toggleMute();
      });

      expect(result.current.isMuted).toBe(false);
    });
  });

  describe("Pause Duration Settings", () => {
    it("should set pause duration within valid range", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setPauseDuration(10);
      });

      expect(result.current.pauseDuration).toBe(10);
    });

    it("should clamp pause duration to minimum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setPauseDuration(0);
      });

      expect(result.current.pauseDuration).toBe(MIN_PAUSE_DURATION);
    });

    it("should clamp pause duration to maximum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setPauseDuration(60);
      });

      expect(result.current.pauseDuration).toBe(MAX_PAUSE_DURATION);
    });
  });

  describe("Repeat Count Settings", () => {
    it("should set repeat count within valid range", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setRepeatCount(5);
      });

      expect(result.current.repeatCount).toBe(5);
    });

    it("should clamp repeat count to minimum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setRepeatCount(0);
      });

      expect(result.current.repeatCount).toBe(MIN_REPEAT_COUNT);
    });

    it("should clamp repeat count to maximum", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setRepeatCount(20);
      });

      expect(result.current.repeatCount).toBe(MAX_REPEAT_COUNT);
    });
  });

  describe("Auto-Advance Settings", () => {
    it("should set auto-advance", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setAutoAdvance(false);
      });

      expect(result.current.autoAdvance).toBe(false);

      act(() => {
        result.current.setAutoAdvance(true);
      });

      expect(result.current.autoAdvance).toBe(true);
    });
  });

  describe("Reset to Defaults", () => {
    it("should reset all settings to defaults", () => {
      const { result } = renderHook(() => useSettingsStore());

      // Change all settings
      act(() => {
        result.current.setVoice("echo");
        result.current.setSpeed(1.5);
        result.current.setVolume(0.5);
        result.current.setMuted(true);
        result.current.setPauseDuration(15);
        result.current.setRepeatCount(5);
        result.current.setAutoAdvance(false);
      });

      // Verify changes
      expect(result.current.voice).toBe("echo");
      expect(result.current.speed).toBe(1.5);

      // Reset
      act(() => {
        result.current.resetToDefaults();
      });

      // Verify defaults
      expect(result.current.voice).toBe(DEFAULT_VOICE);
      expect(result.current.speed).toBe(DEFAULT_SPEED);
      expect(result.current.volume).toBe(DEFAULT_VOLUME);
      expect(result.current.isMuted).toBe(false);
      expect(result.current.pauseDuration).toBe(DEFAULT_PAUSE_DURATION);
      expect(result.current.repeatCount).toBe(DEFAULT_REPEAT_COUNT);
      expect(result.current.autoAdvance).toBe(DEFAULT_AUTO_ADVANCE);
    });
  });

  describe("Initialization", () => {
    it("should mark as initialized after setInitialized is called", () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setInitialized();
      });

      expect(result.current.isInitialized).toBe(true);
    });
  });
});
