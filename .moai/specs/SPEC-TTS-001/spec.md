---
id: SPEC-TTS-001
version: "1.1.0"
status: "implemented"
created: "2026-01-07"
updated: "2026-01-07"
author: "MoAI-ADK"
priority: "high"
lifecycle: "spec-anchored"
---

# SPEC-TTS-001: TTS 오디오 재생

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 생성 |
| 1.1.0 | 2026-01-07 | MoAI-ADK | TDD 구현 완료 (264 tests, 100% pass) |

---

## 1. 개요

Shadow Tutor 애플리케이션의 핵심 기능인 TTS(Text-to-Speech) 오디오 재생을 구현합니다. OpenAI TTS API를 통합하여 업로드된 텍스트 세그먼트를 원어민 수준의 발음으로 재생할 수 있도록 합니다.

### 1.1 목적

- OpenAI TTS API를 통한 고품질 원어민 발음 제공
- 세그먼트별 개별 오디오 재생 지원
- 다양한 음성 옵션 및 재생 속도 조절 기능
- 쉐도잉 연습을 위한 직관적인 오디오 플레이어 UI

### 1.2 범위

**포함 (In Scope):**
- OpenAI TTS API Route 구현 (`/api/tts`)
- 오디오 플레이어 컴포넌트 (`AudioPlayer`)
- 세그먼트 목록 및 네비게이션
- 재생 속도 조절 (0.5x - 2.0x)
- 음성 선택 (6가지 OpenAI 음성)
- practiceStore 상태 관리
- 기본 재생 컨트롤 (재생/일시정지/정지)

**제외 (Out of Scope):**
- 쉐도잉 모드 자동 일시정지 (SPEC-SHADOW-001)
- PWA 오프라인 오디오 캐싱 (SPEC-PWA-001)
- 오디오 녹음 및 발음 평가
- 재생 히스토리 및 통계

---

## 2. EARS 요구사항

### 2.1 Ubiquitous Requirements (항상 참인 요구사항)

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** OpenAI TTS API를 서버 사이드에서만 호출해야 한다 (API 키 보호) |
| UR-002 | 시스템은 **항상** 오디오 재생 상태를 practiceStore에서 관리해야 한다 |
| UR-003 | 시스템은 **항상** 오디오 재생 시 현재 세그먼트를 시각적으로 하이라이트해야 한다 |
| UR-004 | 시스템은 **항상** 모바일 터치 환경에 최적화된 컨트롤을 제공해야 한다 |
| UR-005 | 시스템은 **항상** 재생 속도를 0.5x ~ 2.0x 범위로 제한해야 한다 |

### 2.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 사용자가 세그먼트를 선택할 때 **THEN** 해당 세그먼트의 TTS 오디오가 생성/재생되어야 한다 |
| ED-002 | **WHEN** 사용자가 재생 버튼을 클릭할 때 **THEN** 현재 세그먼트의 오디오가 재생되어야 한다 |
| ED-003 | **WHEN** 사용자가 일시정지 버튼을 클릭할 때 **THEN** 오디오 재생이 일시정지되어야 한다 |
| ED-004 | **WHEN** 사용자가 다음/이전 버튼을 클릭할 때 **THEN** 해당 세그먼트로 이동하고 자동 재생되어야 한다 |
| ED-005 | **WHEN** 오디오 재생이 완료될 때 **THEN** 재생 상태가 'stopped'으로 변경되어야 한다 |
| ED-006 | **WHEN** 사용자가 재생 속도를 변경할 때 **THEN** 현재 재생 중인 오디오의 속도가 즉시 변경되어야 한다 |
| ED-007 | **WHEN** 사용자가 음성을 변경할 때 **THEN** 다음 TTS 생성부터 새 음성이 적용되어야 한다 |
| ED-008 | **WHEN** TTS API 호출이 실패할 때 **THEN** 에러 메시지가 표시되고 재시도 옵션이 제공되어야 한다 |

### 2.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 오디오가 로딩 중이면 **THEN** 로딩 인디케이터가 표시되어야 한다 |
| SD-002 | **IF** 오디오가 재생 중이면 **THEN** 일시정지 아이콘이 표시되어야 한다 |
| SD-003 | **IF** 오디오가 정지 상태이면 **THEN** 재생 아이콘이 표시되어야 한다 |
| SD-004 | **IF** 첫 번째 세그먼트이면 **THEN** 이전 버튼이 비활성화되어야 한다 |
| SD-005 | **IF** 마지막 세그먼트이면 **THEN** 다음 버튼이 비활성화되어야 한다 |
| SD-006 | **IF** 세그먼트가 없으면 **THEN** 오디오 플레이어가 비활성화되어야 한다 |
| SD-007 | **IF** 에러 상태이면 **THEN** 에러 메시지와 재시도 버튼이 표시되어야 한다 |

### 2.4 Unwanted Behavior Requirements (원치 않는 동작)

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 클라이언트에서 OpenAI API 키를 **노출하지 않아야 한다** |
| UB-002 | 시스템은 1000자를 초과하는 단일 세그먼트를 **TTS 변환하지 않아야 한다** |
| UB-003 | 시스템은 동시에 여러 오디오를 **재생하지 않아야 한다** |
| UB-004 | 시스템은 빈 세그먼트를 **TTS 변환하지 않아야 한다** |
| UB-005 | 시스템은 TTS 생성 중 중복 API 호출을 **실행하지 않아야 한다** |

### 2.5 Optional Feature Requirements (선택적 기능)

| ID | 요구사항 |
|----|----------|
| OF-001 | **가능하면** 세그먼트별 반복 재생 횟수 설정을 제공해야 한다 |
| OF-002 | **가능하면** 볼륨 조절 기능을 제공해야 한다 |
| OF-003 | **가능하면** 오디오 프로그레스 바 (seek) 기능을 제공해야 한다 |

