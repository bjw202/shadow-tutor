---
id: SPEC-MODE-001
title: "학습 모드 구현 계획"
status: "implemented"
created: "2026-01-07"
updated: "2026-01-07"
---

# SPEC-MODE-001: 학습 모드 구현 계획

## 추적성

- **SPEC 문서**: [spec.md](./spec.md)
- **인수 조건**: [acceptance.md](./acceptance.md)

---

## 구현 마일스톤

### Phase 1: 기반 구축 (Primary Goal)

**목표**: 모드 상태 관리 및 기본 UI 구성

| 작업 | 설명 | 파일 |
|------|------|------|
| 1.1 | 타입 정의 확장 | `src/types/practice.ts` |
| 1.2 | practice-store 확장 | `src/stores/practice-store.ts` |
| 1.3 | ModeSelector 컴포넌트 | `src/components/practice/ModeSelector.tsx` |
| 1.4 | localStorage 동기화 | `src/stores/practice-store.ts` |

**완료 조건**:
- 모드 전환이 정상 동작
- 설정이 localStorage에 저장됨
- 기본 UI 렌더링 완료

---

### Phase 2: 연속 재생 모드 (Primary Goal)

**목표**: 세그먼트 자동 전환 구현

| 작업 | 설명 | 파일 |
|------|------|------|
| 2.1 | ContinuousPlayer 로직 | `src/components/practice/ContinuousPlayer.tsx` |
| 2.2 | 세그먼트 완료 이벤트 처리 | `src/hooks/usePlaybackMode.ts` |
| 2.3 | 마지막 세그먼트 처리 | `src/hooks/usePlaybackMode.ts` |

**완료 조건**:
- 세그먼트가 자동으로 다음으로 전환
- 마지막 세그먼트에서 재생 정지
- 수동 조작과 충돌 없음

---

### Phase 3: 쉐도잉 모드 (Secondary Goal)

**목표**: 쉐도잉 기능 완전 구현

| 작업 | 설명 | 파일 |
|------|------|------|
| 3.1 | ShadowingPlayer 로직 | `src/components/practice/ShadowingPlayer.tsx` |
| 3.2 | ShadowingTimer 구현 | `src/components/practice/ShadowingTimer.tsx` |
| 3.3 | ShadowingSettings 패널 | `src/components/practice/ShadowingSettings.tsx` |
| 3.4 | 반복 횟수 로직 | `src/hooks/usePlaybackMode.ts` |
| 3.5 | 건너뛰기 기능 | `src/components/practice/ShadowingTimer.tsx` |

**완료 조건**:
- 세그먼트 후 타이머 시작
- 카운트다운 UI 표시
- 반복 횟수 동작 정상
- 건너뛰기 버튼 동작

---

### Phase 4: 마무리 및 최적화 (Final Goal)

**목표**: 접근성, 반응형, 최적화

| 작업 | 설명 | 파일 |
|------|------|------|
| 4.1 | RepeatProgress 컴포넌트 | `src/components/practice/RepeatProgress.tsx` |
| 4.2 | 접근성 개선 | 모든 컴포넌트 |
| 4.3 | 모바일 반응형 UI | 모든 컴포넌트 |
| 4.4 | 테스트 작성 | `src/__tests__/practice/*` |
| 4.5 | 성능 최적화 | 해당 컴포넌트 |

**완료 조건**:
- WCAG 2.1 AA 준수
- 모바일에서 정상 동작
- 테스트 커버리지 >= 85%

---

## 컴포넌트 구현 상세

### 1. ModeSelector

**역할**: 연속/쉐도잉 모드 전환 UI

```typescript
interface ModeSelectorProps {
  disabled?: boolean;
}

// 기능
// - Tabs UI로 모드 선택
// - 현재 모드 시각적 표시
// - 비활성화 상태 지원 (오디오 로딩 중)
```

**구현 포인트**:
- shadcn/ui Tabs 컴포넌트 활용
- aria-label로 접근성 확보
- 아이콘으로 모드 구분

---

### 2. ContinuousPlayer

**역할**: 연속 재생 모드 로직 래퍼

```typescript
interface ContinuousPlayerProps {
  onSegmentEnd: () => void;
  isLastSegment: boolean;
}

// 기능
// - 세그먼트 종료 시 다음 세그먼트 트리거
// - 마지막 세그먼트 시 재생 정지
```

**구현 포인트**:
- 기존 AudioPlayer의 onEnded 이벤트 활용
- 세그먼트 인덱스 관리

---

### 3. ShadowingPlayer

