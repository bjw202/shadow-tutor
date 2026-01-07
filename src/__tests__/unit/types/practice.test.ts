import { describe, it, expect } from "vitest";
import type { TextSegment } from "@/types/upload";
import type {
  PracticeSession,
  PracticeState,
  PracticeActions,
} from "@/types/practice";

describe("Practice Types", () => {
  describe("PracticeSession", () => {
    it("should create valid practice session", () => {
      const segments: TextSegment[] = [
        { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
        { id: "seg-2", text: "World", startPosition: 6, endPosition: 11 },
      ];
      const session: PracticeSession = {
        id: "session-1",
        title: "Test Session",
        segments,
        createdAt: new Date("2025-01-07"),
      };
      expect(session.id).toBe("session-1");
      expect(session.title).toBe("Test Session");
      expect(session.segments).toHaveLength(2);
      expect(session.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("PracticeState", () => {
    it("should create valid initial practice state", () => {
      const state: PracticeState = {
        sessionId: null,
        segments: [],
        currentSegmentIndex: 0,
        playbackState: "idle",
        playbackSpeed: 1.0,
        volume: 1.0,
        selectedVoice: "nova",
        audioCache: new Map(),
        error: null,
      };
      expect(state.sessionId).toBeNull();
      expect(state.segments).toHaveLength(0);
      expect(state.currentSegmentIndex).toBe(0);
      expect(state.playbackState).toBe("idle");
      expect(state.playbackSpeed).toBe(1.0);
      expect(state.volume).toBe(1.0);
      expect(state.selectedVoice).toBe("nova");
      expect(state.audioCache).toBeInstanceOf(Map);
      expect(state.error).toBeNull();
    });

    it("should create practice state with active session", () => {
      const segments: TextSegment[] = [
        { id: "seg-1", text: "Hello", startPosition: 0, endPosition: 5 },
      ];
      const audioCache = new Map<string, string>();
      audioCache.set("seg-1", "base64audiodata");

      const state: PracticeState = {
        sessionId: "session-1",
        segments,
        currentSegmentIndex: 0,
        playbackState: "playing",
        playbackSpeed: 1.5,
        volume: 0.8,
        selectedVoice: "alloy",
        audioCache,
        error: null,
      };
      expect(state.sessionId).toBe("session-1");
      expect(state.segments).toHaveLength(1);
      expect(state.playbackState).toBe("playing");
      expect(state.playbackSpeed).toBe(1.5);
      expect(state.volume).toBe(0.8);
      expect(state.selectedVoice).toBe("alloy");
      expect(state.audioCache.get("seg-1")).toBe("base64audiodata");
    });

    it("should create practice state with error", () => {
      const state: PracticeState = {
        sessionId: "session-1",
        segments: [],
        currentSegmentIndex: 0,
        playbackState: "stopped",
        playbackSpeed: 1.0,
        volume: 1.0,
        selectedVoice: "nova",
        audioCache: new Map(),
        error: "Failed to load audio",
      };
      expect(state.error).toBe("Failed to load audio");
    });
  });

  describe("PracticeActions", () => {
    it("should define all required action methods", () => {
      // Create mock implementation to verify interface structure
      const actions: PracticeActions = {
        initSession: () => {},
        clearSession: () => {},
        play: () => {},
        pause: () => {},
        stop: () => {},
        nextSegment: () => {},
        previousSegment: () => {},
        goToSegment: () => {},
        setPlaybackSpeed: () => {},
        setVolume: () => {},
        setVoice: () => {},
        setPlaybackState: () => {},
        cacheAudio: () => {},
        setError: () => {},
      };

      expect(typeof actions.initSession).toBe("function");
      expect(typeof actions.clearSession).toBe("function");
      expect(typeof actions.play).toBe("function");
      expect(typeof actions.pause).toBe("function");
      expect(typeof actions.stop).toBe("function");
      expect(typeof actions.nextSegment).toBe("function");
      expect(typeof actions.previousSegment).toBe("function");
      expect(typeof actions.goToSegment).toBe("function");
      expect(typeof actions.setPlaybackSpeed).toBe("function");
      expect(typeof actions.setVolume).toBe("function");
      expect(typeof actions.setVoice).toBe("function");
      expect(typeof actions.setPlaybackState).toBe("function");
      expect(typeof actions.cacheAudio).toBe("function");
      expect(typeof actions.setError).toBe("function");
    });
  });
});
