# SPEC-MODE-001-FIX: 구현 계획

---
spec_id: SPEC-MODE-001-FIX
title: 연속 모드 자동 다음 문장 기능 버그 수정 - 구현 계획
created: 2026-01-07
status: Implemented
author: MoAI-ADK
tags: [bugfix, continuous-mode, auto-advance, implementation-plan]
---

## 1. 구현 개요

### 1.1 목표

연속 모드에서 세그먼트 재생 완료 시 자동으로 다음 세그먼트로 진행하도록 수정

### 1.2 범위

- `use-audio-player.ts`에 `onSegmentEnd` 콜백 옵션 추가
- `audio-player.tsx`에 `onSegmentEnd` props 추가
- `practice/session/page.tsx`에서 `usePlaybackMode` 훅 연결

---

## 2. 수정 대상 파일

| 파일 | 작업 | 우선순위 |
|------|------|----------|
| `src/lib/hooks/use-audio-player.ts` | `onSegmentEnd` 콜백 옵션 추가 | High |
| `src/components/practice/audio-player.tsx` | `onSegmentEnd` props 추가 | High |
| `src/app/practice/session/page.tsx` | `usePlaybackMode` 훅 연결 | High |
| `src/__tests__/unit/lib/hooks/use-audio-player.test.ts` | 테스트 추가 | Medium |

---

## 3. 구현 단계

### Phase 1: use-audio-player.ts 수정

- [x] `UseAudioPlayerOptions` 인터페이스 추가
- [x] `onSegmentEnd` 콜백 파라미터 추가
- [x] `onSegmentEndRef` 생성 (이벤트 리스너 재생성 방지)
- [x] `handleEnded` 함수에서 콜백 호출

### Phase 2: audio-player.tsx 수정

- [x] `AudioPlayerProps`에 `onSegmentEnd` 추가
- [x] `useAudioPlayer({ onSegmentEnd })` 호출

### Phase 3: practice/session/page.tsx 수정

- [x] `usePlaybackMode` import 추가
- [x] `useCallback` import 추가
- [x] `handleAudioSegmentEnd` 콜백 생성
- [x] `AudioPlayer`에 `onSegmentEnd` 전달
- [x] 마지막 세그먼트 처리 (AC-003)

### Phase 4: 테스트 추가

- [x] `use-audio-player.test.ts`에 `onSegmentEnd` 테스트 추가
- [x] 기존 테스트 통과 확인 (625/625 통과)
- [x] 커버리지 85% 이상 유지

### Phase 5: 품질 검증

- [x] TypeScript 타입 체크 통과
- [x] ESLint 통과
- [x] 수동 테스트: 연속 모드 자동 진행 확인
- [x] 수동 테스트: 쉐도잉 모드 기존 동작 확인

---

## 4. 기술적 구현 세부사항

### 4.1 use-audio-player.ts 변경

```typescript
// 추가할 인터페이스
export interface UseAudioPlayerOptions {
  onSegmentEnd?: () => void;
}

// 함수 시그니처 변경
export function useAudioPlayer(
  options?: UseAudioPlayerOptions
): UseAudioPlayerReturn {
  const { onSegmentEnd } = options ?? {};

  // Ref로 저장하여 이벤트 리스너 재생성 방지
  const onSegmentEndRef = useRef(onSegmentEnd);
  useEffect(() => {
    onSegmentEndRef.current = onSegmentEnd;
  }, [onSegmentEnd]);

  // handleEnded 수정
  const handleEnded = () => {
    setPlaybackState("stopped");
    onSegmentEndRef.current?.();
  };
}
```

### 4.2 practice/session/page.tsx 변경

```typescript
const handleAudioSegmentEnd = useCallback(() => {
  const totalSegments = segments.length;
  const isLastSegment = currentIndex >= totalSegments - 1;

  // AC-003: 마지막 세그먼트에서 정지
  if (isLastSegment) {
    return;
  }

  // 모드별 처리
  handleSegmentEnd(
    () => nextSegment(), // 연속 모드: 즉시 진행
    () => play()         // 쉐도잉 모드: 반복 재생
  );
}, [currentIndex, segments.length, handleSegmentEnd, nextSegment, play]);
```

---

## 5. 테스트 전략

### 5.1 단위 테스트

**use-audio-player.test.ts**:
- `onSegmentEnd` 콜백이 오디오 종료 시 호출되는지 확인
- `onSegmentEnd` 미제공 시 기존 동작 유지 확인

### 5.2 통합 테스트

- 연속 모드에서 자동 진행 확인
- 마지막 세그먼트에서 정지 확인
- 쉐도잉 모드 기존 동작 유지 확인

---

## 6. 리스크 분석

| 리스크 | 가능성 | 영향도 | 완화 방안 |
|--------|--------|--------|-----------|
| 쉐도잉 모드 영향 | Low | High | 기존 테스트 통과 확인 |
| 무한 루프 | Low | High | 마지막 세그먼트 체크 로직 추가 |
| 이벤트 리스너 누수 | Low | Medium | useRef 패턴 사용 |

---

## 7. 완료 기준

- [x] Phase 1-3 코드 수정 완료
- [x] Phase 4 테스트 추가 완료
- [x] Phase 5 품질 검증 통과
- [x] Git 커밋 완료 (a7f9bc4)
- [x] SPEC 문서 동기화

---

## 8. 구현 결과

**상태**: Implemented (완료)

**완료된 작업**:
1. `use-audio-player.ts` - `onSegmentEnd` 콜백 옵션 추가 완료
2. `audio-player.tsx` - `onSegmentEnd` props 추가 완료
3. `practice/session/page.tsx` - `usePlaybackMode` 훅 연결 완료
4. 테스트 625개 전체 통과
5. TypeScript, ESLint 검증 통과
6. Git 커밋 완료

**구현 결과**:
- 연속 모드에서 세그먼트 완료 시 자동으로 다음 세그먼트 재생
- 마지막 세그먼트에서 정지 (AC-003)
- 쉐도잉 모드 기존 동작 유지

**커밋 정보**:
- SHA: a7f9bc4
- 메시지: fix(mode): implement SPEC-MODE-001-FIX auto-advance in continuous mode
