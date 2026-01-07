# SPEC-PROGRESS-001: 진행률 관리 및 저장

---
spec_id: SPEC-PROGRESS-001
title: 진행률 관리 및 저장
created: 2025-01-07
status: Implemented
priority: high
author: MoAI-ADK
lifecycle: spec-anchored
tags: [progress, indexeddb, storage, session, tracking]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-07 | MoAI-ADK | 초기 SPEC 생성 |
| 1.1.0 | 2026-01-07 | MoAI-ADK | 구현 완료 (TDD, 625 tests, 90.05% coverage) |

---

## 1. Environment (환경)

### 1.1 기술 스택

- **Runtime**: Next.js 15.x (App Router)
- **Language**: TypeScript 5.x
- **State Management**: Zustand 5.x
- **Storage**: IndexedDB (via idb 8.x), localStorage
- **UI Framework**: React 19.x
- **Styling**: Tailwind CSS 3.x, shadcn/ui

### 1.2 의존성

#### 내부 의존성
- `practice-store`: currentSegmentIndex 구독
- `upload-store`: contentId, contentTitle 참조
- `app-store`: 학습 모드 상태 참조

#### 외부 의존성
- `idb`: ^8.0.0 (IndexedDB wrapper)
- `zustand`: ^5.0.0 (이미 설치됨)

### 1.3 대상 환경

- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **디바이스**: Desktop, Tablet, Mobile
- **네트워크**: Offline 지원 필수

---

## 2. Assumptions (가정)

### 2.1 기술적 가정

- [A-TECH-001] IndexedDB가 모든 대상 브라우저에서 지원됨
- [A-TECH-002] localStorage가 최소 5MB 이상 사용 가능
- [A-TECH-003] 브라우저 탭 간 IndexedDB 동기화는 고려하지 않음
- [A-TECH-004] 세그먼트 ID는 고유하며 중복되지 않음

### 2.2 비즈니스 가정

- [A-BIZ-001] 사용자는 여러 학습 세션을 동시에 진행할 수 있음
- [A-BIZ-002] 세션 데이터는 최대 30일간 보존됨
- [A-BIZ-003] 한 콘텐츠당 하나의 활성 세션만 존재함

### 2.3 사용자 행동 가정

- [A-USER-001] 사용자는 학습 중 브라우저를 닫거나 새로고침할 수 있음
- [A-USER-002] 사용자는 이전 세션을 이어서 학습하기를 원함
- [A-USER-003] 사용자는 진행률을 시각적으로 확인하고 싶어함

---

## 3. Requirements (요구사항)

### 3.1 Ubiquitous Requirements (UR) - 항상 적용

- **[UR-001]** 시스템은 **항상** 현재 학습 진행률(완료 세그먼트 수 / 전체 세그먼트 수)을 표시해야 한다
  - WHY: 사용자가 학습 진행 상황을 즉시 파악할 수 있어야 함
  - IMPACT: 진행률 미표시 시 사용자 동기 부여 저하

- **[UR-002]** 시스템은 **항상** 세션 데이터를 IndexedDB에 저장해야 한다
  - WHY: 영속적인 데이터 보존을 위해 IndexedDB 사용
  - IMPACT: 데이터 손실 시 사용자 학습 기록 유실

- **[UR-003]** 시스템은 **항상** 1초 이내에 진행률 저장을 완료해야 한다
  - WHY: 저장 지연은 UX 저하 및 데이터 손실 위험 증가
  - IMPACT: 저장 지연 시 갑작스러운 종료로 데이터 손실 가능

- **[UR-004]** 시스템은 **항상** 세그먼트 상태를 정확하게 추적해야 한다 (not_started, in_progress, completed)
  - WHY: 정확한 상태 추적이 이어하기 및 통계의 기반
  - IMPACT: 부정확한 상태는 잘못된 진행률 표시로 이어짐

### 3.2 Event-Driven Requirements (ED) - 이벤트 기반

- **[ED-001]** **WHEN** 세그먼트 재생이 완료될 때 **THEN** 해당 세그먼트의 상태가 'completed'로 변경되어야 한다
  - Trigger: 세그먼트 재생 종료 이벤트
  - Response: 상태 업데이트 및 저장

- **[ED-002]** **WHEN** 앱이 시작될 때 **THEN** 이전 세션 복원 프롬프트가 표시되어야 한다 (미완료 세션이 있는 경우)
  - Trigger: 앱 초기화 시점
  - Response: ResumePrompt 컴포넌트 렌더링

