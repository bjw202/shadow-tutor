import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AudioPlayer } from "@/components/practice/audio-player";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";

// Mock the useAudioPlayer hook
vi.mock("@/lib/hooks/use-audio-player", () => ({
  useAudioPlayer: vi.fn(),
}));

const mockUseAudioPlayer = useAudioPlayer as Mock;

describe("AudioPlayer", () => {
  const defaultMockReturn = {
    isPlaying: false,
    isLoading: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    error: null,
    currentSegment: { id: "1", text: "Test segment text" },
    currentIndex: 0,
    totalSegments: 3,
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    togglePlayPause: vi.fn(),
    nextSegment: vi.fn(),
    previousSegment: vi.fn(),
    goToSegment: vi.fn(),
    setPlaybackRate: vi.fn(),
    setVolume: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAudioPlayer.mockReturnValue(defaultMockReturn);
  });

  describe("rendering", () => {
    it("should render control buttons", () => {
      render(<AudioPlayer />);

      expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /previous segment/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /next segment/i })
      ).toBeInTheDocument();
    });

    it("should display current segment text", () => {
      render(<AudioPlayer />);

      expect(screen.getByText("Test segment text")).toBeInTheDocument();
    });

    it("should display progress indicator", () => {
      render(<AudioPlayer />);

      expect(screen.getByText("Segment 1 of 3")).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      const { container } = render(<AudioPlayer className="custom-class" />);

      // Find the Card element (first child of container)
      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("loading state", () => {
    it("should show loading spinner when loading", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<AudioPlayer />);

      // Loading spinner should be present (Loader2 icon with animate-spin class)
      const playButton = screen.getByRole("button", { name: /play/i });
      const spinner = playButton.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should disable play button when loading", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      render(<AudioPlayer />);

      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
    });
  });

  describe("playback controls", () => {
    it("should call togglePlayPause when play button clicked", async () => {
      const user = userEvent.setup();
      const togglePlayPause = vi.fn();
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        togglePlayPause,
      });

      render(<AudioPlayer />);

      await user.click(screen.getByRole("button", { name: /play/i }));

      expect(togglePlayPause).toHaveBeenCalled();
    });

    it("should show pause button when playing", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        isPlaying: true,
      });

      render(<AudioPlayer />);

      expect(
        screen.getByRole("button", { name: /pause/i })
      ).toBeInTheDocument();
    });

    it("should call stop when stop button clicked", async () => {
      const user = userEvent.setup();
      const stop = vi.fn();
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        stop,
      });

      render(<AudioPlayer />);

      await user.click(screen.getByRole("button", { name: /stop/i }));

      expect(stop).toHaveBeenCalled();
    });
  });

  describe("navigation controls", () => {
    it("should disable previous button on first segment", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentIndex: 0,
      });

      render(<AudioPlayer />);

      expect(
        screen.getByRole("button", { name: /previous segment/i })
      ).toBeDisabled();
    });

    it("should disable next button on last segment", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentIndex: 2,
        totalSegments: 3,
      });

      render(<AudioPlayer />);

      expect(
        screen.getByRole("button", { name: /next segment/i })
      ).toBeDisabled();
    });

    it("should call nextSegment when next button clicked", async () => {
      const user = userEvent.setup();
      const nextSegment = vi.fn();
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentIndex: 0,
        totalSegments: 3,
        nextSegment,
      });

      render(<AudioPlayer />);

      await user.click(screen.getByRole("button", { name: /next segment/i }));

      expect(nextSegment).toHaveBeenCalled();
    });

    it("should call previousSegment when previous button clicked", async () => {
      const user = userEvent.setup();
      const previousSegment = vi.fn();
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentIndex: 1,
        totalSegments: 3,
        previousSegment,
      });

      render(<AudioPlayer />);

      await user.click(
        screen.getByRole("button", { name: /previous segment/i })
      );

      expect(previousSegment).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should display error message when error occurs", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        error: "Failed to load audio",
        currentSegment: null,
      });

      render(<AudioPlayer />);

      expect(screen.getByText("Failed to load audio")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("should show empty message when no segment selected", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentSegment: null,
        totalSegments: 0,
      });

      render(<AudioPlayer />);

      expect(screen.getByText("No segment selected")).toBeInTheDocument();
    });

    it("should disable all buttons when no segments available", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentSegment: null,
        totalSegments: 0,
      });

      render(<AudioPlayer />);

      expect(screen.getByRole("button", { name: /play/i })).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /previous segment/i })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /next segment/i })
      ).toBeDisabled();
    });

    it("should not show progress indicator when no segments", () => {
      mockUseAudioPlayer.mockReturnValue({
        ...defaultMockReturn,
        currentSegment: null,
        totalSegments: 0,
      });

      render(<AudioPlayer />);

      expect(screen.queryByText(/Segment \d+ of \d+/)).not.toBeInTheDocument();
    });
  });
});
