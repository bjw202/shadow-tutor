import { create } from "zustand";
import type { TextSegment } from "@/types/upload";
import type { PlaybackState, VoiceOption } from "@/types/audio";
import type { PracticeState, PracticeActions } from "@/types/practice";
import {
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_VOLUME,
} from "@/lib/constants/voices";

type PracticeStore = PracticeState & PracticeActions;

const initialState: PracticeState = {
  sessionId: null,
  segments: [],
  currentSegmentIndex: 0,
  playbackState: "idle",
  playbackSpeed: DEFAULT_SPEED,
  volume: DEFAULT_VOLUME,
  selectedVoice: DEFAULT_VOICE,
  audioCache: new Map(),
  error: null,
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

  clearSession: () =>
    set({
      sessionId: null,
      segments: [],
      currentSegmentIndex: 0,
      playbackState: "idle",
      playbackSpeed: DEFAULT_SPEED,
      volume: DEFAULT_VOLUME,
      selectedVoice: DEFAULT_VOICE,
      audioCache: new Map(),
      error: null,
    }),

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

  setError: (error: string | null) => set({ error }),
}));
