---
id: SPEC-TTS-001
version: "1.1.0"
status: "implemented"
updated: "2026-01-07"
---

# SPEC-TTS-001: 구현 계획

## Traceability

- **SPEC**: [spec.md](./spec.md)
- **Acceptance Criteria**: [acceptance.md](./acceptance.md)

---

## 1. 마일스톤

### Primary Goal: 핵심 TTS 기능

**목표**: 세그먼트를 선택하여 TTS 오디오를 재생할 수 있는 기본 기능 구현

**구현 항목**:
1. 타입 정의 (`types/practice.ts`, `types/audio.ts`)
2. TTS API Route 구현 (`/api/tts`)
3. practiceStore 상태 관리
4. useAudioPlayer 커스텀 훅
5. AudioPlayer 기본 컴포넌트

**검증 기준**:
- 세그먼트 텍스트를 TTS로 변환할 수 있음
- 재생/일시정지/정지 기능 동작
- 다음/이전 세그먼트 네비게이션

### Secondary Goal: 재생 옵션 및 UI 개선

**목표**: 재생 속도 조절, 음성 선택 등 사용자 옵션 제공

**구현 항목**:
1. PlaybackSpeed 컴포넌트 (Slider)
2. VoiceSelector 컴포넌트 (Select)
3. SegmentList 컴포넌트
4. ProgressIndicator 컴포넌트
5. 음성 상수 정의 (`constants/voices.ts`)

**검증 기준**:
- 재생 속도 0.5x ~ 2.0x 조절 가능
- 6가지 음성 중 선택 가능
- 현재 세그먼트 하이라이트 표시

### Final Goal: 연습 페이지 통합

**목표**: 완성된 컴포넌트를 연습 페이지에 통합

**구현 항목**:
1. Practice 페이지 레이아웃 (`/practice/[id]`)
2. Upload 완료 후 연습 세션 시작 플로우
3. 모바일 UI 최적화
4. 에러 처리 및 로딩 상태

**검증 기준**:
- 업로드된 텍스트로 연습 세션 시작 가능
- 모바일에서 터치 조작 가능
- 에러 발생 시 재시도 가능

### Optional Goal: 추가 기능

**목표**: 선택적 기능 구현

**구현 항목**:
1. 볼륨 조절
2. 오디오 프로그레스 바 (Seek)
3. 반복 재생 설정

**검증 기준**:
- 볼륨 0% ~ 100% 조절 가능
- 오디오 특정 위치로 이동 가능

---

## 2. 기술적 접근

### 2.1 TTS API Route 설계

```typescript
// app/api/tts/route.ts
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { text, voice, speed = 1.0 } = await request.json();

  // Validation
  if (!text || text.length === 0 || text.length > 1000) {
    return NextResponse.json(
      { error: 'Invalid text length', code: 'INVALID_INPUT' },
      { status: 400 }
    );
  }

  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    speed,
    response_format: 'mp3',
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  const audioData = buffer.toString('base64');

  return NextResponse.json({
    audioData,
    contentType: 'audio/mpeg',
  });
}
```

### 2.2 오디오 재생 아키텍처

```
User Action → practiceStore → useAudioPlayer Hook → HTML5 Audio API
                    ↑                    ↓
                    └──── State Update ───┘
```

**재생 플로우**:
1. 사용자가 세그먼트 선택 또는 재생 버튼 클릭
2. practiceStore에서 현재 세그먼트 확인
3. 캐시에 오디오가 있으면 바로 재생, 없으면 TTS API 호출
4. Base64 오디오 데이터를 Blob URL로 변환
5. HTML5 Audio Element로 재생
6. 재생 완료 시 상태 업데이트

### 2.3 useAudioPlayer Hook

```typescript
// lib/hooks/use-audio-player.ts
interface UseAudioPlayerReturn {
  // 상태
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;

  // 액션
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
}
```

### 2.4 상태 관리 패턴

**practiceStore 초기화**:
- Upload 완료 후 세그먼트를 practiceStore에 전달
- 세션 ID 생성 및 저장

**오디오 캐시 전략**:
- 세션 내 메모리 캐시 (Map)
- 같은 세그먼트 재재생 시 API 호출 생략
- 음성 변경 시 캐시 무효화

---

## 3. 컴포넌트 설계

### 3.1 AudioPlayer

```typescript
interface AudioPlayerProps {
  className?: string;
}

// 기능
// - 재생/일시정지 토글 버튼
// - 정지 버튼
// - 이전/다음 세그먼트 버튼
// - 현재 세그먼트 텍스트 표시
// - 로딩 인디케이터
```