**역할**: 쉐도잉 모드 로직 래퍼

```typescript
interface ShadowingPlayerProps {
  settings: ShadowingSettings;
  onComplete: () => void;
}

// 기능
// - 세그먼트 종료 시 타이머 시작
// - 반복 횟수 관리
// - 타이머/건너뛰기 후 다음 진행
```

---

### 4. ShadowingTimer

**역할**: 카운트다운 타이머 UI

```typescript
interface ShadowingTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

// 기능
// - 원형 프로그레스 표시
// - 남은 시간 숫자 표시
// - 건너뛰기 버튼
```

**구현 포인트**:
- requestAnimationFrame으로 부드러운 애니메이션
- prefers-reduced-motion 지원

---

### 5. ShadowingSettings

**역할**: 쉐도잉 설정 패널

```typescript
interface ShadowingSettingsProps {
  settings: ShadowingSettings;
  onChange: (settings: Partial<ShadowingSettings>) => void;
}

// 설정 항목
// - 일시정지 시간: 1-30초 (슬라이더)
// - 반복 횟수: 1-10회 (스테퍼)
// - 자동 진행: on/off (스위치)
```

---

### 6. RepeatProgress (Optional)

**역할**: 반복 진행률 표시

```typescript
interface RepeatProgressProps {
  current: number;
  total: number;
}

// 기능
// - 현재/전체 반복 횟수 표시
// - 시각적 진행률 바
```

---

## 상태 관리 확장

### practice-store 추가 상태

```typescript
// 기존 상태에 추가
interface PracticeStore {
  // 모드 관련
  mode: PlaybackMode;
  shadowingSettings: ShadowingSettings;

  // 쉐도잉 상태
  currentRepeat: number;
  isPaused: boolean;
  remainingTime: number;

  // 액션
  setMode: (mode: PlaybackMode) => void;
  updateShadowingSettings: (settings: Partial<ShadowingSettings>) => void;
  startPause: () => void;
  skipPause: () => void;
  incrementRepeat: () => void;
  resetRepeat: () => void;
}
```

### localStorage 키

- `shadow-tutor:playback-mode`: 현재 모드
- `shadow-tutor:shadowing-settings`: 쉐도잉 설정

---

## 훅 구현

### usePlaybackMode

```typescript
function usePlaybackMode() {
  const { mode, shadowingSettings, ... } = usePracticeStore();

  // 세그먼트 완료 핸들러
  const handleSegmentEnd = useCallback(() => {
    if (mode === 'continuous') {
      // 다음 세그먼트로 자동 이동
    } else {
      // 쉐도잉: 타이머 시작
    }
  }, [mode]);

  // 타이머 완료 핸들러
  const handleTimerEnd = useCallback(() => {
    // 반복 횟수 확인 후 처리
  }, []);

  return {
    mode,
    handleSegmentEnd,
    handleTimerEnd,
    ...
  };
}
```

---

## 테스트 전략

### 단위 테스트

| 대상 | 테스트 케이스 |
|------|--------------|
| practice-store | 모드 전환, 설정 변경, 상태 초기화 |
| usePlaybackMode | 세그먼트 완료 처리, 타이머 로직 |
| ModeSelector | 렌더링, 클릭 이벤트, 비활성화 |
| ShadowingTimer | 카운트다운, 건너뛰기, 완료 콜백 |

### 통합 테스트

| 시나리오 | 설명 |
|----------|------|
| 연속 모드 플로우 | 모드 선택 -> 재생 -> 자동 전환 -> 종료 |
| 쉐도잉 모드 플로우 | 모드 선택 -> 재생 -> 타이머 -> 반복 -> 완료 |
| 설정 저장 | 설정 변경 -> 페이지 새로고침 -> 설정 유지 |

---

## 위험 요소 및 완화 전략

| 위험 요소 | 영향도 | 완화 전략 |
|-----------|--------|-----------|
| 타이머 정확도 | 중간 | requestAnimationFrame 대신 setInterval + 보정 |
| 상태 동기화 | 높음 | Zustand persist 미들웨어 활용 |
| 오디오 이벤트 누락 | 높음 | 다중 이벤트 리스너 + 폴백 |
| 모바일 백그라운드 | 중간 | visibilitychange 이벤트 처리 |
| 접근성 누락 | 중간 | 개발 중 axe-core 검증 |

---

## 추적성

- **관련 SPEC**: SPEC-MODE-001
- **의존 SPEC**: SPEC-PLAYER-001, SPEC-TTS-001
- **다음 단계**: `/moai:2-run SPEC-MODE-001`
