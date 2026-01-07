import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { VoiceOption } from "@/types/audio";
import type { SettingsStore } from "@/types/settings";
import {
  STORAGE_KEY_SETTINGS,
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  DEFAULT_VOLUME,
  DEFAULT_PAUSE_DURATION,
  DEFAULT_REPEAT_COUNT,
  DEFAULT_AUTO_ADVANCE,
  clampSpeed,
  clampVolume,
  clampPauseDuration,
  clampRepeatCount,
} from "@/lib/constants/settings";

/**
 * Settings store with localStorage persistence
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial TTS state
      voice: DEFAULT_VOICE,
      speed: DEFAULT_SPEED,
      volume: DEFAULT_VOLUME,
      isMuted: false,

      // Initial Shadowing state
      pauseDuration: DEFAULT_PAUSE_DURATION,
      repeatCount: DEFAULT_REPEAT_COUNT,
      autoAdvance: DEFAULT_AUTO_ADVANCE,

      // Initialization state
      isInitialized: false,

      // TTS Actions
      setVoice: (voice: VoiceOption) => {
        set({ voice });
      },

      setSpeed: (speed: number) => {
        set({ speed: clampSpeed(speed) });
      },

      setVolume: (volume: number) => {
        set({ volume: clampVolume(volume) });
      },

      setMuted: (isMuted: boolean) => {
        set({ isMuted });
      },

      toggleMute: () => {
        const { isMuted } = get();
        set({ isMuted: !isMuted });
      },

      // Shadowing Actions
      setPauseDuration: (duration: number) => {
        set({ pauseDuration: clampPauseDuration(duration) });
      },

      setRepeatCount: (count: number) => {
        set({ repeatCount: clampRepeatCount(count) });
      },

      setAutoAdvance: (autoAdvance: boolean) => {
        set({ autoAdvance });
      },

      // General Actions
      resetToDefaults: () => {
        set({
          voice: DEFAULT_VOICE,
          speed: DEFAULT_SPEED,
          volume: DEFAULT_VOLUME,
          isMuted: false,
          pauseDuration: DEFAULT_PAUSE_DURATION,
          repeatCount: DEFAULT_REPEAT_COUNT,
          autoAdvance: DEFAULT_AUTO_ADVANCE,
        });
      },

      setInitialized: () => {
        set({ isInitialized: true });
      },
    }),
    {
      name: STORAGE_KEY_SETTINGS,
      partialize: (state) => ({
        voice: state.voice,
        speed: state.speed,
        volume: state.volume,
        isMuted: state.isMuted,
        pauseDuration: state.pauseDuration,
        repeatCount: state.repeatCount,
        autoAdvance: state.autoAdvance,
      }),
    }
  )
);
