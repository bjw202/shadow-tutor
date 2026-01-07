# SPEC-AUTOPLAY-001-FIX: 자동 재생 1회 후 멈춤 버그 수정

---
spec_id: SPEC-AUTOPLAY-001-FIX
title: 자동 재생 1회 후 멈춤 버그 수정
created: 2026-01-07
status: Implemented
priority: high
author: MoAI-ADK
lifecycle: bug-fix
parent_spec: SPEC-MODE-001-FIX
tags: [bugfix, auto-advance, audio-instance, continuous-mode, shadowing-mode]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 생성 및 구현 완료 |

---

## 1. 문제 설명 (Problem Statement)

### 1.1 현상

SPEC-MODE-001-FIX 적용 후, 자동 재생(연속 모드/쉐도잉 모드)이 **1회만 동작**하고 멈춤.

- 첫 번째 세그먼트 재생 완료 후 두 번째 세그먼트로 자동 진행
- 두 번째 세그먼트 재생 완료 후 **멈춤** (세 번째로 진행 안 됨)

### 1.2 예상 동작

```
Given: 5개의 세그먼트, 연속 모드 선택
When: 세그먼트 1 재생 완료
Then: 세그먼트 2 자동 재생

When: 세그먼트 2 재생 완료
Then: 세그먼트 3 자동 재생 (실제로는 멈춤!)

...계속해서 세그먼트 5까지 자동 진행
```

### 1.3 실제 동작

- 세그먼트 1 → 세그먼트 2: 자동 진행 O
- 세그먼트 2 → 세그먼트 3: 자동 진행 X (멈춤)

### 1.4 영향 범위

- **연속 모드 (Continuous)**: 1회만 동작
- **쉐도잉 모드 (Shadowing)**: 1회만 동작

---

## 2. 근본 원인 분석 (Root Cause Analysis)

### 2.1 핵심 문제: 두 개의 Audio 인스턴스

SPEC-MODE-001-FIX에서 제안한 수정 방법의 구조적 문제:

```
session/page.tsx:  useAudioPlayer()     → Audio 인스턴스 A (onSegmentEnd 없음)
AudioPlayer:       useAudioPlayer({...}) → Audio 인스턴스 B (onSegmentEnd 있음)
```

### 2.2 버그 발생 시퀀스

```
1. AudioPlayer의 Audio B에서 첫 번째 세그먼트 재생
2. 재생 종료 → Audio B의 handleEnded 호출 → onSegmentEnd 콜백 실행
3. handleAudioSegmentEnd → session/page.tsx의 nextSegment() 호출
4. nextSegment()는 Audio A의 함수! → Audio A에서 두 번째 세그먼트 재생
5. Audio A 재생 종료 → Audio A의 handleEnded 호출
6. Audio A에는 onSegmentEnd가 없음! → 콜백 호출 안 됨
7. 자동 진행 멈춤
```

### 2.3 코드 분석

**session/page.tsx (SPEC-MODE-001-FIX 적용 후):**
```typescript
// 문제: 두 개의 독립적인 useAudioPlayer 호출
const { nextSegment, play } = useAudioPlayer();  // Audio A
// ...
<AudioPlayer onSegmentEnd={handleAudioSegmentEnd} />  // 내부에서 Audio B 생성
```

**audio-player.tsx:**
```typescript
const { ... } = useAudioPlayer({ onSegmentEnd });  // Audio B
```

### 2.4 React 훅 동작 원리

`useAudioPlayer` 훅은 호출될 때마다 새로운 `audioRef`(Audio 인스턴스)를 생성합니다. 두 곳에서 호출하면 두 개의 독립적인 Audio 인스턴스가 존재하게 됩니다.

---

## 3. 수정 사항 (Changes Required)

### 3.1 설계 원칙

**Single Source of Truth**: 하나의 Audio 인스턴스만 사용

### 3.2 audio-player.tsx

**변경 내용**: 자동 진행 로직 내부화

```typescript
import { usePlaybackMode } from "@/lib/hooks/use-playback-mode";

interface AudioPlayerProps {
  className?: string;
  onReady?: (actions: { goToSegment: (index: number) => Promise<void> }) => void;
}

export function AudioPlayer({ className, onReady }: AudioPlayerProps) {
  const { handleSegmentEnd } = usePlaybackMode();
  const segments = usePracticeStore((state) => state.segments);

  // Refs to hold latest values for the callback
  const actionsRef = useRef<{
    nextSegment: () => Promise<void>;
    play: () => Promise<void>;
  } | null>(null);
  const currentIndexRef = useRef(0);

  // Internal segment end handler
  const handleInternalSegmentEnd = useCallback(() => {
    const isLastSegment = currentIndexRef.current >= segments.length - 1;
    if (isLastSegment) return;

    handleSegmentEnd(
      () => actionsRef.current?.nextSegment(),
      () => actionsRef.current?.play()
    );
  }, [segments.length, handleSegmentEnd]);

  const { currentIndex, nextSegment, play, goToSegment, ... } =
    useAudioPlayer({ onSegmentEnd: handleInternalSegmentEnd });

  // Keep refs updated
  useEffect(() => {
    actionsRef.current = { nextSegment, play };
  }, [nextSegment, play]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Expose goToSegment to parent
  useEffect(() => {
    onReady?.({ goToSegment });
  }, [goToSegment, onReady]);
}
```

