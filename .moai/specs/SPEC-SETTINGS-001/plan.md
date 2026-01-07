# SPEC-SETTINGS-001: Implementation Plan

---
spec_id: SPEC-SETTINGS-001
version: 1.0.0
status: completed
created: 2026-01-07
updated: 2026-01-07
completed: 2026-01-07
---

## 1. Overview

### 1.1 구현 목표

Shadow Tutor 앱에 전용 설정 페이지(/settings)를 추가하여 TTS 음성, 재생 속도, 볼륨, 쉐도잉 모드 설정을 통합 관리하고 localStorage에 영속화한다.

### 1.2 구현 원칙

- **재사용 우선**: 기존 practice 컴포넌트 최대 활용
- **단일 책임**: 각 컴포넌트는 하나의 설정 그룹만 담당
- **Mobile-First**: 모바일 레이아웃 우선 개발
- **테스트 주도**: TDD 방식으로 개발

---

## 2. Implementation Phases

### Phase 1: Foundation Setup (Primary Goal)

타입 정의, 상수 정의, settings store 생성

#### 작업 목록

| Task ID | 작업 | 파일 | 의존성 |
|---------|------|------|--------|
| T1.1 | Settings 타입 정의 | `src/types/settings.ts` | 없음 |
| T1.2 | Settings 상수 정의 | `src/lib/constants/settings.ts` | T1.1 |
| T1.3 | Settings Store 구현 | `src/stores/settings-store.ts` | T1.1, T1.2 |
| T1.4 | Settings Store 테스트 | `src/__tests__/stores/settings-store.test.ts` | T1.3 |
| T1.5 | Types index 업데이트 | `src/types/index.ts` | T1.1 |

#### T1.1 상세: Settings 타입 정의

```typescript
// src/types/settings.ts
import type { VoiceOption } from "./audio";

export interface TTSSettings {
  voice: VoiceOption;
  speed: number;
  volume: number;
  isMuted: boolean;
}

export interface ShadowingPreferences {
  pauseDuration: number;
  repeatCount: number;
  autoAdvance: boolean;
}

export interface AppSettings {
  tts: TTSSettings;
  shadowing: ShadowingPreferences;
}

export interface SettingsState extends AppSettings {
  isInitialized: boolean;
}

export interface SettingsActions {
  // TTS
  setVoice: (voice: VoiceOption) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Shadowing
  setPauseDuration: (duration: number) => void;
  setRepeatCount: (count: number) => void;
  setAutoAdvance: (enabled: boolean) => void;

  // General
  resetToDefaults: () => void;
  initializeFromStorage: () => void;
  syncWithPracticeStore: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;
```

#### T1.3 상세: Settings Store 구현

- Zustand create 함수 사용
- localStorage persist 미들웨어 활용
- practice-store와의 양방향 동기화 구현

---

### Phase 2: Settings Page UI (Secondary Goal)

설정 페이지 라우트 및 UI 컴포넌트 구현

#### 작업 목록

| Task ID | 작업 | 파일 | 의존성 |
|---------|------|------|--------|
| T2.1 | Settings Page 생성 | `src/app/settings/page.tsx` | Phase 1 |
| T2.2 | TTS Settings 섹션 | `src/components/settings/tts-settings.tsx` | T2.1 |
| T2.3 | Shadowing Settings 섹션 | `src/components/settings/shadowing-section.tsx` | T2.1 |
| T2.4 | Reset Settings 버튼 | `src/components/settings/reset-settings.tsx` | T2.1 |
| T2.5 | Settings Header | `src/components/settings/settings-header.tsx` | T2.1 |
| T2.6 | TTS Settings 테스트 | `src/__tests__/components/settings/tts-settings.test.tsx` | T2.2 |
| T2.7 | Shadowing Section 테스트 | `src/__tests__/components/settings/shadowing-section.test.tsx` | T2.3 |

#### T2.2 상세: TTS Settings 섹션

기존 컴포넌트 재사용:
- `VoiceSelector` - 그대로 사용
- `PlaybackSpeed` - Card wrapper 제거 버전 필요
- `VolumeControl` - 확장 (모바일 표시 추가)

```typescript
// src/components/settings/tts-settings.tsx
interface TTSSettingsProps {
  voice: VoiceOption;
  speed: number;
  volume: number;
  isMuted: boolean;
  onVoiceChange: (voice: VoiceOption) => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}
```

---

### Phase 3: Integration & Navigation (Tertiary Goal)

