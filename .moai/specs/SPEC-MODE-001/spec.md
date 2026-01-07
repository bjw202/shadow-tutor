---
id: SPEC-MODE-001
version: "1.1.0"
status: "implemented"
created: "2026-01-07"
updated: "2026-01-07"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-MODE-001: 학습 모드 (연속/쉐도잉) 구현

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 작성 |
| 1.1.0 | 2026-01-07 | MoAI-ADK | 구현 완료 (테스트 커버리지 95.95%) |

---

## 개요

### 목적

Shadow Tutor 애플리케이션에 두 가지 학습 모드를 구현합니다:

1. **연속 재생 모드 (Continuous Mode)**: 세그먼트가 자동으로 연속 재생되어 전체 콘텐츠를 들을 수 있습니다.
2. **쉐도잉 모드 (Shadowing Mode)**: 각 세그먼트 재생 후 사용자가 따라 말할 수 있도록 일시정지되며, 설정 가능한 타이머와 반복 횟수를 제공합니다.

### 범위

#### In Scope

- 학습 모드 선택 UI (연속/쉐도잉)
- 연속 재생 모드: 자동 세그먼트 전환
- 쉐도잉 모드: 일시정지 타이머, 반복 횟수 설정
- 모드별 설정 저장 (localStorage)
- 모바일 반응형 UI
- 접근성 (WCAG 2.1 AA) 준수

#### Out of Scope

- 음성 녹음 및 분석 기능
- AI 기반 발음 평가
- 클라우드 동기화
- 다중 사용자 프로필

---

## EARS 요구사항

### UR (Ubiquitous Requirements) - 항상 활성화

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** 현재 학습 모드를 명확히 표시해야 한다 |
| UR-002 | 시스템은 **항상** 모드별 설정을 localStorage에 유지해야 한다 |
| UR-003 | 시스템은 **항상** 44px 이상의 모바일 터치 타겟을 제공해야 한다 |
| UR-004 | 시스템은 **항상** 접근성(WCAG 2.1 AA)을 준수해야 한다 |
| UR-005 | 시스템은 **항상** 모드 전환 시 오디오 상태를 초기화해야 한다 |

### ED (Event-Driven Requirements) - 이벤트 기반

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 사용자가 연속 재생 모드를 선택할 때 **THEN** 모드가 전환되어야 한다 |
| ED-002 | **WHEN** 사용자가 쉐도잉 모드를 선택할 때 **THEN** 모드가 전환되어야 한다 |
| ED-003 | **WHEN** 연속 모드에서 세그먼트 재생이 완료될 때 **THEN** 다음 세그먼트가 자동 재생되어야 한다 |
| ED-004 | **WHEN** 쉐도잉 모드에서 세그먼트 재생이 완료될 때 **THEN** 일시정지 타이머가 시작되어야 한다 |
| ED-005 | **WHEN** 쉐도잉 타이머가 완료될 때 **THEN** 다음 세그먼트가 재생되어야 한다 (자동 진행 시) |
| ED-006 | **WHEN** 사용자가 "건너뛰기" 버튼을 클릭할 때 **THEN** 타이머가 즉시 종료되어야 한다 |
| ED-007 | **WHEN** 사용자가 일시정지 시간을 변경할 때 **THEN** 설정이 저장되어야 한다 |
| ED-008 | **WHEN** 사용자가 반복 횟수를 변경할 때 **THEN** 설정이 저장되어야 한다 |
| ED-009 | **WHEN** 연속 모드에서 마지막 세그먼트가 완료될 때 **THEN** 재생이 정지되어야 한다 |
| ED-010 | **WHEN** 쉐도잉 모드에서 반복 횟수를 채울 때 **THEN** 다음 세그먼트로 이동해야 한다 |

### SD (State-Driven Requirements) - 상태 기반

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 연속 재생 모드이면 **THEN** 세그먼트 간 자동 전환이 활성화되어야 한다 |
| SD-002 | **IF** 쉐도잉 모드이면 **THEN** 세그먼트 후 일시정지 UI가 표시되어야 한다 |
| SD-003 | **IF** 쉐도잉 일시정지 중이면 **THEN** 카운트다운 타이머가 표시되어야 한다 |
| SD-004 | **IF** 자동 진행이 비활성화이면 **THEN** "다음" 버튼이 강조되어야 한다 |
| SD-005 | **IF** 현재 반복 횟수가 설정값 미만이면 **THEN** 같은 세그먼트를 반복해야 한다 |
| SD-006 | **IF** 모바일 화면이면 **THEN** 설정 패널이 접힌 상태로 표시되어야 한다 |
| SD-007 | **IF** 오디오가 로딩 중이면 **THEN** 모드 전환이 비활성화되어야 한다 |
| SD-008 | **IF** 세션이 없으면 **THEN** 모드 선택기가 비활성화되어야 한다 |

