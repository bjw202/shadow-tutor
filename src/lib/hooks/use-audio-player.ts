"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePracticeStore } from "@/stores/practice-store";
import { generateSpeech, base64ToAudioUrl } from "@/lib/api/tts";

export interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;
  isLoading: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  error: string | null;

  // Current segment info
  currentSegment: { id: string; text: string } | null;
  currentIndex: number;
  totalSegments: number;

  // Actions
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => Promise<void>;
  nextSegment: () => Promise<void>;
  previousSegment: () => Promise<void>;
  goToSegment: (index: number) => Promise<void>;

  // Settings
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    segments,
    currentSegmentIndex,
    playbackState,
    playbackSpeed,
    volume,
    selectedVoice,
    audioCache,
    error: storeError,
    setPlaybackState,
    cacheAudio,
    setError,
    nextSegment: storeNextSegment,
    previousSegment: storePreviousSegment,
    goToSegment: storeGoToSegment,
  } = usePracticeStore();

  const currentSegment = segments[currentSegmentIndex]
    ? { id: segments[currentSegmentIndex].id, text: segments[currentSegmentIndex].text }
    : null;

  // Initialize audio element and set up event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.playbackRate = playbackSpeed;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setPlaybackState("stopped");
    const handleError = () => setLocalError("Failed to play audio");

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [setPlaybackState]);

  // Update playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadAndPlaySegment = useCallback(
    async (segment: { id: string; text: string }) => {
      if (!segment.text.trim()) {
        setLocalError("No text to play");
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      setLocalError(null);
      setPlaybackState("loading");

      try {
        // Check cache first
        let audioData = audioCache.get(segment.id);

        if (!audioData) {
          // Generate TTS
          const response = await generateSpeech({
            text: segment.text,
            voice: selectedVoice,
            speed: playbackSpeed,
          });
          audioData = response.audioData;
          cacheAudio(segment.id, audioData);
        }

        // Play audio
        audio.src = base64ToAudioUrl(audioData);
        audio.playbackRate = playbackSpeed;
        audio.volume = volume;

        await audio.play();
        setPlaybackState("playing");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate speech";
        setLocalError(errorMessage);
        setError(errorMessage);
        setPlaybackState("stopped");
      }
    },
    [
      audioCache,
      selectedVoice,
      playbackSpeed,
      volume,
      setPlaybackState,
      cacheAudio,
      setError,
    ]
  );

  const play = useCallback(async () => {
    if (!currentSegment) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src && playbackState === "paused") {
      // Resume from pause
      await audio.play();
      setPlaybackState("playing");
    } else {
      // Load and play new segment
      await loadAndPlaySegment(currentSegment);
    }
  }, [currentSegment, playbackState, setPlaybackState, loadAndPlaySegment]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setPlaybackState("paused");
    }
  }, [setPlaybackState]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlaybackState("stopped");
    }
  }, [setPlaybackState]);

  const togglePlayPause = useCallback(async () => {
    if (playbackState === "playing") {
      pause();
    } else {
      await play();
    }
  }, [playbackState, play, pause]);

  const nextSegment = useCallback(async () => {
    if (currentSegmentIndex < segments.length - 1) {
      stop();
      storeNextSegment();
      const nextSeg = segments[currentSegmentIndex + 1];
      if (nextSeg) {
        await loadAndPlaySegment({ id: nextSeg.id, text: nextSeg.text });
      }
    }
  }, [
    currentSegmentIndex,
    segments,
    stop,
    storeNextSegment,
    loadAndPlaySegment,
  ]);

  const previousSegment = useCallback(async () => {
    if (currentSegmentIndex > 0) {
      stop();
      storePreviousSegment();
      const prevSeg = segments[currentSegmentIndex - 1];
      if (prevSeg) {
        await loadAndPlaySegment({ id: prevSeg.id, text: prevSeg.text });
      }
    }
  }, [
    currentSegmentIndex,
    segments,
    stop,
    storePreviousSegment,
    loadAndPlaySegment,
  ]);

  const goToSegment = useCallback(
    async (index: number) => {
      if (index >= 0 && index < segments.length) {
        stop();
        storeGoToSegment(index);
        const segment = segments[index];
        if (segment) {
          await loadAndPlaySegment({ id: segment.id, text: segment.text });
        }
      }
    },
    [segments, stop, storeGoToSegment, loadAndPlaySegment]
  );

  const setPlaybackRate = useCallback((rate: number) => {
    usePracticeStore.getState().setPlaybackSpeed(rate);
  }, []);

  const setVolumeValue = useCallback((vol: number) => {
    usePracticeStore.getState().setVolume(vol);
  }, []);

  return {
    isPlaying: playbackState === "playing",
    isLoading: playbackState === "loading",
    isPaused: playbackState === "paused",
    currentTime,
    duration,
    error: localError || storeError,
    currentSegment,
    currentIndex: currentSegmentIndex,
    totalSegments: segments.length,
    play,
    pause,
    stop,
    togglePlayPause,
    nextSegment,
    previousSegment,
    goToSegment,
    setPlaybackRate,
    setVolume: setVolumeValue,
  };
}
