---
id: SPEC-REPEAT-001-FIX
version: "2.0.0"
status: "implemented"
created: "2026-01-09"
updated: "2026-01-10"
author: "MoAI-ADK"
priority: "HIGH"
lifecycle: "spec-first"
tags:
  - bugfix
  - playback
  - repeat-count
  - settings-sync
  - voice
  - speed
---

## HISTORY

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2026-01-09 | 최초 작성 - 반복 횟수 버그 수정 SPEC | MoAI-ADK |
| 2.0.0 | 2026-01-10 | 실제 근본 원인 분석 및 추가 버그 통합 (설정 동기화 버그) | MoAI-ADK |

---

# SPEC-REPEAT-001-FIX: Play 페이지 설정 버그 수정

## 1. 개요

### 1.1 문제 설명

Play 페이지에서 다음과 같은 설정 관련 버그들이 발생했다:

**버그 1: 반복 횟수 미적용**
- **현상**: 설정에서 반복 횟수를 N으로 설정해도 1회만 재생됨
- **원인**: continuous 모드에서 반복 로직을 완전히 건너뜀

**버그 2: 속도 변경 UI 버그**
- **현상**: Play 페이지에서 속도 버튼 클릭 시 UI가 변경되지 않음
- **원인**: useSettingsSync가 settings-store 값으로 즉시 덮어씀

**버그 3: 음성 변경 UI 버그**
- **현상**: Play 페이지에서 음성 선택 시 변경되지 않음
- **원인**: settings-store가 업데이트되지 않아 동기화 훅이 원래 값으로 되돌림

### 1.2 근본 원인 분석

#### 1.2.1 반복 횟수 버그 (초기 분석 오류)

초기 분석에서 off-by-one 오류(`<` vs `<=`)로 추정했으나, TDD 테스트 결과 비교 로직은 정상이었다.

**실제 원인**: `use-playback-mode.ts`의 `handleSegmentEnd` 함수에서 continuous 모드일 때 모든 반복 로직을 건너뛰고 즉시 다음으로 이동:

```typescript
// 문제 코드 (BEFORE)
const handleSegmentEnd = React.useCallback(
  (onAdvance: () => void, onRepeat?: () => void) => {
    const state = usePracticeStore.getState();
    if (state.mode === "continuous") {
      onAdvance();  // 반복 로직 완전히 무시!
      return;
    }
    // shadowing 모드만 반복 로직 실행...
  }, []
);
```

#### 1.2.2 설정 동기화 버그

`useSettingsSync` 훅이 **단방향 동기화**만 수행하여, Play 페이지에서 변경한 값이 즉시 settings-store 값으로 덮어써졌다:

```typescript
// 문제 코드 (useSettingsSync)
useEffect(() => {
  if (speed !== playbackSpeed) {
    setPlaybackSpeed(speed);  // practice-store를 settings-store 값으로 덮어씀
  }
}, [speed, playbackSpeed, setPlaybackSpeed]);
```

### 1.3 영향 범위

| 파일 | 수정 내용 |
|------|-----------|
| `src/lib/hooks/use-playback-mode.ts` | continuous 모드에도 반복 로직 적용 |
| `src/app/practice/session/page.tsx` | 두 스토어 동시 업데이트 핸들러 추가 |

---

## 2. 환경 (Environment)

### 2.1 시스템 환경

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript 5.x |
| 상태관리 | Zustand |
| 테스트 | Vitest + React Testing Library |

### 2.2 관련 파일

| 파일 경로 | 역할 |
|-----------|------|
| `src/lib/hooks/use-playback-mode.ts` | 재생 모드 관리 훅 (수정됨) |
| `src/lib/hooks/use-settings-sync.ts` | 설정 동기화 훅 |
| `src/app/practice/session/page.tsx` | Play 세션 페이지 (수정됨) |
| `src/stores/practice-store.ts` | 연습 상태 저장소 |
| `src/stores/settings-store.ts` | 설정 저장소 |

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [A1] `repeatCount` 설정값은 항상 1 이상의 양의 정수이다
- [A2] `currentRepeat`는 0부터 시작하는 카운터이다
- [A3] continuous와 shadowing 모드는 동일한 반복 로직을 사용해야 한다

### 3.2 비즈니스 가정

- [A4] 사용자는 모드에 관계없이 설정한 횟수만큼 정확히 반복 재생되기를 기대한다
- [A5] Play 페이지에서 변경한 설정은 즉시 반영되어야 한다

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항

#### REQ-001: 모드 무관 반복 횟수 적용 (Ubiquitous)

> 시스템은 **항상** continuous/shadowing 모드에 관계없이 사용자가 설정한 반복 횟수(N)만큼 정확히 세그먼트를 재생해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트

#### REQ-002: 실시간 속도 변경 (Event-Driven)

> **WHEN** 사용자가 Play 페이지에서 재생 속도를 변경하면 **THEN** 시스템은 즉시 UI에 반영하고 재생에 적용해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트 + 수동 테스트

#### REQ-003: 실시간 음성 변경 (Event-Driven)

> **WHEN** 사용자가 Play 페이지에서 음성을 변경하면 **THEN** 시스템은 즉시 UI에 반영하고 다음 재생에 적용해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트 + 수동 테스트

