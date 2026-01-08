import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePracticeStore } from "@/stores/practice-store";

// Mock the TTS API module
vi.mock("@/lib/api/tts", () => ({
  generateSpeech: vi.fn(),
  base64ToAudioUrl: vi.fn((base64: string) => `data:audio/mpeg;base64,${base64}`),
}));

// Import mocked functions after vi.mock
import { generateSpeech } from "@/lib/api/tts";

// Mock Audio Element
class MockAudio {
  src = "";
  currentTime = 0;
  duration = 60;
  playbackRate = 1;
  volume = 1;
  paused = true;

  private eventListeners: Map<string, Set<EventListener>> = new Map();

  play = vi.fn().mockImplementation(() => {
    this.paused = false;
    return Promise.resolve();
  });

  pause = vi.fn().mockImplementation(() => {
    this.paused = true;
  });

  addEventListener = vi.fn((event: string, handler: EventListener) => {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  });

  removeEventListener = vi.fn((event: string, handler: EventListener) => {
    this.eventListeners.get(event)?.delete(handler);
  });

  // Helper to trigger events in tests
  _triggerEvent(event: string, data?: unknown) {
    this.eventListeners.get(event)?.forEach((handler) => handler(data as Event));
  }
}

// Store reference to mock audio instances
let mockAudioInstance: MockAudio;

// Replace global Audio constructor
const originalAudio = global.Audio;

beforeEach(() => {
  mockAudioInstance = new MockAudio();
  // Create a proper constructor mock
  const MockAudioConstructor = function(this: MockAudio) {
    Object.assign(this, mockAudioInstance);
    return mockAudioInstance;
  } as unknown as typeof Audio;
  global.Audio = MockAudioConstructor;

  // Reset store to initial state
  usePracticeStore.setState({
    sessionId: null,
    segments: [],
    currentSegmentIndex: 0,
    playbackState: "idle",
    playbackSpeed: 1.0,
    volume: 1.0,
    selectedVoice: "nova",
    audioCache: new Map(),
    error: null,
  });

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  global.Audio = originalAudio;
});

// Import the hook after mocks are set up
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";

