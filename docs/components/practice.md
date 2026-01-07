# Practice Components

## Overview

The practice components provide the UI for shadow speaking practice sessions. They integrate with the `practiceStore` for state management and `useAudioPlayer` hook for audio playback.

## Components

### AudioPlayer

Main audio playback controls component.

**Location**: `src/components/practice/audio-player.tsx`

**Features**:
- Play/Pause/Stop controls
- Previous/Next segment navigation
- Current segment text display
- Loading indicator
- Error display with retry option

**Props**:
```typescript
interface AudioPlayerProps {
  className?: string;
}
```

**Usage**:
```tsx
import { AudioPlayer } from '@/components/practice/audio-player';

<AudioPlayer className="my-4" />
```

---

### SegmentList

Scrollable list of text segments with selection and highlighting.

**Location**: `src/components/practice/segment-list.tsx`

**Features**:
- Display all segments
- Highlight current segment
- Click to select and play segment
- Auto-scroll to current segment
- Empty state handling

**Props**:
```typescript
interface SegmentListProps {
  className?: string;
}
```

**Usage**:
```tsx
import { SegmentList } from '@/components/practice/segment-list';

<SegmentList className="h-64 overflow-y-auto" />
```

---

### PlaybackSpeed

Playback speed control with slider and preset buttons.

**Location**: `src/components/practice/playback-speed.tsx`

**Features**:
- Slider from 0.5x to 2.0x
- Preset buttons (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
- Current speed display
- Immediate speed change during playback

**Props**:
```typescript
interface PlaybackSpeedProps {
  className?: string;
}
```

**Usage**:
```tsx
import { PlaybackSpeed } from '@/components/practice/playback-speed';

<PlaybackSpeed className="my-4" />
```

---

### VoiceSelector

Dropdown for selecting TTS voice.

**Location**: `src/components/practice/voice-selector.tsx`

**Features**:
- 6 OpenAI voice options
- Voice description display
- Voice change applies to next TTS generation

**Props**:
```typescript
interface VoiceSelectorProps {
  className?: string;
}
```

**Usage**:
```tsx
import { VoiceSelector } from '@/components/practice/voice-selector';

<VoiceSelector className="my-4" />
```

---

## State Management

All practice components use the shared `practiceStore` (Zustand):

```typescript
// Key state
interface PracticeState {
  segments: TextSegment[];
  currentSegmentIndex: number;
  playbackState: PlaybackState;
  playbackSpeed: number;
  volume: number;
  selectedVoice: VoiceOption;
  audioCache: Map<string, string>;
  error: string | null;
}

// Key actions
interface PracticeActions {
  initSession: (segments: TextSegment[]) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextSegment: () => void;
  previousSegment: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setVoice: (voice: VoiceOption) => void;
}
```

## Page Integration

### Practice Session Page

**Location**: `src/app/practice/session/page.tsx`

Integrates all practice components:

```tsx
export default function PracticeSessionPage() {
  return (
    <div className="container mx-auto p-4">
      <h1>Practice Session</h1>

      <VoiceSelector />
      <PlaybackSpeed />
      <SegmentList />
      <AudioPlayer />
    </div>
  );
}
```

### Practice Start Page

**Location**: `src/app/practice/page.tsx`

Initializes practice session from uploaded segments:

```tsx
export default function PracticePage() {
  // Check for uploaded segments
  // Redirect to session or show upload prompt
}
```

## Related

- [TTS API](../api/tts.md) - TTS endpoint documentation
- [SPEC-TTS-001](../../.moai/specs/SPEC-TTS-001/spec.md) - Feature specification
- [useAudioPlayer Hook](../hooks/use-audio-player.md) - Audio playback hook
