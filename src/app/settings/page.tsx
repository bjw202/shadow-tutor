"use client";

import { useSettingsStore } from "@/stores/settings-store";
import {
  SettingsHeader,
  TTSSettings,
  ShadowingSection,
  ResetSettings,
} from "@/components/settings";

/**
 * Settings page component
 */
export default function SettingsPage() {
  const {
    // TTS state
    voice,
    speed,
    volume,
    isMuted,
    // Shadowing state
    pauseDuration,
    repeatCount,
    autoAdvance,
    // TTS actions
    setVoice,
    setSpeed,
    setVolume,
    toggleMute,
    // Shadowing actions
    setPauseDuration,
    setRepeatCount,
    setAutoAdvance,
    // General actions
    resetToDefaults,
  } = useSettingsStore();

  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader />

      <main className="container py-6 space-y-6 max-w-2xl">
        {/* TTS Settings Section */}
        <TTSSettings
          voice={voice}
          speed={speed}
          volume={volume}
          isMuted={isMuted}
          onVoiceChange={setVoice}
          onSpeedChange={setSpeed}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
        />

        {/* Shadowing Settings Section */}
        <ShadowingSection
          pauseDuration={pauseDuration}
          repeatCount={repeatCount}
          autoAdvance={autoAdvance}
          onPauseDurationChange={setPauseDuration}
          onRepeatCountChange={setRepeatCount}
          onAutoAdvanceChange={setAutoAdvance}
        />

        {/* Reset Settings */}
        <ResetSettings onReset={resetToDefaults} />
      </main>
    </div>
  );
}