describe("useAudioPlayer", () => {
  describe("initial state", () => {
    it("should return initial state values", () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentTime).toBe(0);
      expect(result.current.duration).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.currentSegment).toBeNull();
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalSegments).toBe(0);
    });

    it("should expose all required action functions", () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(typeof result.current.play).toBe("function");
      expect(typeof result.current.pause).toBe("function");
      expect(typeof result.current.stop).toBe("function");
      expect(typeof result.current.togglePlayPause).toBe("function");
      expect(typeof result.current.nextSegment).toBe("function");
      expect(typeof result.current.previousSegment).toBe("function");
      expect(typeof result.current.goToSegment).toBe("function");
      expect(typeof result.current.setPlaybackRate).toBe("function");
      expect(typeof result.current.setVolume).toBe("function");
      expect(typeof result.current.seekTo).toBe("function");
    });

    it("should return current segment when segments exist", () => {
      // Initialize store with segments
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
        { id: "seg-2", text: "Goodbye world", startPosition: 12, endPosition: 25 },
      ]);

      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.currentSegment).toEqual({ id: "seg-1", text: "Hello world" });
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.totalSegments).toBe(2);
    });
  });

  describe("play()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
        { id: "seg-2", text: "Goodbye world", startPosition: 12, endPosition: 25 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should generate TTS and play audio for current segment", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      // SPEC-PLAYBACK-001-FIX: speed should NOT be passed to generateSpeech
      expect(generateSpeech).toHaveBeenCalledWith({
        text: "Hello world",
        voice: "nova",
      });
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it("should set isLoading to true while generating speech", async () => {
      let resolvePromise!: (value: { audioData: string; contentType: string }) => void;
      vi.mocked(generateSpeech).mockImplementation(() => new Promise((resolve) => {
        resolvePromise = resolve;
      }));

      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.play();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolvePromise!({ audioData: "mock-data", contentType: "audio/mpeg" });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should set isPlaying to true after audio starts", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it("should cache audio data after generation", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      const cache = usePracticeStore.getState().audioCache;
      expect(cache.get("seg-1")).toBe("mock-base64-audio-data");
    });

    it("should use cached audio data if available", async () => {
      // Pre-populate cache
      usePracticeStore.getState().cacheAudio("seg-1", "cached-audio-data");

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(generateSpeech).not.toHaveBeenCalled();
      expect(mockAudioInstance.src).toBe("data:audio/mpeg;base64,cached-audio-data");
    });

    it("should resume from pause when audio was paused", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      // Play first
      await act(async () => {
        await result.current.play();
      });

      // Pause
      act(() => {
        result.current.pause();
      });

      // Clear the mock to check if play is called again
      vi.clearAllMocks();

      // Resume
      await act(async () => {
        await result.current.play();
      });

      // Should not call generateSpeech again, just resume
      expect(generateSpeech).not.toHaveBeenCalled();
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it("should do nothing if no current segment exists", async () => {
      usePracticeStore.setState({ segments: [], currentSegmentIndex: 0 });

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(generateSpeech).not.toHaveBeenCalled();
      expect(mockAudioInstance.play).not.toHaveBeenCalled();
    });

    it("should set error if text is empty", async () => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "   ", startPosition: 0, endPosition: 3 },
      ]);

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.error).toBe("No text to play");
    });

    it("should handle TTS API errors gracefully", async () => {
      vi.mocked(generateSpeech).mockRejectedValue(new Error("API rate limited"));

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.error).toBe("API rate limited");
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("pause()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should pause the audio", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      act(() => {
        result.current.pause();
      });

      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(result.current.isPaused).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("stop()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should stop audio and reset time to 0", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      // Simulate some playback progress
      mockAudioInstance.currentTime = 30;

      act(() => {
        result.current.stop();
      });

      expect(mockAudioInstance.pause).toHaveBeenCalled();
      expect(mockAudioInstance.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe("togglePlayPause()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should play when not playing", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it("should pause when playing", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      await act(async () => {
        await result.current.togglePlayPause();
      });

      expect(result.current.isPaused).toBe(true);
    });
  });

  describe("nextSegment()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "First segment", startPosition: 0, endPosition: 13 },
        { id: "seg-2", text: "Second segment", startPosition: 14, endPosition: 28 },
        { id: "seg-3", text: "Third segment", startPosition: 29, endPosition: 42 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should move to next segment and auto-play", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.currentIndex).toBe(0);

      await act(async () => {
        await result.current.nextSegment();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentSegment?.text).toBe("Second segment");
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it("should not exceed last segment", async () => {
      usePracticeStore.setState({ currentSegmentIndex: 2 });

      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.nextSegment();
      });

      expect(result.current.currentIndex).toBe(2);
    });

    it("should stop current audio before moving to next", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      await act(async () => {
        await result.current.nextSegment();
      });

      // pause should be called (from stop())
      expect(mockAudioInstance.pause).toHaveBeenCalled();
    });
  });

  describe("previousSegment()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "First segment", startPosition: 0, endPosition: 13 },
        { id: "seg-2", text: "Second segment", startPosition: 14, endPosition: 28 },
        { id: "seg-3", text: "Third segment", startPosition: 29, endPosition: 42 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should move to previous segment and auto-play", async () => {
      usePracticeStore.setState({ currentSegmentIndex: 2 });

      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.currentIndex).toBe(2);

      await act(async () => {
        await result.current.previousSegment();
      });

      expect(result.current.currentIndex).toBe(1);
      expect(result.current.currentSegment?.text).toBe("Second segment");
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it("should not go below first segment", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      expect(result.current.currentIndex).toBe(0);

      await act(async () => {
        await result.current.previousSegment();
      });

      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe("goToSegment()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "First segment", startPosition: 0, endPosition: 13 },
        { id: "seg-2", text: "Second segment", startPosition: 14, endPosition: 28 },
        { id: "seg-3", text: "Third segment", startPosition: 29, endPosition: 42 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should go to specific segment and auto-play", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.goToSegment(2);
      });

      expect(result.current.currentIndex).toBe(2);
      expect(result.current.currentSegment?.text).toBe("Third segment");
      expect(mockAudioInstance.play).toHaveBeenCalled();
    });

    it("should ignore invalid positive index", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.goToSegment(10);
      });

      expect(result.current.currentIndex).toBe(0);
    });

    it("should ignore negative index", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.goToSegment(-1);
      });

      expect(result.current.currentIndex).toBe(0);
    });
  });

  describe("setPlaybackRate()", () => {
    it("should update playback speed in store", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.setPlaybackRate(1.5);
      });

      expect(usePracticeStore.getState().playbackSpeed).toBe(1.5);
    });

    it("should update audio element playback rate", async () => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });

      const { result } = renderHook(() => useAudioPlayer());

      // Play to initialize audio element
      await act(async () => {
        await result.current.play();
      });

      act(() => {
        result.current.setPlaybackRate(0.75);
      });

      // Re-render to apply effect
      await waitFor(() => {
        expect(mockAudioInstance.playbackRate).toBe(0.75);
      });
    });
  });

  describe("setVolume()", () => {
    it("should update volume in store", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(usePracticeStore.getState().volume).toBe(0.5);
    });

    it("should update audio element volume", async () => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });

      const { result } = renderHook(() => useAudioPlayer());

      // Play to initialize audio element
      await act(async () => {
        await result.current.play();
      });

      act(() => {
        result.current.setVolume(0.3);
      });

      // Re-render to apply effect
      await waitFor(() => {
        expect(mockAudioInstance.volume).toBe(0.3);
      });
    });
  });

  describe("audio event handling", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should update currentTime on timeupdate event", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      act(() => {
        mockAudioInstance.currentTime = 15;
        mockAudioInstance._triggerEvent("timeupdate");
      });

      await waitFor(() => {
        expect(result.current.currentTime).toBe(15);
      });
    });

    it("should update duration on durationchange event", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      act(() => {
        mockAudioInstance.duration = 120;
        mockAudioInstance._triggerEvent("durationchange");
      });

      await waitFor(() => {
        expect(result.current.duration).toBe(120);
      });
    });

    it("should stop playback on ended event", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        mockAudioInstance._triggerEvent("ended");
      });

      await waitFor(() => {
        expect(result.current.isPlaying).toBe(false);
      });
    });

    it("should set error on audio error event", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      act(() => {
        mockAudioInstance._triggerEvent("error");
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Failed to play audio");
      });
    });
  });

  describe("seekTo()", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    it("should seek to specific time position", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      act(() => {
        result.current.seekTo(30);
      });

      expect(mockAudioInstance.currentTime).toBe(30);
    });

    it("should not seek to negative time", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      mockAudioInstance.currentTime = 10;

      act(() => {
        result.current.seekTo(-5);
      });

      expect(mockAudioInstance.currentTime).toBe(0);
    });

    it("should not seek beyond duration", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      mockAudioInstance.duration = 60;

      act(() => {
        result.current.seekTo(100);
      });

      expect(mockAudioInstance.currentTime).toBe(60);
    });

    it("should clamp time to valid range", async () => {
      const { result } = renderHook(() => useAudioPlayer());

      await act(async () => {
        await result.current.play();
      });

      mockAudioInstance.duration = 120;

      act(() => {
        result.current.seekTo(45);
      });

      expect(mockAudioInstance.currentTime).toBe(45);
    });

    it("should handle seek when duration is 0 (no audio loaded)", () => {
      const { result } = renderHook(() => useAudioPlayer());

      // When duration is 0, seekTo should clamp to 0
      mockAudioInstance.duration = 0;

      act(() => {
        result.current.seekTo(30);
      });

      // Should clamp to 0 since duration is 0
      expect(mockAudioInstance.currentTime).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("should remove event listeners on unmount", async () => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      const { unmount } = renderHook(() => useAudioPlayer());

      unmount();

      expect(mockAudioInstance.removeEventListener).toHaveBeenCalledWith("timeupdate", expect.any(Function));
      expect(mockAudioInstance.removeEventListener).toHaveBeenCalledWith("durationchange", expect.any(Function));
      expect(mockAudioInstance.removeEventListener).toHaveBeenCalledWith("ended", expect.any(Function));
      expect(mockAudioInstance.removeEventListener).toHaveBeenCalledWith("error", expect.any(Function));
    });
  });

  // SPEC-PLAYBACK-001-FIX: Speed parameter should not be passed to TTS API
  describe("SPEC-PLAYBACK-001-FIX: TTS API speed handling", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession([
        { id: "seg-1", text: "Hello world", startPosition: 0, endPosition: 11 },
      ]);

      vi.mocked(generateSpeech).mockResolvedValue({
        audioData: "mock-base64-audio-data",
        contentType: "audio/mpeg",
      });
    });

    describe("UB-002: System must not pass user speed to TTS API", () => {
      it("should NOT pass speed parameter to generateSpeech when playbackSpeed is 1.5", async () => {
        usePracticeStore.setState({ playbackSpeed: 1.5 });

        const { result } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        // Should be called WITHOUT speed parameter
        expect(generateSpeech).toHaveBeenCalledWith({
          text: "Hello world",
          voice: "nova",
          // speed should NOT be included
        });

        // Verify speed is NOT in the call
        const callArgs = vi.mocked(generateSpeech).mock.calls[0][0];
        expect(callArgs).not.toHaveProperty("speed");
      });

      it("should NOT pass speed parameter to generateSpeech when playbackSpeed is 0.5", async () => {
        usePracticeStore.setState({ playbackSpeed: 0.5 });

        const { result } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        const callArgs = vi.mocked(generateSpeech).mock.calls[0][0];
        expect(callArgs).not.toHaveProperty("speed");
      });

      it("should NOT pass speed parameter to generateSpeech when playbackSpeed is 2.0", async () => {
        usePracticeStore.setState({ playbackSpeed: 2.0 });

        const { result } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        const callArgs = vi.mocked(generateSpeech).mock.calls[0][0];
        expect(callArgs).not.toHaveProperty("speed");
      });
    });

    describe("UR-002: Speed must be applied only via playbackRate", () => {
      it("should apply playbackSpeed to audio element playbackRate, not TTS API", async () => {
        usePracticeStore.setState({ playbackSpeed: 1.5 });

        const { result } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        // TTS API should NOT receive speed
        const callArgs = vi.mocked(generateSpeech).mock.calls[0][0];
        expect(callArgs).not.toHaveProperty("speed");

        // Audio element should have playbackRate set
        expect(mockAudioInstance.playbackRate).toBe(1.5);
      });
    });

    describe("SD-002: Cache reuse regardless of speed", () => {
      it("should reuse cached audio when playing same segment at different speed", async () => {
        // First play at 1.0x speed
        usePracticeStore.setState({ playbackSpeed: 1.0 });
        const { result, rerender } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        expect(generateSpeech).toHaveBeenCalledTimes(1);
        const cache = usePracticeStore.getState().audioCache;
        expect(cache.get("seg-1")).toBe("mock-base64-audio-data");

        // Clear mocks
        vi.clearAllMocks();

        // Change speed to 1.5x and stop/play again
        act(() => {
          result.current.stop();
        });

        usePracticeStore.setState({ playbackSpeed: 1.5 });
        rerender();

        await act(async () => {
          await result.current.play();
        });

        // Should NOT call generateSpeech again - should use cache
        expect(generateSpeech).not.toHaveBeenCalled();
        // But playbackRate should be updated
        expect(mockAudioInstance.playbackRate).toBe(1.5);
      });
    });

    describe("UB-003: System must not regenerate audio on speed change", () => {
      it("should not call generateSpeech when speed changes during playback", async () => {
        const { result } = renderHook(() => useAudioPlayer());

        await act(async () => {
          await result.current.play();
        });

        expect(generateSpeech).toHaveBeenCalledTimes(1);

        // Clear mocks
        vi.clearAllMocks();

        // Change playback speed
        act(() => {
          result.current.setPlaybackRate(1.5);
        });

        // Should NOT call generateSpeech again
        expect(generateSpeech).not.toHaveBeenCalled();

        // Only playbackRate should be updated
        await waitFor(() => {
          expect(mockAudioInstance.playbackRate).toBe(1.5);
        });
      });
    });
  });
});