### 3.3 session/page.tsx

**변경 내용**: 중복 `useAudioPlayer` 호출 제거

```typescript
export default function PracticeSessionPage() {
  const { currentSegmentIndex, setPlaybackSpeed, ... } = usePracticeStore();

  // Ref to hold goToSegment from AudioPlayer
  const audioActionsRef = useRef<{
    goToSegment: (index: number) => Promise<void>;
  } | null>(null);

  const handleAudioReady = useCallback(
    (actions: { goToSegment: (index: number) => Promise<void> }) => {
      audioActionsRef.current = actions;
    },
    []
  );

  const handleSegmentSelect = useCallback((index: number) => {
    audioActionsRef.current?.goToSegment(index);
  }, []);

  return (
    <>
      <AudioPlayer onReady={handleAudioReady} />
      <SegmentList
        currentIndex={currentSegmentIndex}
        onSelect={handleSegmentSelect}
      />
      <PlaybackSpeed onChange={setPlaybackSpeed} />
    </>
  );
}
```

---

## 4. 검증 기준 (Acceptance Criteria)

### 4.1 연속 모드 전체 자동 재생

```gherkin
Scenario: 연속 모드에서 끝까지 자동 재생
  Given 5개의 세그먼트가 있다
  And 연속 재생 모드가 선택되어 있다
  When 세그먼트 1의 재생을 시작한다
  Then 세그먼트 1 → 2 → 3 → 4 → 5까지 자동으로 재생되어야 한다
  And 세그먼트 5 재생 완료 후 정지되어야 한다
```

### 4.2 쉐도잉 모드 전체 자동 재생

```gherkin
Scenario: 쉐도잉 모드에서 끝까지 자동 재생
  Given 5개의 세그먼트가 있다
  And 쉐도잉 모드가 선택되어 있다
  And 반복 횟수가 2회로 설정되어 있다
  When 세그먼트 1의 재생을 시작한다
  Then 각 세그먼트가 2회씩 반복 후 다음으로 진행되어야 한다
  And 세그먼트 5까지 자동으로 진행되어야 한다
```

### 4.3 세그먼트 선택 동작 유지

```gherkin
Scenario: 세그먼트 목록에서 선택 시 해당 세그먼트 재생
  Given 세그먼트 목록이 표시되어 있다
  When 세그먼트 3을 클릭한다
  Then 세그먼트 3이 재생되어야 한다
  And 인디케이터가 3/5로 업데이트되어야 한다
```

---

## 5. 하위 호환성 (Backward Compatibility)

- `AudioPlayer` props 변경: `onSegmentEnd` → `onReady`
- `goToSegment` 함수는 `onReady` 콜백을 통해 노출
- 기존 동작은 모두 유지

---

## 6. 관련 파일

### 수정된 파일

- `src/components/practice/audio-player.tsx` - 자동 진행 로직 내부화
- `src/app/practice/session/page.tsx` - 중복 훅 호출 제거

### 변경 없음

- `src/lib/hooks/use-audio-player.ts` - 기존 유지
- `src/lib/hooks/use-playback-mode.ts` - 기존 유지
- `src/stores/practice-store.ts` - 기존 유지

---

## 7. 추적성 (Traceability)

### 부모 SPEC

- SPEC-MODE-001: 학습 모드 (연속/쉐도잉)
- SPEC-MODE-001-FIX: 연속 모드 자동 다음 문장 기능 버그 수정

### 관련 인수 조건

- SPEC-MODE-001 AC-002: 연속 모드 자동 진행
- SPEC-MODE-001 AC-003: 마지막 세그먼트 정지
- SPEC-MODE-001 AC-005: 쉐도잉 일시정지 타이머

---

## 8. 교훈 (Lessons Learned)

### 8.1 React 훅 공유 원칙

동일한 리소스(Audio, WebSocket 등)를 사용하는 훅은 **한 번만 호출**하고 결과를 공유해야 합니다.

```
나쁜 예: 여러 컴포넌트에서 같은 훅을 독립적으로 호출
좋은 예: Context 또는 콜백을 통해 훅 결과 공유
```

### 8.2 Single Source of Truth

- Audio 재생 상태는 하나의 인스턴스에서만 관리
- 부모 컴포넌트는 자식의 기능을 콜백으로 받아서 사용

### 8.3 Ref 패턴 활용

콜백 함수에서 최신 값을 참조해야 할 때는 `useRef`를 사용하여 클로저 문제를 해결합니다.
