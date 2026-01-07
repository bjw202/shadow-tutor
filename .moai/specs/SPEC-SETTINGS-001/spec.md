# SPEC-SETTINGS-001: Settings Options Feature

---
id: SPEC-SETTINGS-001
version: 1.0.0
status: completed
created: 2026-01-07
updated: 2026-01-07
completed: 2026-01-07
author: workflow-spec
priority: high
tags: [settings, preferences, tts, shadowing, mobile-first]
lifecycle: spec-anchored
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | workflow-spec | Initial SPEC creation |
| 1.0.1 | 2026-01-07 | manager-docs | Implementation completed, status updated |

---

## 1. Overview

### 1.1 목적

Shadow Tutor 앱의 설정 옵션 기능을 구현하여 사용자가 TTS 음성, 재생 속도, 볼륨, 쉐도잉 모드 설정 등을 전용 설정 페이지(/settings)에서 통합 관리할 수 있도록 한다.

### 1.2 범위

- TTS 음성 설정 (음성 선택, 재생 속도, 볼륨)
- 쉐도잉 모드 설정 (일시정지 시간, 반복 횟수, 자동 진행)
- 전용 설정 페이지 (/settings) 생성
- localStorage를 통한 설정 영속화
- Mobile-first 반응형 디자인

### 1.3 관련 SPEC

- SPEC-TTS-001: TTS API 통합
- SPEC-PLAYER-001: 오디오 플레이어 UI
- SPEC-MODE-001: 학습 모드 (continuous/shadowing)

---

## 2. Environment (환경)

### 2.1 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.x | App Router 기반 라우팅 |
| React | 19.x | UI 컴포넌트 |
| TypeScript | 5.7.x | 타입 안전성 |
| Zustand | 5.x | 상태 관리 |
| Tailwind CSS | 4.x | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 라이브러리 |

### 2.2 기존 컴포넌트 재사용

| 컴포넌트 | 경로 | 재사용 방식 |
|----------|------|-------------|
| VoiceSelector | `src/components/practice/voice-selector.tsx` | 설정 페이지에서 재사용 |
| PlaybackSpeed | `src/components/practice/playback-speed.tsx` | 설정 페이지에서 재사용 |
| VolumeControl | `src/components/practice/volume-control.tsx` | 확장하여 설정 페이지에서 사용 |
| ShadowingSettings | `src/components/practice/shadowing-settings.tsx` | 설정 페이지에서 재사용 |

### 2.3 기존 Store 구조

현재 `practice-store.ts`에 다음 설정이 포함됨:
- `selectedVoice: VoiceOption`
- `playbackSpeed: number`
- `volume: number`
- `isMuted: boolean`
- `mode: PlaybackMode`
- `shadowingSettings: ShadowingSettings`

---

## 3. Assumptions (가정)

### 3.1 기술적 가정

- [HIGH] localStorage는 모든 대상 브라우저에서 사용 가능하다
- [HIGH] 설정 변경은 실시간으로 practice 화면에 반영된다
- [MEDIUM] 사용자는 한 번에 하나의 탭에서만 앱을 사용한다

### 3.2 비즈니스 가정

- [HIGH] 설정 페이지는 네비게이션에서 쉽게 접근 가능해야 한다
- [MEDIUM] 설정은 세션 간 유지되어야 한다
- [LOW] 설정 초기화 기능이 필요할 수 있다

### 3.3 사용자 가정

- [HIGH] 사용자는 모바일 기기에서 주로 앱을 사용한다
- [MEDIUM] 설정 변경 빈도는 낮다 (한 번 설정 후 유지)

---

## 4. Requirements (요구사항)

### 4.1 Ubiquitous Requirements (UR) - 시스템 전역 요구사항

#### UR-001: 설정 영속화
시스템은 **항상** 모든 설정 변경을 localStorage에 즉시 저장해야 한다.

#### UR-002: 설정 로드
시스템은 **항상** 앱 시작 시 localStorage에서 저장된 설정을 로드해야 한다.

#### UR-003: 접근성 준수
시스템은 **항상** WCAG 2.1 AA 수준의 접근성 요구사항을 준수해야 한다.

#### UR-004: Mobile-First 반응형
시스템은 **항상** 모바일 우선 반응형 레이아웃을 제공해야 한다.

### 4.2 Event-Driven Requirements (ED) - 이벤트 기반 요구사항

#### ED-001: 음성 선택 변경
**WHEN** 사용자가 음성 선택을 변경 **THEN** 시스템은 선택된 음성을 저장하고 오디오 캐시를 초기화해야 한다.

