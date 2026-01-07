# SPEC-PROGRESS-001: 구현 계획

---
spec_id: SPEC-PROGRESS-001
title: 진행률 관리 및 저장 - 구현 계획
created: 2025-01-07
status: Planned
author: MoAI-ADK
tags: [progress, indexeddb, storage, session, tracking, implementation-plan]
---

## 1. 구현 개요

### 1.1 목표

Shadow Tutor 앱의 학습 진행률 관리 시스템을 구현합니다. 사용자의 학습 진행 상태를 추적하고, IndexedDB를 통해 영속적으로 저장하며, 이어하기 기능을 제공합니다.

### 1.2 범위

- 세그먼트별 학습 완료 상태 추적 (미시작/진행중/완료)
- 세션 통계 (학습 시간, 완료 세그먼트 수, 완료율)
- IndexedDB를 통한 세션 데이터 영속화
- 진행률 시각화 UI (ProgressBar, SegmentProgress, SessionSummary, ResumePrompt)
- 이어하기 기능 (마지막 학습 위치 복원)

---

## 2. 기술 스택

### 2.1 핵심 라이브러리

| Library | Version | Purpose |
|---------|---------|---------|
| idb | ^8.0.0 | IndexedDB wrapper (Promise-based) |
| zustand | ^5.0.0 | 상태 관리 (이미 설치됨) |
| @radix-ui/react-progress | latest | ProgressBar 컴포넌트 기반 |

### 2.2 의존성 설치

```bash
npm install idb
```

### 2.3 기존 의존성 활용

- `zustand`: 전역 상태 관리 (progress-store)
- `shadcn/ui`: UI 컴포넌트 (Card, Button, Progress)
- `tailwindcss`: 스타일링

---

## 3. 구현 마일스톤

### Priority High: 핵심 기능

#### Milestone 1: 데이터 레이어 구축

**목표**: IndexedDB 기반 저장소 및 타입 시스템 구축

**Tasks**:
1. [ ] `src/types/progress.ts` - 타입 정의
   - SegmentStatus 타입
   - SegmentProgress 인터페이스
   - SessionData 인터페이스
   - SessionListItem 인터페이스

2. [ ] `src/lib/db/progress-db.ts` - IndexedDB 래퍼
   - DB 초기화 함수
   - CRUD 메서드 구현
   - 인덱스 설정 (by-content, by-last-active)
   - IndexedDB 가용성 체크
   - localStorage 폴백 로직

3. [ ] 단위 테스트 작성
   - DB 초기화 테스트
   - CRUD 동작 테스트
   - 폴백 로직 테스트

#### Milestone 2: 상태 관리 레이어

**목표**: Zustand 기반 진행률 상태 관리

**Tasks**:
1. [ ] `src/stores/progress-store.ts` - Zustand 스토어
   - 상태 정의 (currentSession, isLoading, error)
   - 액션 구현 (initSession, updateSegmentStatus, completeSegment)
   - 세션 로드/저장 로직
   - 셀렉터 구현 (getCompletionRate)

2. [ ] `src/hooks/use-progress-tracker.ts` - 진행률 추적 훅
   - practice-store 구독
   - 세그먼트 변경 감지
   - 자동 상태 업데이트

3. [ ] `src/hooks/use-session-timer.ts` - 학습 시간 측정 훅
   - 타이머 시작/정지
   - 누적 시간 계산
   - 백그라운드 탭 처리

4. [ ] 단위 테스트 작성
   - 스토어 액션 테스트
   - 훅 동작 테스트

### Priority Medium: UI 컴포넌트

#### Milestone 3: 진행률 표시 컴포넌트

**목표**: 진행률 시각화 UI 구현

**Tasks**:
1. [ ] `src/components/progress/progress-bar.tsx`
   - 전체 진행률 표시 (% 기반)
   - 애니메이션 효과
   - 완료 세그먼트 / 전체 세그먼트 텍스트

2. [ ] `src/components/progress/segment-progress.tsx`
   - 개별 세그먼트 상태 아이콘
   - 상태별 색상 구분
   - 반복 횟수 표시

3. [ ] `src/components/progress/session-summary.tsx`
   - 학습 완료 시 모달
   - 통계 표시 (완료율, 학습 시간, 반복 횟수)
   - 완료 축하 메시지

