---
id: SPEC-PLAYER-001
version: "1.0.0"
status: "implemented"
created: "2026-01-07"
updated: "2026-01-07"
author: "MoAI-ADK"
priority: "high"
lifecycle: "spec-anchored"
---

# SPEC-PLAYER-001: 플레이어 UI 개선 및 텍스트 하이라이트

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 생성 |

---

## 1. 개요

Shadow Tutor 애플리케이션의 오디오 플레이어 UI를 개선하고, 텍스트 하이라이트 기능을 강화하여 사용자 경험을 향상시킵니다. 이 SPEC은 SPEC-TTS-001에서 미구현된 선택적 기능들(OF-002, OF-003)과 UR-003의 시각적 하이라이트 기능을 완성합니다.

### 1.1 목적

- 오디오 프로그레스 바 및 시크(seek) 기능 구현
- 볼륨 조절 UI 구현
- 현재 재생 세그먼트의 시각적 하이라이트 강화
- 모바일 최적화된 플레이어 UI 제공

### 1.2 범위

**포함 (In Scope):**
- AudioPlayer 컴포넌트 UI 개선
  - 프로그레스 바 (시간 표시, 시크 기능)
  - 볼륨 조절 슬라이더
  - 현재 재생 시간 / 총 시간 표시
- 텍스트 하이라이트 강화
  - AudioPlayer 내 현재 세그먼트 텍스트 강조
  - SegmentList 스크롤 자동 이동
  - 시각적 하이라이트 애니메이션
- 모바일 반응형 UI 최적화

**제외 (Out of Scope):**
- 세그먼트별 반복 재생 횟수 설정 (OF-001) - 별도 SPEC
- 쉐도잉 모드 자동 일시정지 (SPEC-SHADOW-001)
- PWA 오프라인 캐싱 (SPEC-PWA-001)
- 오디오 녹음 및 발음 평가

---

## 2. EARS 요구사항

### 2.1 Ubiquitous Requirements (항상 참인 요구사항)

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** 현재 재생 중인 세그먼트를 시각적으로 구분 가능하게 표시해야 한다 |
| UR-002 | 시스템은 **항상** 프로그레스 바에 현재 재생 위치와 총 시간을 표시해야 한다 |
| UR-003 | 시스템은 **항상** 모바일 터치 환경에 최적화된 44px 이상의 터치 타겟을 제공해야 한다 |
| UR-004 | 시스템은 **항상** 볼륨 상태를 0% ~ 100% 범위로 제한해야 한다 |
| UR-005 | 시스템은 **항상** 접근성(WCAG 2.1 AA)을 준수하는 UI 컨트롤을 제공해야 한다 |
| UR-006 | 시스템은 **항상** 플레이어 상태 변경 시 100ms 이내에 UI를 업데이트해야 한다 |

### 2.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 사용자가 프로그레스 바를 드래그할 때 **THEN** 오디오 재생 위치가 해당 지점으로 이동해야 한다 |
| ED-002 | **WHEN** 사용자가 프로그레스 바를 클릭할 때 **THEN** 클릭한 위치로 오디오가 시크(seek)되어야 한다 |
| ED-003 | **WHEN** 사용자가 볼륨 슬라이더를 조절할 때 **THEN** 오디오 볼륨이 즉시 변경되어야 한다 |
| ED-004 | **WHEN** 사용자가 볼륨 아이콘을 클릭할 때 **THEN** 음소거가 토글되어야 한다 |
| ED-005 | **WHEN** 새로운 세그먼트가 재생될 때 **THEN** SegmentList가 해당 세그먼트로 자동 스크롤되어야 한다 |
| ED-006 | **WHEN** 오디오 재생이 시작될 때 **THEN** 현재 세그먼트 텍스트에 하이라이트 애니메이션이 적용되어야 한다 |
| ED-007 | **WHEN** 오디오 재생 시간이 업데이트될 때 **THEN** 프로그레스 바와 시간 표시가 동기화되어야 한다 |
| ED-008 | **WHEN** 사용자가 키보드 방향키를 누를 때 **THEN** 5초 전/후로 시크되어야 한다 |