#### REQ-004: 설정 저장소 동기화 (State-Driven)

> **WHILE** 사용자가 Play 페이지에서 설정을 변경하면 **THEN** practice-store와 settings-store가 동시에 업데이트되어야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트

### 4.2 비기능 요구사항

#### NFR-001: 기존 기능 호환성 (Ubiquitous)

> 시스템은 **항상** 기존 재생 기능에 영향을 주지 않아야 한다.

- 우선순위: HIGH
- 검증방법: 회귀 테스트 (742개 테스트 통과)

---

## 5. 명세 (Specifications)

### 5.1 수정 상세

#### 5.1.1 use-playback-mode.ts - handleSegmentEnd 수정

**BEFORE**:
```typescript
const handleSegmentEnd = React.useCallback(
  (onAdvance: () => void, onRepeat?: () => void) => {
    const state = usePracticeStore.getState();
    if (state.mode === "continuous") {
      onAdvance();  // 반복 로직 무시
      return;
    }
    // shadowing만 pause/repeat 로직 실행
    state.startPause();
  }, []
);
```

**AFTER**:
```typescript
const handleSegmentEnd = React.useCallback(
  (onAdvance: () => void, onRepeat?: () => void) => {
    const state = usePracticeStore.getState();
    callbacksRef.current.onAdvance = onAdvance;
    callbacksRef.current.onRepeat = onRepeat || null;
    // 두 모드 모두 pause/repeat 로직 사용
    state.startPause();
  }, []
);
```

#### 5.1.2 page.tsx - handleSpeedChange 추가

**BEFORE**:
```typescript
<PlaybackSpeed value={playbackSpeed} onChange={setPlaybackSpeed} />
```

**AFTER**:
```typescript
const handleSpeedChange = (speed: number) => {
  usePracticeStore.getState().setPlaybackSpeed(speed);
  useSettingsStore.getState().setSpeed(speed);
};

<PlaybackSpeed value={playbackSpeed} onChange={handleSpeedChange} />
```

#### 5.1.3 page.tsx - handleVoiceChange 수정

**BEFORE**:
```typescript
const handleVoiceChange = (voice: string) => {
  usePracticeStore.getState().setVoice(voice as VoiceOption);
};
```

**AFTER**:
```typescript
const handleVoiceChange = (voice: string) => {
  const voiceOption = voice as VoiceOption;
  usePracticeStore.getState().setVoice(voiceOption);
  useSettingsStore.getState().setVoice(voiceOption);
};
```

### 5.2 동작 설명

#### 반복 로직 (두 모드 공통)

| repeatCount | currentRepeat 변화 | 동작 |
|-------------|-------------------|------|
| 1 | 0 → 1 | pause → advance |
| 2 | 0 → 1 → 2 | pause → repeat → pause → advance |
| 3 | 0 → 1 → 2 → 3 | pause → repeat → pause → repeat → pause → advance |

#### 모드별 차이점

| 구분 | continuous | shadowing |
|------|------------|-----------|
| 반복 로직 | 동일 (pause/repeat) | 동일 (pause/repeat) |
| 마지막 반복 후 | **자동 advance** | autoAdvance 설정에 따름 |

### 5.3 테스트 시나리오

| 시나리오 ID | 설명 | 기대 결과 | 상태 |
|-------------|------|-----------|------|
| TC-001 | continuous 모드 repeatCount=1 | 1회 재생 후 다음 | PASS |
| TC-002 | continuous 모드 repeatCount=2 | 2회 재생 후 다음 | PASS |
| TC-003 | 속도 버튼 클릭 | UI 즉시 변경 | PASS |
| TC-004 | 음성 선택 변경 | UI 즉시 변경 | PASS |
| TC-005 | 두 스토어 동시 업데이트 | 동기화 충돌 없음 | PASS |

---

## 6. 추적성 (Traceability)

### 6.1 관련 문서

| 문서 | 설명 |
|------|------|
| [plan.md](./plan.md) | 구현 계획 |
| [acceptance.md](./acceptance.md) | 인수 조건 |

### 6.2 관련 SPEC

| SPEC ID | 관계 | 설명 |
|---------|------|------|
| SPEC-PLAYBACK-001-FIX | 관련 | 재생 속도 프리셋 변경 |

### 6.3 수정된 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/lib/hooks/use-playback-mode.ts` | Modified | continuous 모드 반복 로직 적용 |
| `src/app/practice/session/page.tsx` | Modified | 두 스토어 동시 업데이트 |
| `src/__tests__/unit/lib/hooks/use-playback-mode.test.ts` | Modified | continuous 모드 테스트 업데이트 |
| `src/__tests__/unit/app/practice/session/page.test.tsx` | Modified | 설정 동기화 테스트 추가 |

---

## 7. 용어 정의

| 용어 | 정의 |
|------|------|
| repeatCount | 사용자가 설정한 세그먼트 반복 재생 횟수 |
| currentRepeat | 현재까지 진행된 반복 횟수 카운터 (0부터 시작) |
| useSettingsSync | settings-store를 practice-store로 동기화하는 훅 |
| continuous mode | 연속 재생 모드 (반복 후 자동 이동) |
| shadowing mode | 쉐도잉 모드 (반복 후 autoAdvance 설정에 따름) |
