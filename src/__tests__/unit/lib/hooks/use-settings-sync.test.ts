import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSettingsSync } from "@/lib/hooks/use-settings-sync";
import { useSettingsStore } from "@/stores/settings-store";
import { usePracticeStore } from "@/stores/practice-store";

// Mock the stores
vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: vi.fn(),
}));

vi.mock("@/stores/practice-store", () => ({
  usePracticeStore: vi.fn(),
}));

describe("useSettingsSync", () => {
  const mockSettingsStore = {
    voice: "nova" as const,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    pauseDuration: 5,
    repeatCount: 1,
    autoAdvance: true,
    isInitialized: true,
    setInitialized: vi.fn(),
  };

  const mockPracticeStore = {
    selectedVoice: "nova" as const,
    playbackSpeed: 1.0,
    volume: 1.0,
    isMuted: false,
    shadowingSettings: {
      pauseDuration: 5,
      repeatCount: 1,
      autoAdvance: true,
    },
    setVoice: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    updateShadowingSettings: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSettingsStore);
    (usePracticeStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockPracticeStore);
  });

  it("should sync voice from settings to practice store", () => {
    const settingsWithDifferentVoice = {
      ...mockSettingsStore,
      voice: "echo" as const,
    };
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(settingsWithDifferentVoice);

    renderHook(() => useSettingsSync());

    expect(mockPracticeStore.setVoice).toHaveBeenCalledWith("echo");
  });

  it("should sync speed from settings to practice store", () => {
    const settingsWithDifferentSpeed = {
      ...mockSettingsStore,
      speed: 1.5,
    };
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(settingsWithDifferentSpeed);

    renderHook(() => useSettingsSync());

    expect(mockPracticeStore.setPlaybackSpeed).toHaveBeenCalledWith(1.5);
  });

  it("should sync volume from settings to practice store", () => {
    const settingsWithDifferentVolume = {
      ...mockSettingsStore,
      volume: 0.5,
    };
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(settingsWithDifferentVolume);

    renderHook(() => useSettingsSync());

    expect(mockPracticeStore.setVolume).toHaveBeenCalledWith(0.5);
  });

  it("should sync shadowing settings from settings to practice store", () => {
    const settingsWithDifferentShadowing = {
      ...mockSettingsStore,
      pauseDuration: 10,
      repeatCount: 3,
      autoAdvance: false,
    };
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(settingsWithDifferentShadowing);

    renderHook(() => useSettingsSync());

    expect(mockPracticeStore.updateShadowingSettings).toHaveBeenCalledWith({
      pauseDuration: 10,
      repeatCount: 3,
      autoAdvance: false,
    });
  });

  it("should not sync when values are the same", () => {
    renderHook(() => useSettingsSync());

    // No calls should be made when values match
    expect(mockPracticeStore.setVoice).not.toHaveBeenCalled();
    expect(mockPracticeStore.setPlaybackSpeed).not.toHaveBeenCalled();
    expect(mockPracticeStore.setVolume).not.toHaveBeenCalled();
  });

  it("should mark settings as initialized on mount", () => {
    const uninitializedSettings = {
      ...mockSettingsStore,
      isInitialized: false,
    };
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(uninitializedSettings);

    renderHook(() => useSettingsSync());

    expect(uninitializedSettings.setInitialized).toHaveBeenCalled();
  });
});