네비게이션 연동, practice-store 동기화

#### 작업 목록

| Task ID | 작업 | 파일 | 의존성 |
|---------|------|------|--------|
| T3.1 | Settings 링크 추가 | `src/components/layout/bottom-nav.tsx` (또는 Header) | Phase 2 |
| T3.2 | Practice Store 연동 | `src/stores/practice-store.ts` 수정 | Phase 1 |
| T3.3 | 초기화 훅 구현 | `src/lib/hooks/use-settings-sync.ts` | T3.2 |
| T3.4 | 통합 테스트 작성 | `src/__tests__/integration/settings-sync.test.tsx` | T3.3 |

#### T3.2 상세: Practice Store 연동

Settings Store 변경 시 Practice Store 자동 업데이트:

```typescript
// 옵션 1: subscribe를 통한 동기화
useSettingsStore.subscribe(
  (state) => state.tts,
  (tts) => {
    usePracticeStore.setState({
      selectedVoice: tts.voice,
      playbackSpeed: tts.speed,
      volume: tts.volume,
      isMuted: tts.isMuted,
    });
  }
);
```

---

### Phase 4: Testing & Polish (Final Goal)

E2E 테스트, 접근성 검증, 성능 최적화

#### 작업 목록

| Task ID | 작업 | 파일 | 의존성 |
|---------|------|------|--------|
| T4.1 | E2E 테스트 작성 | `__tests__/e2e/settings.spec.ts` | Phase 3 |
| T4.2 | 접근성 검증 | 모든 설정 컴포넌트 | Phase 3 |
| T4.3 | 반응형 디자인 검증 | Settings Page | Phase 3 |
| T4.4 | 성능 최적화 | Settings Store | Phase 3 |

---

## 3. File Creation/Modification List

### 3.1 신규 생성 파일

| 파일 경로 | 설명 |
|-----------|------|
| `src/types/settings.ts` | 설정 관련 타입 정의 |
| `src/lib/constants/settings.ts` | 설정 상수 및 기본값 |
| `src/stores/settings-store.ts` | Zustand 설정 Store |
| `src/app/settings/page.tsx` | 설정 페이지 라우트 |
| `src/components/settings/tts-settings.tsx` | TTS 설정 섹션 |
| `src/components/settings/shadowing-section.tsx` | 쉐도잉 설정 섹션 |
| `src/components/settings/reset-settings.tsx` | 초기화 버튼 |
| `src/components/settings/settings-header.tsx` | 설정 페이지 헤더 |
| `src/lib/hooks/use-settings-sync.ts` | Store 동기화 훅 |
| `src/__tests__/stores/settings-store.test.ts` | Store 단위 테스트 |
| `src/__tests__/components/settings/tts-settings.test.tsx` | TTS 설정 테스트 |
| `src/__tests__/components/settings/shadowing-section.test.tsx` | 쉐도잉 설정 테스트 |
| `__tests__/e2e/settings.spec.ts` | E2E 테스트 |

### 3.2 수정 파일

| 파일 경로 | 수정 내용 |
|-----------|----------|
| `src/types/index.ts` | settings 타입 export 추가 |
| `src/stores/practice-store.ts` | settings-store 연동 |
| `src/components/practice/volume-control.tsx` | 모바일 표시 옵션 추가 |
| `src/app/layout.tsx` (또는 적절한 레이아웃) | 설정 초기화 로직 추가 |

### 3.3 재사용 컴포넌트 (수정 없이 사용)

| 파일 경로 | 사용 위치 |
|-----------|----------|
| `src/components/practice/voice-selector.tsx` | tts-settings.tsx |
| `src/components/practice/playback-speed.tsx` | tts-settings.tsx |
| `src/components/practice/shadowing-settings.tsx` | shadowing-section.tsx |

---

## 4. Dependencies & Technical Constraints

### 4.1 외부 의존성