---

## 3. 기술 스택

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.x | API Route, Server Actions |
| react | 19.x | UI 컴포넌트 |
| typescript | 5.7.x | 타입 안전성 |
| openai | 4.77.x | TTS API 호출 |
| tailwindcss | 4.x | 스타일링 |
| shadcn/ui | latest | Slider, Button, Select 컴포넌트 |
| zustand | 5.x | practiceStore 상태 관리 |
| lucide-react | latest | 재생 컨트롤 아이콘 |

---

## 4. 컴포넌트 구조

```
src/
├── app/
│   ├── practice/
│   │   ├── page.tsx                    # 연습 세션 목록
│   │   └── [id]/
│   │       └── page.tsx                # 개별 연습 세션 페이지
│   └── api/
│       └── tts/
│           └── route.ts                # TTS API Route
├── components/
│   └── practice/
│       ├── audio-player.tsx            # 오디오 플레이어 핵심 컴포넌트
│       ├── segment-list.tsx            # 세그먼트 목록 및 네비게이션
│       ├── playback-speed.tsx          # 재생 속도 조절
│       ├── voice-selector.tsx          # 음성 선택
│       └── progress-indicator.tsx      # 세션 진행률
├── lib/
│   ├── api/
│   │   └── tts.ts                      # TTS API 클라이언트
│   ├── hooks/
│   │   └── use-audio-player.ts         # 오디오 재생 커스텀 훅
│   └── constants/
│       └── voices.ts                   # OpenAI 음성 상수
├── stores/
│   └── practice-store.ts               # 연습 세션 상태 관리
└── types/
    ├── practice.ts                     # 연습 관련 타입
    └── audio.ts                        # 오디오 관련 타입
```

---

## 5. API 설계

### 5.1 POST /api/tts

TTS 오디오를 생성하는 API 엔드포인트

**Request:**
```typescript
interface TTSRequest {
  text: string;                    // 변환할 텍스트 (1-1000자)
  voice: VoiceOption;              // 음성 옵션
  speed?: number;                  // 재생 속도 (0.5-2.0, 기본값: 1.0)
}

type VoiceOption = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
```

**Response (Success):**
```typescript
interface TTSResponse {
  audioData: string;               // Base64 인코딩된 오디오 데이터
  contentType: string;             // 'audio/mpeg'
  duration?: number;               // 오디오 길이 (초)
}
```

**Response (Error):**
```typescript
interface TTSErrorResponse {
  error: string;
  code: 'INVALID_INPUT' | 'TEXT_TOO_LONG' | 'API_ERROR' | 'RATE_LIMITED';
}
```

### 5.2 OpenAI TTS API 상세

- **Endpoint**: `https://api.openai.com/v1/audio/speech`
- **Model**: `tts-1` (표준 품질, 빠른 속도)
- **Response Format**: `mp3`
- **Cost**: ~$0.015 per 1K characters

---

## 6. 상태 관리

### 6.1 practiceStore 구조

```typescript
interface PracticeState {
  // 세션 정보
  sessionId: string | null;
  segments: TextSegment[];

  // 재생 상태
  currentSegmentIndex: number;
  playbackState: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped';
  playbackSpeed: number;
  volume: number;

  // 설정
  selectedVoice: VoiceOption;

  // 오디오 캐시 (세션 내)
  audioCache: Map<string, string>;  // segmentId -> base64 audio

  // 에러 상태
  error: string | null;
}

interface PracticeActions {
  // 세션 관리
  initSession: (segments: TextSegment[]) => void;
  clearSession: () => void;

  // 재생 컨트롤
  play: () => void;
  pause: () => void;
  stop: () => void;
  nextSegment: () => void;
  previousSegment: () => void;
  goToSegment: (index: number) => void;

  // 설정 변경
  setPlaybackSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (voice: VoiceOption) => void;

  // 내부 상태
  setPlaybackState: (state: PlaybackState) => void;
  cacheAudio: (segmentId: string, audioData: string) => void;
  setError: (error: string | null) => void;
}
```

---

## 7. 의존성

### 7.1 내부 의존성

| SPEC ID | 의존성 유형 | 설명 |
|---------|------------|------|
| SPEC-INIT-001 | 완료 필요 | 프로젝트 초기 설정 |
| SPEC-UPLOAD-001 | 완료 필요 | TextSegment 타입, 업로드된 세그먼트 데이터 |

### 7.2 외부 의존성

| 패키지 | 용도 | 설치 여부 |
|--------|------|----------|
| openai | TTS API SDK | package.json에 포함 |
| lucide-react | 아이콘 | package.json에 포함 |
| shadcn/ui Slider | 속도 조절 | 설치 필요 |
| shadcn/ui Select | 음성 선택 | 설치 필요 |

---

## 8. 성능 요구사항

| 메트릭 | 목표값 | 측정 방법 |
|--------|--------|----------|
| TTS 생성 지연시간 | < 2초 | API 응답 시간 |
| 오디오 시작 지연 | < 500ms | 재생 버튼 클릭부터 소리 출력까지 |
| 메모리 사용량 | < 50MB | 브라우저 DevTools |
| UI 반응 시간 | < 100ms | 버튼 클릭 응답 |

---

## 9. 보안 요구사항

| 요구사항 | 구현 방법 |
|----------|----------|
| API 키 보호 | 서버 사이드 API Route에서만 OpenAI 호출 |
| 입력 검증 | 텍스트 길이 및 형식 서버 사이드 검증 |
| Rate Limiting | 사용자별 요청 제한 (선택적) |

---

## 10. 참고 자료

- [OpenAI TTS API Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HTML5 Audio Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)
