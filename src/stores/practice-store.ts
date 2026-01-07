import { create } from "zustand";
import type { TextSegment } from "@/types/upload";
import type { PlaybackState, VoiceOption } from "@/types/audio";
import type { PracticeState, PracticeActions, PlaybackMode, ShadowingSettings } from "@/types/practice";
import {
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_VOLUME,
} from "@/lib/constants/voices";
import {
  DEFAULT_SHADOWING_SETTINGS,
  STORAGE_KEY_MODE,
  STORAGE_KEY_SETTINGS,
  isValidPauseDuration,
  isValidRepeatCount,
} from "@/lib/constants/shadowing";

type PracticeStore = PracticeState & PracticeActions;

const initialState: PracticeState = {
  sessionId: null,
  segments: [],
  currentSegmentIndex: 0,
  playbackState: "idle",
  playbackSpeed: DEFAULT_SPEED,
  volume: DEFAULT_VOLUME,
  isMuted: false,
  selectedVoice: DEFAULT_VOICE,
  audioCache: new Map(),
  isAutoScrollEnabled: true,
  error: null,
  mode: "continuous" as PlaybackMode,
  shadowingSettings: { ...DEFAULT_SHADOWING_SETTINGS },
  currentRepeat: 0,
  isShadowingPaused: false,
  remainingTime: 0,
};

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  ...initialState,

  initSession: (segments: TextSegment[]) =>
    set({
      sessionId: crypto.randomUUID(),
      segments,
      currentSegmentIndex: 0,
      playbackState: "idle",
      audioCache: new Map(),
      error: null,
    }),

  clearSession: () => {
    const { mode, shadowingSettings } = get();
    set({
      sessionId: null,
      segments: [],
      currentSegmentIndex: 0,
      playbackState: "idle",
      playbackSpeed: DEFAULT_SPEED,
      volume: DEFAULT_VOLUME,
      isMuted: false,
      selectedVoice: DEFAULT_VOICE,
      audioCache: new Map(),
      isAutoScrollEnabled: true,
      error: null,
      // Preserve user preferences
      mode,
      shadowingSettings,
      // Reset shadowing session state
      currentRepeat: 0,
      isShadowingPaused: false,
      remainingTime: 0,
    });
  },

  play: () => set({ playbackState: "playing" }),

  pause: () => set({ playbackState: "paused" }),

  stop: () => set({ playbackState: "stopped" }),

  nextSegment: () => {
    const { currentSegmentIndex, segments } = get();
    if (currentSegmentIndex < segments.length - 1) {
      set({ currentSegmentIndex: currentSegmentIndex + 1 });
    }
  },

  previousSegment: () => {
    const { currentSegmentIndex } = get();
    if (currentSegmentIndex > 0) {
      set({ currentSegmentIndex: currentSegmentIndex - 1 });
    }
  },

  goToSegment: (index: number) => {
    const { segments } = get();
    if (index >= 0 && index < segments.length) {
      set({ currentSegmentIndex: index });
    }
  },

  setPlaybackSpeed: (speed: number) => {
    if (speed >= 0.5 && speed <= 2.0) {
      set({ playbackSpeed: speed });
    }
  },

  setVolume: (volume: number) => {
    if (volume >= 0 && volume <= 1) {
      set({ volume });
    }
  },

  toggleMute: () => {
    const { isMuted } = get();
    set({ isMuted: !isMuted });
  },

  setVoice: (voice: VoiceOption) =>
    set({
      selectedVoice: voice,
      audioCache: new Map(),
    }),

  setPlaybackState: (state: PlaybackState) => set({ playbackState: state }),

  cacheAudio: (segmentId: string, audioData: string) => {
    const { audioCache } = get();
    const newCache = new Map(audioCache);
    newCache.set(segmentId, audioData);
    set({ audioCache: newCache });
  },

  setAutoScrollEnabled: (enabled: boolean) => set({ isAutoScrollEnabled: enabled }),

  setError: (error: string | null) => set({ error }),

  setMode: (mode: PlaybackMode) => {
    set({ mode });
    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    }
  },

  updateShadowingSettings: (settings: Partial<ShadowingSettings>) => {
    const { shadowingSettings } = get();
    const newSettings = { ...shadowingSettings };

    // Validate and update pauseDuration
    if (settings.pauseDuration !== undefined) {
      if (isValidPauseDuration(settings.pauseDuration)) {
        newSettings.pauseDuration = settings.pauseDuration;
      }
    }

    // Validate and update repeatCount
    if (settings.repeatCount !== undefined) {
      if (isValidRepeatCount(settings.repeatCount)) {
        newSettings.repeatCount = settings.repeatCount;
      }
    }

    // Update autoAdvance (no validation needed for boolean)
    if (settings.autoAdvance !== undefined) {
      newSettings.autoAdvance = settings.autoAdvance;
    }

    set({ shadowingSettings: newSettings });

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    }
  },

  startPause: () => {
    const { shadowingSettings } = get();
    set({
      isShadowingPaused: true,
      remainingTime: shadowingSettings.pauseDuration,
    });
  },

  skipPause: () => {
    set({
      isShadowingPaused: false,
      remainingTime: 0,
    });
  },

  incrementRepeat: () => {
    const { currentRepeat } = get();
    set({ currentRepeat: currentRepeat + 1 });
  },

  resetRepeat: () => {
    set({ currentRepeat: 0 });
  },

  setRemainingTime: (time: number) => {
    set({ remainingTime: time });
  },
}));
