"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  AudioPlayer,
  SegmentList,
  PlaybackSpeed,
  VoiceSelector,
} from "@/components/practice";
import { usePracticeStore } from "@/stores/practice-store";
import type { VoiceOption } from "@/types";

export default function PracticeSessionPage() {
  const router = useRouter();
  const {
    segments,
    sessionId,
    playbackSpeed,
    selectedVoice,
    currentSegmentIndex,
    clearSession,
    setPlaybackSpeed,
  } = usePracticeStore();

  // Ref to hold goToSegment function from AudioPlayer
  const audioActionsRef = useRef<{
    goToSegment: (index: number) => Promise<void>;
  } | null>(null);

  // Callback to receive actions from AudioPlayer
  const handleAudioReady = useCallback(
    (actions: { goToSegment: (index: number) => Promise<void> }) => {
      audioActionsRef.current = actions;
    },
    []
  );

  // Handle segment selection from list
  const handleSegmentSelect = useCallback((index: number) => {
    audioActionsRef.current?.goToSegment(index);
  }, []);

  // Redirect to practice page if no session
  useEffect(() => {
    if (!sessionId || segments.length === 0) {
      router.push("/practice");
    }
  }, [sessionId, segments.length, router]);

  const handleEndSession = () => {
    clearSession();
    router.push("/practice");
  };

  const handleVoiceChange = (voice: string) => {
    usePracticeStore.getState().setVoice(voice as VoiceOption);
  };

  if (!sessionId || segments.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/practice"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Practice
        </Link>
        <Button variant="outline" size="sm" onClick={handleEndSession}>
          End Session
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main content - Audio Player */}
        <div className="space-y-6 md:col-span-2">
          <AudioPlayer onReady={handleAudioReady} />

          {/* Settings row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <PlaybackSpeed value={playbackSpeed} onChange={setPlaybackSpeed} />
            <VoiceSelector
              value={selectedVoice}
              onChange={handleVoiceChange}
            />
          </div>
        </div>

        {/* Sidebar - Segment List */}
        <div className="md:col-span-1">
          <SegmentList
            segments={segments}
            currentIndex={currentSegmentIndex}
            onSelect={handleSegmentSelect}
          />
        </div>
      </div>
    </div>
  );
}
