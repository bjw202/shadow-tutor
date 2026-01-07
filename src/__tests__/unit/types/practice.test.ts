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
        isMuted: false,
        isAutoScrollEnabled: true,
        selectedVoice: "nova",
        audioCache: new Map(),
        error: null,
        mode: "continuous",
        shadowingSettings: {
          pauseDuration: 5,
          repeatCount: 1,
          autoAdvance: true,
        },
        currentRepeat: 0,
        isShadowingPaused: false,
        remainingTime: 0,
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
      expect(state.mode).toBe("continuous");
      expect(state.shadowingSettings.pauseDuration).toBe(5);
      expect(state.shadowingSettings.repeatCount).toBe(1);
      expect(state.shadowingSettings.autoAdvance).toBe(true);
      expect(state.currentRepeat).toBe(0);
      expect(state.isShadowingPaused).toBe(false);
      expect(state.remainingTime).toBe(0);
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
        isMuted: false,
        isAutoScrollEnabled: true,
        selectedVoice: "alloy",
        audioCache,
        error: null,
        mode: "shadowing",
        shadowingSettings: {
          pauseDuration: 10,
          repeatCount: 3,
          autoAdvance: false,
        },
        currentRepeat: 1,
        isShadowingPaused: true,
        remainingTime: 5,
      };
      expect(state.sessionId).toBe("session-1");
      expect(state.segments).toHaveLength(1);
      expect(state.playbackState).toBe("playing");
      expect(state.playbackSpeed).toBe(1.5);
      expect(state.volume).toBe(0.8);
      expect(state.selectedVoice).toBe("alloy");
      expect(state.audioCache.get("seg-1")).toBe("base64audiodata");
      expect(state.mode).toBe("shadowing");
      expect(state.shadowingSettings.pauseDuration).toBe(10);
      expect(state.shadowingSettings.repeatCount).toBe(3);
      expect(state.currentRepeat).toBe(1);
      expect(state.isShadowingPaused).toBe(true);
      expect(state.remainingTime).toBe(5);
    });

    it("should create practice state with error", () => {
      const state: PracticeState = {
        sessionId: "session-1",
        segments: [],
        currentSegmentIndex: 0,
        playbackState: "stopped",
        playbackSpeed: 1.0,
        volume: 1.0,
        isMuted: false,
        isAutoScrollEnabled: true,
        selectedVoice: "nova",
        audioCache: new Map(),
        error: "Failed to load audio",
        mode: "continuous",
        shadowingSettings: {
          pauseDuration: 5,
          repeatCount: 1,
          autoAdvance: true,
        },
        currentRepeat: 0,
        isShadowingPaused: false,
        remainingTime: 0,
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
        toggleMute: () => {},
        setAutoScrollEnabled: () => {},
        setVoice: () => {},
        setPlaybackState: () => {},
        cacheAudio: () => {},
        setError: () => {},
        setMode: () => {},
        updateShadowingSettings: () => {},
        startPause: () => {},
        skipPause: () => {},
        incrementRepeat: () => {},
        resetRepeat: () => {},
        setRemainingTime: () => {},
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
      expect(typeof actions.setMode).toBe("function");
      expect(typeof actions.updateShadowingSettings).toBe("function");
      expect(typeof actions.startPause).toBe("function");
      expect(typeof actions.skipPause).toBe("function");
      expect(typeof actions.incrementRepeat).toBe("function");
      expect(typeof actions.resetRepeat).toBe("function");
      expect(typeof actions.setRemainingTime).toBe("function");
    });
  });
});