4. [ ] 컴포넌트 테스트 작성
   - 렌더링 테스트
   - 상태 변화 테스트

#### Milestone 4: 세션 복원 컴포넌트

**목표**: 이어하기 기능 UI 구현

**Tasks**:
1. [ ] `src/components/progress/resume-prompt.tsx`
   - 미완료 세션 감지 시 표시
   - 이어하기 / 새로 시작 선택
   - 세션 정보 미리보기

2. [ ] `src/components/progress/session-list.tsx` (선택적)
   - 저장된 세션 목록
   - 세션 선택 기능
   - 세션 삭제 기능

3. [ ] 통합 테스트 작성
   - 이어하기 플로우 테스트
   - 세션 전환 테스트

### Priority Low: 부가 기능

#### Milestone 5: 선택적 기능 (Optional)

**목표**: 사용자 경험 향상 기능

**Tasks**:
1. [ ] 세션 삭제 기능 (OF-002)
   - 삭제 확인 다이얼로그
   - IndexedDB에서 제거

2. [ ] 학습 시간 통계 표시 (OF-003)
   - SessionSummary에 총 학습 시간
   - 포맷팅 (시:분:초)

3. [ ] 오래된 세션 자동 정리
   - 30일 이상 세션 삭제
   - 앱 시작 시 실행

---

## 4. 파일 구조

```
src/
├── types/
│   └── progress.ts                 # 진행률 관련 타입
├── lib/
│   └── db/
│       └── progress-db.ts          # IndexedDB 래퍼
├── stores/
│   └── progress-store.ts           # Zustand 진행률 스토어
├── hooks/
│   ├── use-progress-tracker.ts     # 진행률 추적 훅
│   └── use-session-timer.ts        # 학습 시간 측정 훅
├── components/
│   └── progress/
│       ├── progress-bar.tsx        # 진행률 바
│       ├── segment-progress.tsx    # 세그먼트 상태
│       ├── session-summary.tsx     # 세션 요약
│       ├── resume-prompt.tsx       # 이어하기 프롬프트
│       └── session-list.tsx        # 세션 목록 (선택적)
└── __tests__/
    └── progress/
        ├── progress-db.test.ts     # DB 테스트
        ├── progress-store.test.ts  # 스토어 테스트
        └── components.test.tsx     # 컴포넌트 테스트
```

---

## 5. 기술적 접근

### 5.1 IndexedDB 설계

```typescript
// Database Schema
const DB_NAME = 'shadow-tutor-progress';
const DB_VERSION = 1;

// Object Store: sessions
// Key: sessionId (UUID)
// Indexes:
//   - by-content: contentId (unique per content)
//   - by-last-active: lastActiveAt (for sorting)

async function initDB(): Promise<IDBDatabase> {
  return openDB<ProgressDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore('sessions', { keyPath: 'sessionId' });
      store.createIndex('by-content', 'contentId', { unique: true });
      store.createIndex('by-last-active', 'lastActiveAt');
    },
  });
}
```

### 5.2 localStorage 폴백 전략

```typescript
// 폴백 조건
// 1. IndexedDB 초기화 실패
// 2. 프라이빗 브라우징 모드 (일부 브라우저)
// 3. 저장 용량 초과

// 폴백 시 제한사항
// - 단일 세션만 저장 (용량 제한)
// - 오래된 세션 자동 정리 비활성화
// - 세션 목록 기능 제한
```

### 5.3 상태 동기화 전략

```
practice-store (세그먼트 변경)
        │
        ▼
use-progress-tracker (변경 감지)
        │
        ▼
progress-store (상태 업데이트)
        │
        ├──▶ UI 업데이트 (즉시)
        │
        └──▶ IndexedDB 저장 (debounced, 500ms)
```

### 5.4 세션 ID 생성

```typescript
// UUID v4 기반 세션 ID
function generateSessionId(): string {
  return crypto.randomUUID();
}
```

---

## 6. 리스크 분석

### 6.1 기술적 리스크

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| IndexedDB 미지원 | Low | High | localStorage 폴백 구현 |
| 저장 용량 초과 | Low | Medium | 오래된 세션 자동 정리 |
| 브라우저 탭 충돌 | Medium | Low | 단일 탭 사용 권장 |
| 데이터 손상 | Low | High | JSON 유효성 검증 |

