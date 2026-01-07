"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { usePracticeStore } from "@/stores/practice-store";

/**
 * Hook to synchronize settings store with practice store
 * This ensures that global settings are applied to the practice session
 */
export function useSettingsSync() {
  const {
    voice,
    speed,
    volume,
    isMuted,
    pauseDuration,
    repeatCount,
    autoAdvance,
    isInitialized,
    setInitialized,
  } = useSettingsStore();

  const {
    selectedVoice,
    playbackSpeed,
    volume: practiceVolume,
    isMuted: practiceMuted,
    shadowingSettings,
    setVoice,
    setPlaybackSpeed,
    setVolume,
    toggleMute,
    updateShadowingSettings,
  } = usePracticeStore();

  // Mark settings as initialized on mount
  useEffect(() => {
    if (!isInitialized) {
      setInitialized();
    }
  }, [isInitialized, setInitialized]);

  // Sync voice
  useEffect(() => {
    if (voice !== selectedVoice) {
      setVoice(voice);
    }
  }, [voice, selectedVoice, setVoice]);

  // Sync playback speed
  useEffect(() => {
    if (speed !== playbackSpeed) {
      setPlaybackSpeed(speed);
    }
  }, [speed, playbackSpeed, setPlaybackSpeed]);

  // Sync volume
  useEffect(() => {
    if (volume !== practiceVolume) {
      setVolume(volume);
    }
  }, [volume, practiceVolume, setVolume]);

  // Sync muted state
  useEffect(() => {
    if (isMuted !== practiceMuted) {
      toggleMute();
    }
  }, [isMuted, practiceMuted, toggleMute]);

  // Sync shadowing settings
  useEffect(() => {
    const needsUpdate =
      pauseDuration !== shadowingSettings.pauseDuration ||
      repeatCount !== shadowingSettings.repeatCount ||
      autoAdvance !== shadowingSettings.autoAdvance;

    if (needsUpdate) {
      updateShadowingSettings({
        pauseDuration,
        repeatCount,
        autoAdvance,
      });
    }
  }, [
    pauseDuration,
    repeatCount,
    autoAdvance,
    shadowingSettings,
    updateShadowingSettings,
  ]);
}