### 2.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 오디오가 재생 중이면 **THEN** 프로그레스 바가 실시간으로 업데이트되어야 한다 |
| SD-002 | **IF** 볼륨이 0이면 **THEN** 음소거 아이콘이 표시되어야 한다 |
| SD-003 | **IF** 볼륨이 50% 미만이면 **THEN** 볼륨 낮음 아이콘이 표시되어야 한다 |
| SD-004 | **IF** 볼륨이 50% 이상이면 **THEN** 볼륨 높음 아이콘이 표시되어야 한다 |
| SD-005 | **IF** 현재 세그먼트가 변경되면 **THEN** 이전 세그먼트의 하이라이트가 제거되어야 한다 |
| SD-006 | **IF** 오디오가 로딩 중이면 **THEN** 프로그레스 바에 로딩 인디케이터가 표시되어야 한다 |
| SD-007 | **IF** 오디오 길이가 확정되지 않았으면 **THEN** 불확정 프로그레스 바가 표시되어야 한다 |
| SD-008 | **IF** 모바일 화면이면 **THEN** 볼륨 슬라이더가 숨겨지고 시스템 볼륨을 사용해야 한다 |

### 2.4 Unwanted Behavior Requirements (원치 않는 동작)

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 프로그레스 바 드래그 중 오디오를 **끊기지 않게 해야 한다** |
| UB-002 | 시스템은 볼륨 조절 시 갑작스러운 볼륨 점프를 **발생시키지 않아야 한다** |
| UB-003 | 시스템은 하이라이트 애니메이션으로 인한 성능 저하를 **유발하지 않아야 한다** |
| UB-004 | 시스템은 자동 스크롤이 사용자의 수동 스크롤을 **방해하지 않아야 한다** |
| UB-005 | 시스템은 시크 작업 중 다른 UI 상호작용을 **차단하지 않아야 한다** |

### 2.5 Optional Feature Requirements (선택적 기능)

| ID | 요구사항 |
|----|----------|
| OF-001 | **가능하면** 프로그레스 바에 버퍼링 상태를 표시해야 한다 |
| OF-002 | **가능하면** 더블 탭으로 10초 전/후 시크 기능을 제공해야 한다 |
| OF-003 | **가능하면** 볼륨 설정을 localStorage에 저장하여 유지해야 한다 |

---

## 3. 기술 스택

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.x | 프레임워크 |
| react | 19.x | UI 컴포넌트 |
| typescript | 5.7.x | 타입 안전성 |
| tailwindcss | 4.x | 스타일링 |
| shadcn/ui Slider | latest | 프로그레스 바, 볼륨 슬라이더 |
| lucide-react | latest | 볼륨 아이콘 |
| zustand | 5.x | 상태 관리 |
| framer-motion | 11.x | 하이라이트 애니메이션 (선택적) |

---

## 4. 컴포넌트 구조

```
src/
├── components/
│   └── practice/
│       ├── audio-player.tsx           # 개선된 오디오 플레이어
│       ├── progress-bar.tsx           # NEW: 프로그레스 바 컴포넌트
│       ├── volume-control.tsx         # NEW: 볼륨 조절 컴포넌트
│       ├── segment-list.tsx           # 개선된 세그먼트 목록
│       ├── segment-highlight.tsx      # NEW: 텍스트 하이라이트 컴포넌트
│       ├── playback-speed.tsx         # 기존 재생 속도 조절
│       └── voice-selector.tsx         # 기존 음성 선택
├── lib/
│   ├── hooks/
│   │   ├── use-audio-player.ts        # 개선된 오디오 플레이어 훅
│   │   ├── use-progress-bar.ts        # NEW: 프로그레스 바 훅
│   │   └── use-auto-scroll.ts         # NEW: 자동 스크롤 훅
│   └── utils/
│       └── format-time.ts             # NEW: 시간 포맷 유틸리티
└── types/
    └── audio.ts                       # 오디오 관련 타입 확장
```

