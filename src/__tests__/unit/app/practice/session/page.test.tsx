import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import PracticeSessionPage from "@/app/practice/session/page";
import { usePracticeStore } from "@/stores/practice-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useSettingsSync } from "@/lib/hooks/use-settings-sync";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockSetPlaybackSpeed = vi.fn();
const mockSetSpeed = vi.fn();
const mockSetVoicePractice = vi.fn();
const mockSetVoiceSettings = vi.fn();

// Mock the practice store
vi.mock("@/stores/practice-store", () => ({
  usePracticeStore: Object.assign(vi.fn(), {
    getState: vi.fn(() => ({
      setVoice: mockSetVoicePractice,
      setPlaybackSpeed: mockSetPlaybackSpeed,
    })),
  }),
}));

// Mock the settings store
vi.mock("@/stores/settings-store", () => ({
  useSettingsStore: Object.assign(vi.fn(), {
    getState: vi.fn(() => ({
      setSpeed: mockSetSpeed,
      setVoice: mockSetVoiceSettings,
    })),
  }),
}));

// Mock the useSettingsSync hook to track if it's called
vi.mock("@/lib/hooks/use-settings-sync", () => ({
  useSettingsSync: vi.fn(),
}));

// Mock practice components
vi.mock("@/components/practice", () => ({
  AudioPlayer: () => <div data-testid="audio-player">Audio Player</div>,
  SegmentList: () => <div data-testid="segment-list">Segment List</div>,
  PlaybackSpeed: ({ onChange }: { onChange: (speed: number) => void }) => (
    <div data-testid="playback-speed">
      <button data-testid="speed-button" onClick={() => onChange(1.5)}>
        1.5x
      </button>
    </div>
  ),
  VoiceSelector: ({ onChange }: { onChange: (voice: string) => void }) => (
    <div data-testid="voice-selector">
      <button data-testid="voice-button" onClick={() => onChange("alloy")}>
        Alloy
      </button>
    </div>
  ),
}));

const mockUsePracticeStore = usePracticeStore as unknown as Mock;
const mockUseSettingsSync = useSettingsSync as Mock;

describe("PracticeSessionPage", () => {
  const defaultStoreMock = {
    segments: [
      { id: "1", text: "Test segment 1" },
      { id: "2", text: "Test segment 2" },
    ],
    sessionId: "test-session-id",
    playbackSpeed: 1.0,
    selectedVoice: "nova",
    currentSegmentIndex: 0,
    clearSession: vi.fn(),
    setPlaybackSpeed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePracticeStore.mockReturnValue(defaultStoreMock);
  });

  describe("settings synchronization", () => {
    it("should call useSettingsSync hook when page renders", () => {
      render(<PracticeSessionPage />);

      expect(mockUseSettingsSync).toHaveBeenCalled();
    });

    it("should sync settings before rendering practice components", () => {
      // useSettingsSync is called at the top of the component,
      // ensuring settings are synced before any practice logic runs
      render(<PracticeSessionPage />);

      // Verify useSettingsSync is called exactly once per render
      expect(mockUseSettingsSync).toHaveBeenCalledTimes(1);
    });
  });

  describe("rendering", () => {
    it("should render nothing when no session", () => {
      mockUsePracticeStore.mockReturnValue({
        ...defaultStoreMock,
        sessionId: null,
        segments: [],
      });

      const { container } = render(<PracticeSessionPage />);

      expect(container.firstChild).toBeNull();
    });

    it("should render practice components when session exists", () => {
      render(<PracticeSessionPage />);

      expect(document.querySelector("[data-testid='audio-player']")).toBeInTheDocument();
      expect(document.querySelector("[data-testid='segment-list']")).toBeInTheDocument();
    });
  });

  describe("SPEC-REPEAT-001-FIX: settings change synchronization", () => {
    it("should update both practice-store and settings-store when speed changes", () => {
      render(<PracticeSessionPage />);

      const speedButton = document.querySelector("[data-testid='speed-button']");
      expect(speedButton).toBeInTheDocument();

      fireEvent.click(speedButton!);

      // Both stores should be updated
      expect(mockSetPlaybackSpeed).toHaveBeenCalledWith(1.5);
      expect(mockSetSpeed).toHaveBeenCalledWith(1.5);
    });

    it("should update both practice-store and settings-store when voice changes", () => {
      render(<PracticeSessionPage />);

      const voiceButton = document.querySelector("[data-testid='voice-button']");
      expect(voiceButton).toBeInTheDocument();

      fireEvent.click(voiceButton!);

      // Both stores should be updated
      expect(mockSetVoicePractice).toHaveBeenCalledWith("alloy");
      expect(mockSetVoiceSettings).toHaveBeenCalledWith("alloy");
    });
  });
});
