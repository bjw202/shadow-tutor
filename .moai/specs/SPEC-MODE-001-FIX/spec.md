# SPEC-MODE-001-FIX: 연속 모드 자동 다음 문장 기능 버그 수정

---
spec_id: SPEC-MODE-001-FIX
title: 연속 모드 자동 다음 문장 기능 버그 수정
created: 2026-01-07
status: Implemented
priority: high
author: MoAI-ADK
lifecycle: bug-fix
parent_spec: SPEC-MODE-001
tags: [bugfix, continuous-mode, auto-advance, audio-player]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 생성 |

---

## 1. 문제 설명 (Problem Statement)

### 1.1 현상

"/practice/session" 페이지에서 **연속 모드(Continuous Mode)** 세그먼트 재생 완료 시 자동으로 다음 문장으로 넘어가지 않음.

### 1.2 예상 동작 (SPEC-MODE-001 AC-002)

```
Given: 연속 재생 모드 선택, 세그먼트 2/5 재생 중
When: 세그먼트 2 재생 완료
Then: 세그먼트 3 자동 재생, 인디케이터 3/5 업데이트
```

### 1.3 실제 동작

- 세그먼트 재생 완료 시 playbackState가 "stopped"로 변경됨
- 다음 세그먼트로 자동 진행하지 않음
- 사용자가 수동으로 Next 버튼을 클릭해야 함

### 1.4 영향 범위

- **연속 모드 (Continuous)**: 미동작 (버그)
- **쉐도잉 모드 (Shadowing)**: 정상 동작 (타이머 + 반복 + 자동 진행)

---

## 2. 근본 원인 분석 (Root Cause Analysis)

### 2.1 코드 흐름 분석

```
현재 흐름:
use-audio-player.ts → handleEnded() → setPlaybackState("stopped") → 종료

필요한 흐름:
use-audio-player.ts → handleEnded() → setPlaybackState("stopped")
                                     → handleSegmentEnd() 호출
                                     → 모드별 처리 (연속: 즉시 진행 / 쉐도잉: 타이머)
```

### 2.2 누락된 연결

| 파일 | 상태 | 문제 |
|------|------|------|
| `use-playback-mode.ts` | 구현됨 | `handleSegmentEnd()` 함수 완벽 구현 |
| `use-audio-player.ts` | 미연결 | 오디오 종료 이벤트에서 콜백 호출 없음 |
| `practice/session/page.tsx` | 미연결 | `usePlaybackMode` 훅 미사용 |

### 2.3 기존 구현 분석

**use-playback-mode.ts (line 104-120)**:
```typescript
const handleSegmentEnd = React.useCallback(
  (onAdvance: () => void, onRepeat?: () => void) => {
    const state = usePracticeStore.getState();

    if (state.mode === "continuous") {
      // In continuous mode, advance immediately
      onAdvance();
      return;
    }

    // In shadowing mode, start pause
    callbacksRef.current.onAdvance = onAdvance;
    callbacksRef.current.onRepeat = onRepeat || null;
    state.startPause();
  },
  []
);
```

이 로직은 이미 구현되어 있으나, 호출되지 않고 있음.

---

## 3. 수정 사항 (Changes Required)

### 3.1 use-audio-player.ts

**변경 내용**: `onSegmentEnd` 콜백 옵션 추가

```typescript
// 추가할 인터페이스
export interface UseAudioPlayerOptions {
  onSegmentEnd?: () => void;
}

// 함수 시그니처 변경
export function useAudioPlayer(options?: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const { onSegmentEnd } = options ?? {};

  // handleEnded 수정
  const handleEnded = () => {
    setPlaybackState("stopped");
    onSegmentEnd?.();  // 콜백 호출 추가
  };
}
```

### 3.2 audio-player.tsx

**변경 내용**: `onSegmentEnd` props 추가

```typescript
interface AudioPlayerProps {
  className?: string;
  onSegmentEnd?: () => void;  // 추가
}

export function AudioPlayer({ className, onSegmentEnd }: AudioPlayerProps) {
  // useAudioPlayer에 옵션 전달
  const { ... } = useAudioPlayer({ onSegmentEnd });
}
```

### 3.3 practice/session/page.tsx

**변경 내용**: `usePlaybackMode` 훅 연결

```typescript
import { usePlaybackMode } from "@/lib/hooks/use-playback-mode";

export default function PracticeSessionPage() {
  const { handleSegmentEnd } = usePlaybackMode();
  const { nextSegment, play } = useAudioPlayer();

  const handleAudioSegmentEnd = useCallback(() => {
    if (currentIndex >= segments.length - 1) return; // AC-003

    handleSegmentEnd(
      () => nextSegment(), // onAdvance
      () => play()         // onRepeat
    );
  }, [currentIndex, segments.length, handleSegmentEnd, nextSegment, play]);

  return (
    <AudioPlayer onSegmentEnd={handleAudioSegmentEnd} />
  );
}
```

---

## 4. 검증 기준 (Acceptance Criteria)

### 4.1 연속 모드 자동 진행 (AC-002 재검증)

```gherkin
Scenario: 연속 모드에서 자동으로 다음 세그먼트로 진행
  Given 연속 재생 모드가 선택되어 있다
  And 세그먼트 2/5를 재생 중이다
  When 세그먼트 2의 재생이 완료된다
  Then 세그먼트 3이 자동으로 재생되어야 한다
  And 인디케이터가 3/5로 업데이트되어야 한다
```

### 4.2 마지막 세그먼트 정지 (AC-003)

```gherkin
Scenario: 마지막 세그먼트에서 정지
  Given 연속 재생 모드가 선택되어 있다
  And 마지막 세그먼트 5/5를 재생 중이다
  When 세그먼트 5의 재생이 완료된다
  Then 재생이 정지되어야 한다
  And 다음 세그먼트로 진행하지 않아야 한다
```

### 4.3 쉐도잉 모드 영향 없음

```gherkin
Scenario: 쉐도잉 모드 기존 동작 유지
  Given 쉐도잉 모드가 선택되어 있다
  And 일시정지 시간이 5초로 설정되어 있다
  When 세그먼트 재생이 완료된다
  Then 5초 카운트다운 타이머가 표시되어야 한다
  And 기존과 동일하게 동작해야 한다
```

---

## 5. 하위 호환성 (Backward Compatibility)

- `useAudioPlayer()` 기존 호출은 파라미터 없이 동작 유지
- `AudioPlayer` 기존 사용 시 `onSegmentEnd` 생략 가능
- 쉐도잉 모드 기존 동작에 영향 없음

---

## 6. 관련 파일

- `src/lib/hooks/use-audio-player.ts` - 수정 대상
- `src/components/practice/audio-player.tsx` - 수정 대상
- `src/app/practice/session/page.tsx` - 수정 대상
- `src/lib/hooks/use-playback-mode.ts` - 기존 로직 활용 (수정 불필요)
- `src/__tests__/unit/lib/hooks/use-audio-player.test.ts` - 테스트 추가

---

## 7. 추적성 (Traceability)

### 부모 SPEC

- SPEC-MODE-001: 학습 모드 (연속/쉐도잉)

### 관련 인수 조건

- SPEC-MODE-001 AC-002: 연속 모드 자동 진행
- SPEC-MODE-001 AC-003: 마지막 세그먼트 정지
- SPEC-MODE-001 AC-005: 쉐도잉 일시정지 타이머