---

## 5. UI 설계

### 5.1 AudioPlayer 개선 레이아웃

```
┌─────────────────────────────────────────────────┐
│  [현재 세그먼트 텍스트 - 하이라이트 적용]         │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 0:15 ━━━━━━━━━━●━━━━━━━━━━━━━━━━ 1:30   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│    [⏮] [⏯] [⏹] [⏭]       [🔊━━━━●━━━]      │
│                                                 │
│              Segment 3 of 10                    │
└─────────────────────────────────────────────────┘
```

### 5.2 모바일 레이아웃

```
┌────────────────────────────┐
│  [현재 세그먼트 텍스트]      │
│                            │
│  0:15 ━━━━━●━━━━━━━ 1:30   │
│                            │
│     [⏮] [⏯] [⏹] [⏭]      │
│                            │
│       Segment 3 of 10      │
└────────────────────────────┘
```

### 5.3 SegmentList 자동 스크롤

- 현재 세그먼트가 화면 중앙에 오도록 스크롤
- 사용자가 수동 스크롤 중일 때는 자동 스크롤 비활성화
- 3초 후 자동 스크롤 재활성화

---

## 6. 상태 관리

### 6.1 practiceStore 확장

```typescript
interface PracticeState {
  // 기존 상태
  sessionId: string | null;
  segments: TextSegment[];
  currentSegmentIndex: number;
  playbackState: PlaybackState;
  playbackSpeed: number;
  selectedVoice: VoiceOption;
  audioCache: Map<string, string>;
  error: string | null;

  // 신규 상태 (SPEC-PLAYER-001)
  volume: number;              // 0.0 - 1.0
  isMuted: boolean;            // 음소거 상태
  currentTime: number;         // 현재 재생 시간 (초)
  duration: number;            // 총 오디오 길이 (초)
  isAutoScrollEnabled: boolean; // 자동 스크롤 활성화 여부
}

interface PracticeActions {
  // 기존 액션 유지

  // 신규 액션 (SPEC-PLAYER-001)
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  seekTo: (time: number) => void;
  setAutoScrollEnabled: (enabled: boolean) => void;
}
```

---

## 7. 의존성

### 7.1 내부 의존성

| SPEC ID | 의존성 유형 | 설명 |
|---------|------------|------|
| SPEC-TTS-001 | 완료 필요 | 오디오 플레이어 기반 구현, useAudioPlayer 훅 |
| SPEC-UPLOAD-001 | 완료 필요 | TextSegment 타입, 세그먼트 데이터 |

### 7.2 외부 의존성

| 패키지 | 용도 | 설치 여부 |
|--------|------|----------|
| shadcn/ui Slider | 프로그레스 바, 볼륨 조절 | 설치 필요 |
| framer-motion | 하이라이트 애니메이션 | 선택적 |

---

## 8. 성능 요구사항

| 메트릭 | 목표값 | 측정 방법 |
|--------|--------|----------|
| UI 응답 시간 | < 100ms | 버튼/슬라이더 클릭 응답 |
| 프로그레스 바 업데이트 | 60fps (16ms) | 실시간 업데이트 |
| 하이라이트 애니메이션 | < 300ms | 전환 시간 |
| 메모리 증가량 | < 5MB | 브라우저 DevTools |
| CPU 사용률 (재생 중) | < 5% | 브라우저 DevTools |

---

## 9. 접근성 요구사항

| 요구사항 | 구현 방법 |
|----------|----------|
| 키보드 네비게이션 | 모든 컨트롤 Tab/Enter 접근 가능 |
| 스크린 리더 | aria-label, aria-valuenow 속성 |
| 시각적 포커스 | focus-visible 스타일링 |
| 컬러 대비 | WCAG AA (4.5:1 이상) |
| 터치 타겟 | 최소 44x44px |

---

## 10. 참고 자료

- [MDN HTML5 Audio API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Slider](https://ui.shadcn.com/docs/components/slider)
- [Framer Motion](https://www.framer.com/motion/)