#### ED-002: 재생 속도 변경
**WHEN** 사용자가 재생 속도를 변경 **THEN** 시스템은 새 속도 값(0.5x ~ 2.0x)을 저장하고 현재 재생 중인 오디오에 적용해야 한다.

#### ED-003: 볼륨 변경
**WHEN** 사용자가 볼륨을 변경 **THEN** 시스템은 새 볼륨 값(0% ~ 100%)을 저장해야 한다.

#### ED-004: 일시정지 시간 변경
**WHEN** 사용자가 쉐도잉 일시정지 시간을 변경 **THEN** 시스템은 새 값(1초 ~ 30초)을 저장해야 한다.

#### ED-005: 반복 횟수 변경
**WHEN** 사용자가 반복 횟수를 변경 **THEN** 시스템은 새 값(1회 ~ 10회)을 저장해야 한다.

#### ED-006: 자동 진행 토글
**WHEN** 사용자가 자동 진행 옵션을 토글 **THEN** 시스템은 새 상태(true/false)를 저장해야 한다.

#### ED-007: 설정 초기화
**WHEN** 사용자가 설정 초기화 버튼을 클릭 **THEN** 시스템은 모든 설정을 기본값으로 되돌려야 한다.

#### ED-008: 설정 페이지 진입
**WHEN** 사용자가 /settings 페이지로 이동 **THEN** 시스템은 현재 저장된 모든 설정 값을 표시해야 한다.

### 4.3 State-Driven Requirements (SD) - 상태 기반 요구사항

#### SD-001: 쉐도잉 모드 비활성
**IF** 현재 모드가 'continuous' **THEN** 쉐도잉 설정 섹션은 비활성화 상태로 표시해야 한다.

#### SD-002: 음소거 상태
**IF** 볼륨이 음소거 상태 **THEN** 볼륨 아이콘은 음소거 아이콘을 표시해야 한다.

#### SD-003: 최소/최대 값 도달
**IF** 설정 값이 최소 또는 최대에 도달 **THEN** 해당 방향의 조절 버튼을 비활성화해야 한다.

### 4.4 Unwanted Behavior Requirements (UB) - 금지 요구사항

#### UB-001: 유효하지 않은 값 저장 금지
시스템은 유효 범위를 벗어나는 설정 값을 저장**하지 않아야 한다**.

#### UB-002: 동기화 지연 금지
시스템은 설정 변경 후 practice 화면 반영에 눈에 띄는 지연이 발생**하지 않아야 한다**.

#### UB-003: 데이터 손실 금지
시스템은 페이지 새로고침 또는 브라우저 종료 시 설정 데이터를 손실**하지 않아야 한다**.

### 4.5 Optional Feature Requirements (OF) - 선택적 기능

#### OF-001: 설정 내보내기/가져오기
**가능하면** 사용자가 설정을 JSON 파일로 내보내고 가져올 수 있는 기능을 제공한다.

#### OF-002: 설정 프리셋
**가능하면** 초보자/중급/고급 학습자를 위한 설정 프리셋을 제공한다.

---

## 5. Specifications (명세)

### 5.1 컴포넌트 구조

```
src/
  app/
    settings/
      page.tsx              # 설정 페이지 (신규)
      layout.tsx            # 설정 페이지 레이아웃 (선택적)
  components/
    settings/               # 설정 관련 컴포넌트 (신규)
      settings-page.tsx     # 설정 페이지 메인 컴포넌트
      tts-settings.tsx      # TTS 설정 섹션
      shadowing-section.tsx # 쉐도잉 설정 섹션
      reset-settings.tsx    # 설정 초기화 버튼
  stores/
    settings-store.ts       # 설정 전용 store (신규)
  lib/
    constants/
      settings.ts           # 설정 관련 상수 (신규)
  types/
    settings.ts             # 설정 관련 타입 (신규)
```

### 5.2 Settings Store 설계

```typescript
// types/settings.ts
export interface SettingsState {
  // TTS 설정
  voice: VoiceOption;
  speed: number;
  volume: number;
  isMuted: boolean;

  // 쉐도잉 설정
  shadowingPauseDuration: number;
  shadowingRepeatCount: number;
  shadowingAutoAdvance: boolean;

  // 앱 설정
  isInitialized: boolean;
}

export interface SettingsActions {
  // TTS 액션
  setVoice: (voice: VoiceOption) => void;
  setSpeed: (speed: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // 쉐도잉 액션
  setShadowingPauseDuration: (duration: number) => void;
  setShadowingRepeatCount: (count: number) => void;
  setShadowingAutoAdvance: (enabled: boolean) => void;

  // 일반 액션
  resetToDefaults: () => void;
  initFromStorage: () => void;
}
```

