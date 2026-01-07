import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePracticeStore } from "@/stores/practice-store";
import type { TextSegment } from "@/types/upload";
import type { VoiceOption, PlaybackState } from "@/types/audio";
import {
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_VOLUME,
} from "@/lib/constants/voices";

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-123"),
});

describe("practice-store", () => {
  const mockSegments: TextSegment[] = [
    { id: "seg-1", text: "Hello world.", startPosition: 0, endPosition: 12 },
    { id: "seg-2", text: "How are you?", startPosition: 13, endPosition: 25 },
    { id: "seg-3", text: "I am fine.", startPosition: 26, endPosition: 36 },
  ];

  beforeEach(() => {
    // Reset store state before each test
    usePracticeStore.getState().clearSession();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = usePracticeStore.getState();

      expect(state.sessionId).toBeNull();
      expect(state.segments).toEqual([]);
      expect(state.currentSegmentIndex).toBe(0);
      expect(state.playbackState).toBe("idle");
      expect(state.playbackSpeed).toBe(DEFAULT_SPEED);
      expect(state.volume).toBe(DEFAULT_VOLUME);
      expect(state.selectedVoice).toBe(DEFAULT_VOICE);
      expect(state.audioCache).toBeInstanceOf(Map);
      expect(state.audioCache.size).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe("initSession", () => {
    it("should initialize session with segments", () => {
      usePracticeStore.getState().initSession(mockSegments);

      const state = usePracticeStore.getState();
      expect(state.sessionId).toBe("test-uuid-123");
      expect(state.segments).toEqual(mockSegments);
      expect(state.currentSegmentIndex).toBe(0);
      expect(state.playbackState).toBe("idle");
      expect(state.audioCache.size).toBe(0);
      expect(state.error).toBeNull();
    });

    it("should generate new sessionId on each init", () => {
      usePracticeStore.getState().initSession(mockSegments);
      expect(usePracticeStore.getState().sessionId).toBe("test-uuid-123");
    });

    it("should reset currentSegmentIndex to 0", () => {
      usePracticeStore.getState().initSession(mockSegments);
      usePracticeStore.getState().goToSegment(2);
      usePracticeStore.getState().initSession(mockSegments);

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(0);
    });

    it("should clear audio cache on init", () => {
      usePracticeStore.getState().initSession(mockSegments);
      usePracticeStore.getState().cacheAudio("seg-1", "audio-data");
      usePracticeStore.getState().initSession(mockSegments);

      expect(usePracticeStore.getState().audioCache.size).toBe(0);
    });

    it("should clear error on init", () => {
      usePracticeStore.getState().setError("Previous error");
      usePracticeStore.getState().initSession(mockSegments);

      expect(usePracticeStore.getState().error).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("should reset all state to initial values", () => {
      // Set up some state
      usePracticeStore.getState().initSession(mockSegments);
      usePracticeStore.getState().goToSegment(1);
      usePracticeStore.getState().setPlaybackState("playing");
      usePracticeStore.getState().setPlaybackSpeed(1.5);
      usePracticeStore.getState().setVolume(0.5);
      usePracticeStore.getState().setVoice("alloy");
      usePracticeStore.getState().cacheAudio("seg-1", "audio-data");
      usePracticeStore.getState().setError("Some error");

      // Clear session
      usePracticeStore.getState().clearSession();

      const state = usePracticeStore.getState();
      expect(state.sessionId).toBeNull();
      expect(state.segments).toEqual([]);
      expect(state.currentSegmentIndex).toBe(0);
      expect(state.playbackState).toBe("idle");
      expect(state.playbackSpeed).toBe(DEFAULT_SPEED);
      expect(state.volume).toBe(DEFAULT_VOLUME);
      expect(state.selectedVoice).toBe(DEFAULT_VOICE);
      expect(state.audioCache.size).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe("play/pause/stop", () => {
    it("should set playbackState to playing", () => {
      usePracticeStore.getState().play();

      expect(usePracticeStore.getState().playbackState).toBe("playing");
    });

    it("should set playbackState to paused", () => {
      usePracticeStore.getState().play();
      usePracticeStore.getState().pause();

      expect(usePracticeStore.getState().playbackState).toBe("paused");
    });

    it("should set playbackState to stopped", () => {
      usePracticeStore.getState().play();
      usePracticeStore.getState().stop();

      expect(usePracticeStore.getState().playbackState).toBe("stopped");
    });
  });

  describe("nextSegment", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession(mockSegments);
    });

    it("should move to next segment", () => {
      usePracticeStore.getState().nextSegment();

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(1);
    });

    it("should move to second next segment", () => {
      usePracticeStore.getState().nextSegment();
      usePracticeStore.getState().nextSegment();

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(2);
    });

    it("should not exceed last segment index", () => {
      usePracticeStore.getState().nextSegment();
      usePracticeStore.getState().nextSegment();
      usePracticeStore.getState().nextSegment();
      usePracticeStore.getState().nextSegment(); // Try to go past the end

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(2);
    });
  });

  describe("previousSegment", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession(mockSegments);
    });

    it("should move to previous segment", () => {
      usePracticeStore.getState().goToSegment(2);
      usePracticeStore.getState().previousSegment();

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(1);
    });

    it("should not go below 0", () => {
      usePracticeStore.getState().previousSegment();

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(0);
    });
  });

  describe("goToSegment", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession(mockSegments);
    });

    it("should go to specific segment", () => {
      usePracticeStore.getState().goToSegment(2);

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(2);
    });

    it("should not accept negative index", () => {
      usePracticeStore.getState().goToSegment(-1);

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(0);
    });

    it("should not exceed segments length", () => {
      usePracticeStore.getState().goToSegment(10);

      expect(usePracticeStore.getState().currentSegmentIndex).toBe(0);
    });

    it("should accept index at boundary", () => {
      usePracticeStore.getState().goToSegment(0);
      expect(usePracticeStore.getState().currentSegmentIndex).toBe(0);

      usePracticeStore.getState().goToSegment(2);
      expect(usePracticeStore.getState().currentSegmentIndex).toBe(2);
    });
  });

  describe("setPlaybackSpeed", () => {
    it("should set playback speed within range", () => {
      usePracticeStore.getState().setPlaybackSpeed(1.5);

      expect(usePracticeStore.getState().playbackSpeed).toBe(1.5);
    });

    it("should accept minimum speed (0.5)", () => {
      usePracticeStore.getState().setPlaybackSpeed(0.5);

      expect(usePracticeStore.getState().playbackSpeed).toBe(0.5);
    });

    it("should accept maximum speed (2.0)", () => {
      usePracticeStore.getState().setPlaybackSpeed(2.0);

      expect(usePracticeStore.getState().playbackSpeed).toBe(2.0);
    });

    it("should reject speed below minimum", () => {
      usePracticeStore.getState().setPlaybackSpeed(0.3);

      expect(usePracticeStore.getState().playbackSpeed).toBe(DEFAULT_SPEED);
    });

    it("should reject speed above maximum", () => {
      usePracticeStore.getState().setPlaybackSpeed(2.5);

      expect(usePracticeStore.getState().playbackSpeed).toBe(DEFAULT_SPEED);
    });
  });

  describe("setVolume", () => {
    it("should set volume within range", () => {
      usePracticeStore.getState().setVolume(0.5);

      expect(usePracticeStore.getState().volume).toBe(0.5);
    });

    it("should accept minimum volume (0)", () => {
      usePracticeStore.getState().setVolume(0);

      expect(usePracticeStore.getState().volume).toBe(0);
    });

    it("should accept maximum volume (1)", () => {
      usePracticeStore.getState().setVolume(1);

      expect(usePracticeStore.getState().volume).toBe(1);
    });

    it("should reject volume below minimum", () => {
      usePracticeStore.getState().setVolume(-0.5);

      expect(usePracticeStore.getState().volume).toBe(DEFAULT_VOLUME);
    });

    it("should reject volume above maximum", () => {
      usePracticeStore.getState().setVolume(1.5);

      expect(usePracticeStore.getState().volume).toBe(DEFAULT_VOLUME);
    });
  });

  describe("setVoice", () => {
    it("should set voice option", () => {
      usePracticeStore.getState().setVoice("alloy");

      expect(usePracticeStore.getState().selectedVoice).toBe("alloy");
    });

    it("should clear audio cache when voice changes", () => {
      usePracticeStore.getState().initSession(mockSegments);
      usePracticeStore.getState().cacheAudio("seg-1", "audio-data");

      usePracticeStore.getState().setVoice("echo");

      expect(usePracticeStore.getState().audioCache.size).toBe(0);
    });

    it("should update all voice options", () => {
      const voices: VoiceOption[] = [
        "alloy",
        "echo",
        "fable",
        "onyx",
        "nova",
        "shimmer",
      ];

      for (const voice of voices) {
        usePracticeStore.getState().setVoice(voice);
        expect(usePracticeStore.getState().selectedVoice).toBe(voice);
      }
    });
  });

  describe("setPlaybackState", () => {
    it("should set playback state to loading", () => {
      usePracticeStore.getState().setPlaybackState("loading");

      expect(usePracticeStore.getState().playbackState).toBe("loading");
    });

    it("should set any valid playback state", () => {
      const states: PlaybackState[] = [
        "idle",
        "loading",
        "playing",
        "paused",
        "stopped",
      ];

      for (const state of states) {
        usePracticeStore.getState().setPlaybackState(state);
        expect(usePracticeStore.getState().playbackState).toBe(state);
      }
    });
  });

  describe("cacheAudio", () => {
    beforeEach(() => {
      usePracticeStore.getState().initSession(mockSegments);
    });

    it("should cache audio data for segment", () => {
      usePracticeStore.getState().cacheAudio("seg-1", "base64-audio-data");

      const cache = usePracticeStore.getState().audioCache;
      expect(cache.get("seg-1")).toBe("base64-audio-data");
    });

    it("should cache multiple segments", () => {
      usePracticeStore.getState().cacheAudio("seg-1", "audio-1");
      usePracticeStore.getState().cacheAudio("seg-2", "audio-2");

      const cache = usePracticeStore.getState().audioCache;
      expect(cache.size).toBe(2);
      expect(cache.get("seg-1")).toBe("audio-1");
      expect(cache.get("seg-2")).toBe("audio-2");
    });

    it("should overwrite existing cache for same segment", () => {
      usePracticeStore.getState().cacheAudio("seg-1", "old-audio");
      usePracticeStore.getState().cacheAudio("seg-1", "new-audio");

      const cache = usePracticeStore.getState().audioCache;
      expect(cache.get("seg-1")).toBe("new-audio");
      expect(cache.size).toBe(1);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      usePracticeStore.getState().setError("Something went wrong");

      expect(usePracticeStore.getState().error).toBe("Something went wrong");
    });

    it("should clear error with null", () => {
      usePracticeStore.getState().setError("An error");
      usePracticeStore.getState().setError(null);

      expect(usePracticeStore.getState().error).toBeNull();
    });
  });
});