### UB (Unwanted Behavior) - 금지 동작

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 모드 전환 중 오디오를 **끊기지 않게 해야 한다** |
| UB-002 | 시스템은 타이머 중 다른 세그먼트로의 **수동 전환을 막지 않아야 한다** |
| UB-003 | 시스템은 쉐도잉 일시정지 중 **볼륨 조절을 차단하지 않아야 한다** |
| UB-004 | 시스템은 페이지 이탈 시 설정을 **손실하지 않아야 한다** |

### OF (Optional Features) - 선택 기능

| ID | 요구사항 |
|----|----------|
| OF-001 | **가능하면** 반복 횟수별 진행 상황을 표시해야 한다 |
| OF-002 | **가능하면** 학습 세션 통계를 저장해야 한다 |
| OF-003 | **가능하면** 모드별 단축키를 지원해야 한다 |

---

## 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| 프레임워크 | Next.js | 15.x |
| 언어 | TypeScript | 5.x |
| 상태 관리 | Zustand | 5.x |
| UI 컴포넌트 | shadcn/ui | latest |
| 스타일링 | Tailwind CSS | 3.x |
| 테스트 | Vitest + Testing Library | latest |

---

## 컴포넌트 구조

```
src/
├── components/
│   ├── practice/
│   │   ├── ModeSelector.tsx        # 모드 선택 UI (연속/쉐도잉)
│   │   ├── ContinuousPlayer.tsx    # 연속 재생 로직
│   │   ├── ShadowingPlayer.tsx     # 쉐도잉 모드 로직
│   │   ├── ShadowingTimer.tsx      # 카운트다운 타이머
│   │   ├── ShadowingSettings.tsx   # 쉐도잉 설정 패널
│   │   └── RepeatProgress.tsx      # 반복 진행률 표시
│   └── ui/
│       └── ... (기존 shadcn 컴포넌트)
├── hooks/
│   └── usePlaybackMode.ts          # 모드 관리 훅
├── stores/
│   └── practice-store.ts           # 연습 상태 (확장)
└── types/
    └── practice.ts                 # 타입 정의
```

---

## 상태 관리

### 타입 정의

```typescript
// types/practice.ts
export type PlaybackMode = 'continuous' | 'shadowing';

export interface ShadowingSettings {
  pauseDuration: number;      // 일시정지 시간 (초), 기본값: 5
  repeatCount: number;        // 반복 횟수, 기본값: 1
  autoAdvance: boolean;       // 자동 진행 여부, 기본값: true
}

export interface PracticeState {
  // 기존 상태
  mode: PlaybackMode;
  shadowingSettings: ShadowingSettings;
  currentRepeat: number;      // 현재 반복 횟수
  isPaused: boolean;          // 쉐도잉 일시정지 상태
  remainingTime: number;      // 남은 타이머 시간

  // 액션
  setMode: (mode: PlaybackMode) => void;
  updateShadowingSettings: (settings: Partial<ShadowingSettings>) => void;
  startPause: () => void;
  skipPause: () => void;
  incrementRepeat: () => void;
  resetRepeat: () => void;
}
```

---

## 의존성

### 내부 의존성

| 컴포넌트 | 의존 대상 | 설명 |
|----------|-----------|------|
| ModeSelector | practice-store | 모드 상태 읽기/쓰기 |
| ShadowingPlayer | AudioPlayer | 기존 오디오 플레이어 활용 |
| ShadowingTimer | practice-store | 타이머 상태 관리 |

### 외부 의존성

| 패키지 | 용도 |
|--------|------|
| zustand | 상태 관리 |
| @radix-ui/react-tabs | 모드 탭 UI |
| @radix-ui/react-slider | 설정 슬라이더 |

---

## 성능 요구사항

| 메트릭 | 목표값 |
|--------|--------|
| 모드 전환 응답 시간 | < 100ms |
| 타이머 정확도 | 오차 < 100ms |
| 설정 저장 지연 | < 50ms |
| 메모리 사용량 증가 | < 5MB |

---

## 접근성 요구사항 (WCAG 2.1 AA)

| 요구사항 | 구현 방법 |
|----------|-----------|
| 키보드 접근성 | Tab 네비게이션, Enter/Space 활성화 |
| 스크린 리더 | aria-label, aria-live 영역 |
| 색상 대비 | 최소 4.5:1 비율 |
| 포커스 표시 | 명확한 포커스 링 |
| 모션 감소 | prefers-reduced-motion 지원 |

---

## 추적성 태그

- **관련 SPEC**: SPEC-PLAYER-001 (오디오 플레이어), SPEC-TTS-001 (TTS 재생)
- **영향 받는 파일**: `src/stores/practice-store.ts`, `src/components/practice/*`
- **테스트 커버리지 목표**: >= 85%