### 5.3 localStorage 키 구조

| 키 | 설명 | 기본값 |
|----|------|--------|
| `shadow-tutor:voice` | 선택된 음성 | "nova" |
| `shadow-tutor:speed` | 재생 속도 | 1.0 |
| `shadow-tutor:volume` | 볼륨 레벨 | 1.0 |
| `shadow-tutor:muted` | 음소거 상태 | false |
| `shadow-tutor:shadowing-pause` | 일시정지 시간 | 5 |
| `shadow-tutor:shadowing-repeat` | 반복 횟수 | 1 |
| `shadow-tutor:shadowing-auto` | 자동 진행 | true |

### 5.4 UI 와이어프레임

```
+----------------------------------+
|  < Back        Settings          |
+----------------------------------+
|                                  |
|  [TTS Settings]                  |
|  +--------------------------+    |
|  | Voice                    |    |
|  | [Nova               v]   |    |
|  +--------------------------+    |
|  | Speed: 1.0x              |    |
|  | [====o=============]     |    |
|  | 0.5x 0.75x 1x 1.25x 2x   |    |
|  +--------------------------+    |
|  | Volume                   |    |
|  | [=======o==========]     |    |
|  +--------------------------+    |
|                                  |
|  [Shadowing Settings]            |
|  +--------------------------+    |
|  | Pause Duration: 5s       |    |
|  | [====o=============]     |    |
|  +--------------------------+    |
|  | Repeat Count: 1x         |    |
|  | [-] [====o=======] [+]   |    |
|  +--------------------------+    |
|  | Auto-advance      [on]   |    |
|  +--------------------------+    |
|                                  |
|  [Reset to Defaults]             |
|                                  |
+----------------------------------+
```

### 5.5 접근성 요구사항

| 항목 | 요구사항 |
|------|----------|
| 키보드 네비게이션 | 모든 설정 컨트롤에 Tab으로 접근 가능 |
| ARIA 라벨 | 모든 인터랙티브 요소에 적절한 aria-label 제공 |
| 색상 대비 | 최소 4.5:1 대비율 유지 |
| 포커스 표시 | 명확한 포커스 인디케이터 제공 |
| 스크린 리더 | 설정 변경 시 변경 사항 안내 |

### 5.6 성능 요구사항

| 메트릭 | 목표값 |
|--------|--------|
| 설정 페이지 로드 | < 500ms |
| 설정 저장 지연 | < 100ms |
| practice 화면 반영 | 즉시 (< 16ms) |
| 초기화 시간 | < 200ms |

---

## 6. Constraints (제약사항)

### 6.1 기술적 제약

- localStorage 용량 제한 (약 5MB)
- Zustand의 persist 미들웨어 사용 검토
- Next.js App Router의 client component 제약

### 6.2 UI/UX 제약

- 한 손으로 조작 가능한 모바일 레이아웃
- 터치 친화적인 컨트롤 크기 (최소 44x44px)
- 기존 practice 컴포넌트 스타일과의 일관성

### 6.3 브라우저 지원

- Chrome 90+
- Safari 14+ (iOS 포함)
- Firefox 88+
- Edge 90+

---

## 7. Traceability

### 7.1 관련 문서

| 문서 | 연결 |
|------|------|
| Product Documentation | `.moai/project/product.md` |
| Tech Stack | `.moai/project/tech.md` |
| Architecture | `.moai/project/structure.md` |

### 7.2 구현 파일 매핑

| 요구사항 ID | 구현 파일 |
|-------------|-----------|
| UR-001, UR-002 | `src/stores/settings-store.ts` |
| ED-001 ~ ED-008 | `src/components/settings/*.tsx` |
| SD-001 ~ SD-003 | `src/components/settings/*.tsx` |
| 전체 | `src/app/settings/page.tsx` |

---

## 8. Glossary

| 용어 | 정의 |
|------|------|
| TTS | Text-to-Speech, 텍스트를 음성으로 변환하는 기술 |
| Shadowing | 원어민 음성을 듣고 따라 말하는 학습법 |
| Pause Duration | 쉐도잉 모드에서 음성 재생 후 사용자가 따라 말할 시간 |
| Auto-advance | 반복 완료 후 자동으로 다음 세그먼트로 이동하는 기능 |
| localStorage | 브라우저의 로컬 저장소 API |

---

*Document Version: 1.0.0*
*SPEC ID: SPEC-SETTINGS-001*
*Created: 2026-01-07*
