"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePracticeStore } from "@/stores/practice-store";
import { generateSpeech, base64ToAudioUrl } from "@/lib/api/tts";

export interface UseAudioPlayerOptions {
  /** Callback when segment playback ends */
  onSegmentEnd?: () => void;
}

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
  seekTo: (time: number) => void;

  // Settings
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}

export function useAudioPlayer(
  options?: UseAudioPlayerOptions
): UseAudioPlayerReturn {
  const { onSegmentEnd } = options ?? {};

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

  const currentSegment = useMemo(
    () =>
      segments[currentSegmentIndex]
        ? { id: segments[currentSegmentIndex].id, text: segments[currentSegmentIndex].text }
        : null,
    [segments, currentSegmentIndex]
  );

  // Store onSegmentEnd in a ref to avoid re-creating event listeners
  const onSegmentEndRef = useRef(onSegmentEnd);
  useEffect(() => {
    onSegmentEndRef.current = onSegmentEnd;
  }, [onSegmentEnd]);

  // Initialize audio element and set up event listeners
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setPlaybackState("stopped");
      // Call onSegmentEnd callback if provided
      onSegmentEndRef.current?.();
    };
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
          // SPEC-PLAYBACK-001-FIX: Do not pass speed to TTS API
          // Speed is controlled client-side via playbackRate to prevent double application
          const response = await generateSpeech({
            text: segment.text,
            voice: selectedVoice,
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

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Clamp time to valid range [0, duration]
    const clampedTime = Math.max(0, Math.min(time, audio.duration || 0));
    audio.currentTime = clampedTime;
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
    seekTo,
    setPlaybackRate,
    setVolume: setVolumeValue,
  };
}