- **[ED-003]** **WHEN** 사용자가 이어하기를 선택할 때 **THEN** 마지막 학습 위치에서 재개되어야 한다
  - Trigger: ResumePrompt에서 이어하기 버튼 클릭
  - Response: 마지막 세그먼트로 이동 및 재생 준비

- **[ED-004]** **WHEN** 새로운 세그먼트로 이동할 때 **THEN** 현재 세그먼트의 상태가 저장되어야 한다
  - Trigger: 세그먼트 인덱스 변경
  - Response: 이전 세그먼트 상태 업데이트 및 저장

- **[ED-005]** **WHEN** 사용자가 세션을 삭제할 때 **THEN** 해당 세션의 모든 데이터가 삭제되어야 한다
  - Trigger: 세션 삭제 버튼 클릭
  - Response: IndexedDB에서 세션 데이터 제거

### 3.3 State-Driven Requirements (SD) - 상태 기반

- **[SD-001]** **IF** 세션이 활성 상태이면 **THEN** 진행률 바(ProgressBar)가 표시되어야 한다
  - Condition: session !== null && session.status === 'active'
  - Action: ProgressBar 컴포넌트 렌더링

- **[SD-002]** **IF** 완료율이 100%이면 **THEN** 세션 요약(SessionSummary)이 표시되어야 한다
  - Condition: completedSegments === totalSegments
  - Action: SessionSummary 모달 표시

- **[SD-003]** **IF** IndexedDB 접근이 불가능하면 **THEN** localStorage를 폴백으로 사용해야 한다
  - Condition: IndexedDB 연결 실패
  - Action: localStorage 기반 저장 활성화

- **[SD-004]** **IF** 미완료 세션이 존재하면 **THEN** 세션 목록에서 강조 표시되어야 한다
  - Condition: session.completedSegments < session.totalSegments
  - Action: 시각적 구분 스타일 적용

### 3.4 Unwanted Behavior Requirements (UB) - 금지 행위

- **[UB-001]** 시스템은 진행률 저장 실패 시 **데이터를 손실하지 않아야 한다**
  - Prevention: 저장 실패 시 재시도 로직 및 임시 저장
  - Recovery: 메모리 캐시에 보관 후 재연결 시 동기화

- **[UB-002]** 시스템은 IndexedDB 접근 불가 시 **앱 기능이 중단되지 않아야 한다**
  - Prevention: localStorage 폴백 구현
  - Recovery: 조용한 실패(graceful degradation)

- **[UB-003]** 시스템은 동일 콘텐츠에 대해 **중복 세션을 생성하지 않아야 한다**
  - Prevention: contentId 기반 중복 검사
  - Recovery: 기존 세션 활성화

- **[UB-004]** 시스템은 만료된 세션 데이터로 인해 **스토리지 용량을 초과하지 않아야 한다**
  - Prevention: 30일 이상 된 세션 자동 정리
  - Recovery: 정리 실패 시 가장 오래된 세션 삭제

### 3.5 Optional Features (OF) - 선택적 기능

- **[OF-001]** 가능하면 학습 세션 통계 그래프를 표시해야 한다
  - Value: 학습 패턴 시각화로 동기 부여 강화
  - Scope: MVP 이후 구현 고려

- **[OF-002]** 가능하면 세션 삭제 기능을 제공해야 한다
  - Value: 사용자 데이터 관리 자율성 제공
  - Scope: 세션 목록 UI에 삭제 버튼 추가

- **[OF-003]** 가능하면 학습 시간 통계를 제공해야 한다
  - Value: 누적 학습 시간 확인으로 성취감 제공
  - Scope: SessionSummary에 총 학습 시간 표시

---

## 4. Specifications (명세)

### 4.1 데이터 타입 정의

```typescript
// types/progress.ts

export type SegmentStatus = 'not_started' | 'in_progress' | 'completed';

export interface SegmentProgress {
  segmentId: string;
  status: SegmentStatus;
  repeatCount: number;
  lastPracticedAt: number; // Unix timestamp
}

export interface SessionData {
  sessionId: string;
  contentId: string;
  contentTitle: string;
  totalSegments: number;
  completedSegments: number;
  startedAt: number; // Unix timestamp
  lastActiveAt: number; // Unix timestamp
  totalDurationMs: number;
  segmentProgress: SegmentProgress[];
}

export interface SessionListItem {
  sessionId: string;
  contentId: string;
  contentTitle: string;
  completionRate: number; // 0-100
  lastActiveAt: number;
}
```

### 4.2 저장소 구조

#### IndexedDB 스키마

