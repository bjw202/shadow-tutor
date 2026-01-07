# TTS API Documentation

## Overview

The TTS (Text-to-Speech) API provides server-side audio generation using OpenAI's TTS API. This endpoint converts text into natural-sounding speech with support for multiple voices and playback speeds.

## Endpoint

```
POST /api/tts
```

## Request

### Headers

```
Content-Type: application/json
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Text to convert (1-1000 characters) |
| `voice` | VoiceOption | Yes | Voice selection |
| `speed` | number | No | Playback speed (0.5-2.0, default: 1.0) |

### Voice Options

| Value | Description |
|-------|-------------|
| `alloy` | Neutral and balanced |
| `echo` | Warm and conversational |
| `fable` | Expressive and animated |
| `onyx` | Deep and authoritative |
| `nova` | Friendly and optimistic |
| `shimmer` | Clear and gentle |

### Example Request

```typescript
const response = await fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, world!',
    voice: 'nova',
    speed: 1.0,
  }),
});
```

## Response

### Success (200)

```typescript
interface TTSResponse {
  audioData: string;    // Base64 encoded MP3 audio
  contentType: string;  // 'audio/mpeg'
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_INPUT` | Missing or invalid text/voice |
| 400 | `TEXT_TOO_LONG` | Text exceeds 1000 characters |
| 500 | `API_ERROR` | OpenAI API failure |
| 429 | `RATE_LIMITED` | Too many requests |

### Error Response Format

```typescript
interface TTSErrorResponse {
  error: string;
  code: 'INVALID_INPUT' | 'TEXT_TOO_LONG' | 'API_ERROR' | 'RATE_LIMITED';
}
```

## Client Usage

### Using the TTS Client

```typescript
import { generateSpeech, base64ToAudioUrl } from '@/lib/api/tts';

// Generate speech
const response = await generateSpeech({
  text: 'Hello, world!',
  voice: 'nova',
  speed: 1.0,
});

// Convert to playable URL
const audioUrl = base64ToAudioUrl(response.audioData);

// Play with HTML5 Audio
const audio = new Audio(audioUrl);
await audio.play();
```

### Using the useAudioPlayer Hook

```typescript
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';

function PracticeComponent() {
  const {
    isPlaying,
    isLoading,
    play,
    pause,
    stop,
    nextSegment,
    previousSegment,
  } = useAudioPlayer();

  return (
    <div>
      <button onClick={play} disabled={isLoading}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

## Security

- API key is stored server-side only (environment variable)
- Client never has direct access to OpenAI API
- Input validation prevents abuse (text length limits)

## Performance

- Target latency: < 2 seconds for audio generation
- Audio caching: Session-level caching prevents duplicate API calls
- Cost: ~$0.015 per 1K characters (OpenAI tts-1 model)

## Related

- [SPEC-TTS-001](../.moai/specs/SPEC-TTS-001/spec.md) - Feature specification
- [Practice Store](../stores/practice-store.md) - State management
- [OpenAI TTS API](https://platform.openai.com/docs/guides/text-to-speech) - Official documentation