### 3.2 SegmentList

```typescript
interface SegmentListProps {
  segments: TextSegment[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

// 기능
// - 세그먼트 목록 스크롤 뷰
// - 현재 세그먼트 하이라이트
// - 클릭으로 세그먼트 선택
```

### 3.3 PlaybackSpeed

```typescript
interface PlaybackSpeedProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

// 기능
// - 0.5x ~ 2.0x 슬라이더
// - 현재 속도 표시
// - 프리셋 버튼 (0.5x, 1.0x, 1.5x, 2.0x)
```

### 3.4 VoiceSelector

```typescript
interface VoiceSelectorProps {
  value: VoiceOption;
  onChange: (value: VoiceOption) => void;
  className?: string;
}

// 기능
// - 6가지 음성 옵션 선택 드롭다운
// - 음성 설명 표시
```

---

## 4. 파일 생성 순서

### Phase 1: 타입 및 상수

1. `src/types/audio.ts` - 오디오 관련 타입
2. `src/types/practice.ts` - 연습 세션 타입
3. `src/lib/constants/voices.ts` - 음성 옵션 상수

### Phase 2: 상태 및 API

4. `src/stores/practice-store.ts` - 연습 상태 관리
5. `src/app/api/tts/route.ts` - TTS API Route
6. `src/lib/api/tts.ts` - TTS 클라이언트 함수

### Phase 3: 훅 및 유틸

7. `src/lib/hooks/use-audio-player.ts` - 오디오 재생 훅

### Phase 4: 컴포넌트

8. `src/components/practice/audio-player.tsx`
9. `src/components/practice/segment-list.tsx`
10. `src/components/practice/playback-speed.tsx`
11. `src/components/practice/voice-selector.tsx`
12. `src/components/practice/progress-indicator.tsx`

### Phase 5: 페이지

13. `src/app/practice/page.tsx` - 세션 목록
14. `src/app/practice/[id]/page.tsx` - 연습 페이지

---

## 5. 테스트 전략

### 5.1 단위 테스트 (Vitest)

| 대상 | 테스트 항목 |
|------|------------|
| TTS API Route | 입력 검증, 에러 처리, 응답 형식 |
| practiceStore | 상태 변경, 액션 동작 |
| useAudioPlayer | 재생 컨트롤, 이벤트 핸들링 |
| 컴포넌트 | 렌더링, 이벤트 처리 |

### 5.2 통합 테스트

| 시나리오 | 검증 항목 |
|----------|----------|
| 세그먼트 재생 플로우 | API 호출 -> 오디오 재생 -> 상태 업데이트 |
| 네비게이션 | 다음/이전 세그먼트 이동 및 자동 재생 |
| 설정 변경 | 속도/음성 변경 반영 |

### 5.3 E2E 테스트 (Playwright)

| 시나리오 | 검증 항목 |
|----------|----------|
| 업로드 후 연습 | 파일 업로드 -> 연습 세션 시작 -> TTS 재생 |
| 모바일 조작 | 터치 컨트롤 동작 확인 |

---

## 6. 리스크 및 대응

### 6.1 API 비용

**리스크**: OpenAI TTS API 호출 비용 증가
**대응**:
- 세션 내 캐싱으로 중복 호출 방지
- 텍스트 길이 제한 (1000자)
- 향후 사용량 제한 도입 검토

### 6.2 API 지연

**리스크**: TTS 생성 지연으로 UX 저하
**대응**:
- 로딩 인디케이터 표시
- 다음 세그먼트 프리페치 (Optional)
- 타임아웃 및 재시도 로직

### 6.3 브라우저 호환성

**리스크**: 모바일 Safari 오디오 자동재생 제한
**대응**:
- 사용자 인터랙션 후 재생 시작
- AudioContext unlock 패턴 적용

---

## 7. 참고 코드

### 7.1 OpenAI TTS 호출 예시

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.audio.speech.create({
  model: 'tts-1',
  voice: 'nova',
  input: 'Hello, this is a test.',
  speed: 1.0,
  response_format: 'mp3',
});

const buffer = Buffer.from(await response.arrayBuffer());
```

### 7.2 HTML5 Audio 재생 예시

```typescript
const audio = new Audio();
audio.src = `data:audio/mpeg;base64,${base64Data}`;
audio.playbackRate = 1.0;
audio.volume = 1.0;

audio.addEventListener('ended', () => {
  // 재생 완료 처리
});

await audio.play();
```