```typescript
// lib/db/progress-db.ts

interface ProgressDB extends DBSchema {
  sessions: {
    key: string; // sessionId
    value: SessionData;
    indexes: {
      'by-content': string; // contentId
      'by-last-active': number; // lastActiveAt
    };
  };
}

const DB_NAME = 'shadow-tutor-progress';
const DB_VERSION = 1;
```

#### localStorage 키

- `st_current_session_id`: 현재 활성 세션 ID
- `st_last_segment_index`: 마지막으로 학습한 세그먼트 인덱스
- `st_session_backup`: IndexedDB 폴백용 세션 데이터 (JSON)

### 4.3 컴포넌트 구조

```
src/
├── components/progress/
│   ├── progress-bar.tsx        # 전체 진행률 표시
│   ├── segment-progress.tsx    # 개별 세그먼트 상태 표시
│   ├── session-summary.tsx     # 학습 완료 시 요약
│   ├── resume-prompt.tsx       # 이어하기 프롬프트
│   └── session-list.tsx        # 세션 목록 (선택적)
├── stores/progress-store.ts    # Zustand 진행률 상태
├── lib/db/progress-db.ts       # IndexedDB 래퍼
├── hooks/
│   ├── use-progress-tracker.ts # 진행률 추적 훅
│   └── use-session-timer.ts    # 학습 시간 측정 훅
└── types/progress.ts           # 타입 정의
```

### 4.4 상태 관리 (Zustand)

```typescript
// stores/progress-store.ts

interface ProgressState {
  // State
  currentSession: SessionData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initSession: (contentId: string, contentTitle: string, totalSegments: number) => Promise<void>;
  updateSegmentStatus: (segmentId: string, status: SegmentStatus) => Promise<void>;
  completeSegment: (segmentId: string) => Promise<void>;
  loadExistingSession: (sessionId: string) => Promise<void>;
  getUnfinishedSessions: () => Promise<SessionListItem[]>;
  deleteSession: (sessionId: string) => Promise<void>;

  // Computed (selector)
  getCompletionRate: () => number;
  getCurrentSegmentProgress: (segmentId: string) => SegmentProgress | undefined;
}
```

### 4.5 API 인터페이스

#### progress-db.ts

```typescript
// 세션 생성
createSession(data: Omit<SessionData, 'sessionId'>): Promise<string>;

// 세션 조회
getSession(sessionId: string): Promise<SessionData | undefined>;
getSessionByContent(contentId: string): Promise<SessionData | undefined>;
getAllSessions(): Promise<SessionData[]>;

// 세션 업데이트
updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void>;
updateSegmentProgress(sessionId: string, segmentId: string, progress: Partial<SegmentProgress>): Promise<void>;

// 세션 삭제
deleteSession(sessionId: string): Promise<void>;
cleanupOldSessions(maxAgeDays: number): Promise<number>;

// 폴백
isIndexedDBAvailable(): Promise<boolean>;
```

---

## 5. Constraints (제약사항)

### 5.1 기술적 제약

- [C-TECH-001] IndexedDB 비동기 API 사용 필수
- [C-TECH-002] localStorage는 5MB 제한 준수
- [C-TECH-003] 세션 데이터는 JSON 직렬화 가능해야 함

### 5.2 성능 제약

- [C-PERF-001] 진행률 저장 응답 시간: < 1초
- [C-PERF-002] 세션 목록 로딩 시간: < 500ms
- [C-PERF-003] 최대 세션 수: 100개

### 5.3 보안 제약

- [C-SEC-001] 사용자 데이터는 클라이언트에만 저장
- [C-SEC-002] 민감한 정보 저장 금지 (개인정보 등)

---

## 6. Traceability (추적성)

### 관련 SPEC

- SPEC-INIT-001: 프로젝트 초기화 (선행)
- SPEC-UPLOAD-001: 콘텐츠 업로드 (선행)
- SPEC-PLAYER-001: 오디오 플레이어 (병행)
- SPEC-MODE-001: 학습 모드 (병행)

### 관련 파일

- `.moai/specs/SPEC-PROGRESS-001/plan.md`: 구현 계획
- `.moai/specs/SPEC-PROGRESS-001/acceptance.md`: 인수 기준

---

## Appendix: 참고 자료

### A. IndexedDB 브라우저 지원

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 24+ | Full |
| Firefox | 16+ | Full |
| Safari | 10+ | Full |
| Edge | 12+ | Full |

### B. 용량 추정

- 세션 데이터 (평균): ~5KB
- 100개 세션: ~500KB
- localStorage 폴백: ~1-2개 세션 (~10KB)