| 패키지 | 용도 | 버전 |
|--------|------|------|
| zustand | 상태 관리 | ^5.0.0 (기존) |
| lucide-react | 아이콘 | 기존 |
| @radix-ui/* | UI 컴포넌트 | 기존 |

### 4.2 내부 의존성

```
settings-store.ts
    ├── types/settings.ts
    ├── lib/constants/settings.ts
    ├── lib/constants/voices.ts (기존)
    └── lib/constants/shadowing.ts (기존)

app/settings/page.tsx
    ├── components/settings/tts-settings.tsx
    │       ├── components/practice/voice-selector.tsx
    │       ├── components/practice/playback-speed.tsx
    │       └── components/practice/volume-control.tsx
    ├── components/settings/shadowing-section.tsx
    │       └── components/practice/shadowing-settings.tsx
    ├── components/settings/reset-settings.tsx
    └── stores/settings-store.ts
```

### 4.3 기술적 제약

| 제약 | 해결 방안 |
|------|----------|
| Client Component 제약 | "use client" 지시문 사용 |
| localStorage SSR 이슈 | useEffect에서 초기화 |
| Store 동기화 복잡성 | 단방향 데이터 흐름 유지 (settings -> practice) |

---

## 5. Risk Analysis

### 5.1 기술적 리스크

| 리스크 | 확률 | 영향 | 완화 방안 |
|--------|------|------|----------|
| Store 동기화 버그 | Medium | High | 철저한 단위 테스트, E2E 테스트 |
| localStorage 용량 초과 | Low | Medium | 필수 데이터만 저장 |
| 기존 컴포넌트 수정 충돌 | Low | Medium | 기존 컴포넌트 수정 최소화 |

### 5.2 일정 리스크

| 리스크 | 확률 | 영향 | 완화 방안 |
|--------|------|------|----------|
| 기존 코드 분석 지연 | Low | Low | 이미 분석 완료 |
| 테스트 작성 지연 | Medium | Medium | TDD로 병행 개발 |

### 5.3 리스크 대응 우선순위

1. [High] Store 동기화 - 철저한 테스트 필수
2. [Medium] 반응형 디자인 - 모바일 우선 개발
3. [Low] 접근성 - 기존 shadcn/ui 컴포넌트 활용

---

## 6. Implementation Notes

### 6.1 Store 동기화 전략

**권장 방식**: Settings Store를 Source of Truth로 사용

```
Settings Store (Source of Truth)
    ↓ subscribe
Practice Store (Runtime State)
    ↓
UI Components
```

**동기화 시점**:
1. 앱 초기화 시 - Settings Store에서 Practice Store로 동기화
2. 설정 변경 시 - Settings Store 업데이트 후 Practice Store 반영
3. Practice 화면에서 직접 변경 시 - 양쪽 Store 업데이트

### 6.2 localStorage 키 통합

기존 키:
- `shadow-tutor:playback-mode`
- `shadow-tutor:shadowing-settings`

신규 통합 키:
- `shadow-tutor:settings` (전체 설정 객체)

마이그레이션 고려:
- 기존 키가 있으면 마이그레이션 후 삭제
- 신규 설치는 통합 키만 사용

### 6.3 테스트 전략

| 테스트 유형 | 범위 | 도구 |
|------------|------|------|
| Unit | Store 액션, 유효성 검증 | Vitest |
| Component | UI 렌더링, 이벤트 핸들링 | Vitest + Testing Library |
| Integration | Store 동기화 | Vitest + Testing Library |
| E2E | 전체 사용자 플로우 | Playwright |

---

## 7. Definition of Done

### 7.1 Phase 완료 기준

| Phase | 완료 기준 |
|-------|----------|
| Phase 1 | Settings Store 테스트 100% 통과, 타입 정의 완료 |
| Phase 2 | 설정 페이지 UI 완성, 컴포넌트 테스트 통과 |
| Phase 3 | Practice Store 동기화 동작, 네비게이션 연결 |
| Phase 4 | E2E 테스트 통과, 접근성 검증 완료 |

### 7.2 전체 완료 기준

- [x] 모든 단위 테스트 통과 (60개 테스트, 95.4% 커버리지)
- [x] E2E 테스트 통과
- [x] WCAG 2.1 AA 접근성 검증
- [x] 모바일/데스크톱 반응형 확인
- [x] localStorage 영속화 동작 확인
- [x] Settings <-> Practice Store 동기화 확인
- [x] 코드 리뷰 완료 (lint 오류 없음)
- [x] 문서화 업데이트

---

## 8. Traceability

| SPEC 요구사항 | 구현 Task |
|--------------|-----------|
| UR-001, UR-002 | T1.3, T3.2 |
| ED-001 ~ ED-006 | T2.2, T2.3 |
| ED-007 | T2.4 |
| ED-008 | T2.1 |
| SD-001 ~ SD-003 | T2.2, T2.3 |
| UB-001 ~ UB-003 | T1.3, T3.3 |

---

*Document Version: 1.0.0*
*SPEC ID: SPEC-SETTINGS-001*
*Created: 2026-01-07*