### 6.2 성능 리스크

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 저장 지연 | Medium | Medium | Debouncing (500ms) |
| 메모리 누수 | Low | Medium | 구독 정리 필수 |
| 렌더링 성능 | Low | Low | useMemo/useCallback |

---

## 7. 테스트 전략

### 7.1 단위 테스트

- **progress-db.ts**: IndexedDB CRUD, 폴백 로직
- **progress-store.ts**: 액션, 셀렉터
- **hooks**: 구독, 타이머 동작

### 7.2 통합 테스트

- 세션 생성 → 진행률 업데이트 → 저장 → 복원 플로우
- 폴백 시나리오 (IndexedDB 실패)

### 7.3 E2E 테스트 (선택적)

- 전체 학습 플로우
- 이어하기 기능

---

## 8. 의존성 관계

```
SPEC-UPLOAD-001 (콘텐츠 업로드)
        │
        ▼
SPEC-PROGRESS-001 (진행률 관리) ◀──▶ SPEC-PLAYER-001 (오디오 플레이어)
        │                                    │
        ▼                                    ▼
    progress-store ◀───────────────── practice-store
        │
        ▼
    IndexedDB / localStorage
```

---

## 9. 구현 순서 권장

1. **타입 정의** (types/progress.ts)
2. **IndexedDB 래퍼** (lib/db/progress-db.ts)
3. **Zustand 스토어** (stores/progress-store.ts)
4. **진행률 추적 훅** (hooks/use-progress-tracker.ts)
5. **ProgressBar 컴포넌트** (components/progress/progress-bar.tsx)
6. **ResumePrompt 컴포넌트** (components/progress/resume-prompt.tsx)
7. **SessionSummary 컴포넌트** (components/progress/session-summary.tsx)
8. **SegmentProgress 컴포넌트** (components/progress/segment-progress.tsx)
9. **SessionList 컴포넌트** (선택적)
10. **학습 시간 측정 훅** (hooks/use-session-timer.ts)

---

## 10. 체크포인트

### Milestone 1 완료 기준
- [ ] 타입 정의 완료
- [ ] IndexedDB CRUD 동작 확인
- [ ] localStorage 폴백 동작 확인
- [ ] 단위 테스트 통과

### Milestone 2 완료 기준
- [ ] Zustand 스토어 구현 완료
- [ ] 훅 구현 완료
- [ ] practice-store 연동 확인
- [ ] 단위 테스트 통과

### Milestone 3 완료 기준
- [ ] 모든 UI 컴포넌트 구현 완료
- [ ] 진행률 표시 동작 확인
- [ ] 반응형 디자인 적용
- [ ] 컴포넌트 테스트 통과

### Milestone 4 완료 기준
- [ ] 이어하기 프롬프트 동작 확인
- [ ] 세션 복원 기능 동작 확인
- [ ] 통합 테스트 통과

### 전체 완료 기준
- [ ] 모든 테스트 통과 (Coverage ≥ 85%)
- [ ] 성능 요구사항 충족 (저장 < 1초)
- [ ] 코드 리뷰 완료
- [ ] 문서화 완료

---

## Appendix: 참고 코드

### A. idb 사용 예시

```typescript
import { openDB, DBSchema } from 'idb';

interface ProgressDB extends DBSchema {
  sessions: {
    key: string;
    value: SessionData;
    indexes: { 'by-content': string; 'by-last-active': number };
  };
}

const db = await openDB<ProgressDB>('shadow-tutor-progress', 1, {
  upgrade(db) {
    const store = db.createObjectStore('sessions', { keyPath: 'sessionId' });
    store.createIndex('by-content', 'contentId', { unique: true });
    store.createIndex('by-last-active', 'lastActiveAt');
  },
});

// Create
await db.add('sessions', sessionData);

// Read
const session = await db.get('sessions', sessionId);

// Update
await db.put('sessions', updatedSessionData);

// Delete
await db.delete('sessions', sessionId);

// Query by index
const sessionByContent = await db.getFromIndex('sessions', 'by-content', contentId);
```

### B. Zustand 스토어 패턴

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ProgressState {
  currentSession: SessionData | null;
  // ...
}

export const useProgressStore = create<ProgressState>()(
  devtools(
    (set, get) => ({
      currentSession: null,
      // actions
    }),
    { name: 'progress-store' }
  )
);
```
