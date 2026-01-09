---
id: SPEC-REPEAT-001-FIX
version: "1.0.0"
status: "draft"
created: "2026-01-09"
updated: "2026-01-09"
author: "MoAI-ADK"
priority: "HIGH"
lifecycle: "spec-first"
tags:
  - bugfix
  - playback
  - repeat-count
  - shadowing
---

## HISTORY

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0.0 | 2026-01-09 | 최초 작성 - 반복 횟수 버그 수정 SPEC | MoAI-ADK |

---

# SPEC-REPEAT-001-FIX: 반복 횟수 버그 수정

## 1. 개요

### 1.1 문제 설명

쉐도잉 모드에서 사용자가 설정한 반복 횟수(repeatCount)보다 1회 적게 재생되는 버그가 발생한다.

- **현상**: 반복 횟수를 N으로 설정하면 N-1회만 재생됨
- **예시**: 2회 설정 시 1회만 재생, 3회 설정 시 2회만 재생
- **예외**: 1회 설정 시에는 정상 작동 (1회 재생)

### 1.2 근본 원인

`src/lib/hooks/use-playback-mode.ts` 파일에서 반복 횟수 비교 로직에 off-by-one 오류가 존재한다.

**문제 코드**:
```typescript
// 현재 (잘못된 로직)
if (newRepeatCount < state.shadowingSettings.repeatCount) {
  // 반복 재생 계속
}
```

**수정 코드**:
```typescript
// 수정 (올바른 로직)
if (newRepeatCount <= state.shadowingSettings.repeatCount) {
  // 반복 재생 계속
}
```

### 1.3 영향 범위

- **파일**: `src/lib/hooks/use-playback-mode.ts`
- **함수**:
  - `handlePauseComplete` (라인 53-72 부근)
  - `skipPause` (라인 123-142 부근)
- **기능**: 쉐도잉 모드에서의 세그먼트 반복 재생

---

## 2. 환경 (Environment)

### 2.1 시스템 환경

| 항목 | 값 |
|------|-----|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript 5.x |
| 상태관리 | Zustand |
| 테스트 | Vitest + React Testing Library |

### 2.2 관련 파일

| 파일 경로 | 역할 |
|-----------|------|
| `src/lib/hooks/use-playback-mode.ts` | 재생 모드 관리 훅 (수정 대상) |
| `src/stores/practice-store.ts` | 연습 상태 저장소 |
| `src/stores/settings-store.ts` | 설정 저장소 (repeatCount 포함) |

---

## 3. 가정 (Assumptions)

### 3.1 기술적 가정

- [A1] `repeatCount` 설정값은 항상 1 이상의 양의 정수이다
- [A2] `newRepeatCount`는 0부터 시작하여 증가한다 (0-indexed counter)
- [A3] 기존 테스트 코드가 이 버그를 감지하지 못했다

### 3.2 비즈니스 가정

- [A4] 사용자는 설정한 횟수만큼 정확히 반복 재생되기를 기대한다
- [A5] 1회 설정은 "반복 없음"이 아닌 "1회 재생"을 의미한다

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항

#### REQ-001: 반복 횟수 정확성 (Ubiquitous)

> 시스템은 **항상** 사용자가 설정한 반복 횟수(N)만큼 정확히 세그먼트를 재생해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트

#### REQ-002: 반복 횟수 1회 동작 (Event-Driven)

> **WHEN** 사용자가 반복 횟수를 1로 설정하고 세그먼트 재생이 완료되면 **THEN** 시스템은 다음 세그먼트로 이동해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트

#### REQ-003: 반복 횟수 다회 동작 (Event-Driven)

> **WHEN** 사용자가 반복 횟수를 N(N > 1)으로 설정하면 **THEN** 시스템은 동일 세그먼트를 정확히 N회 재생한 후 다음 세그먼트로 이동해야 한다.

- 우선순위: HIGH
- 검증방법: 단위 테스트

#### REQ-004: 일시정지 스킵 동작 (Event-Driven)

> **WHEN** 쉐도잉 일시정지 중 사용자가 스킵을 요청하면 **THEN** 시스템은 반복 횟수 로직을 동일하게 적용해야 한다.

- 우선순위: MEDIUM
- 검증방법: 단위 테스트

### 4.2 비기능 요구사항

#### NFR-001: 기존 기능 호환성 (Ubiquitous)

> 시스템은 **항상** 기존 재생 모드(일반 모드, 쉐도잉 모드)의 다른 기능에 영향을 주지 않아야 한다.

- 우선순위: HIGH
- 검증방법: 회귀 테스트

---

## 5. 명세 (Specifications)

### 5.1 수정 상세

#### 5.1.1 handlePauseComplete 함수 수정

**위치**: `src/lib/hooks/use-playback-mode.ts` (라인 53-72 부근)

**Before**:
```typescript
if (newRepeatCount < state.shadowingSettings.repeatCount) {
```

**After**:
```typescript
if (newRepeatCount <= state.shadowingSettings.repeatCount) {
```

#### 5.1.2 skipPause 함수 수정

**위치**: `src/lib/hooks/use-playback-mode.ts` (라인 123-142 부근)

**Before**:
```typescript
if (newRepeatCount < state.shadowingSettings.repeatCount) {
```

**After**:
```typescript
if (newRepeatCount <= state.shadowingSettings.repeatCount) {
```

### 5.2 로직 설명

| repeatCount 설정 | 카운터 범위 (0-indexed) | 재생 횟수 |
|------------------|-------------------------|-----------|
| 1 | 0, 1 (0 <= 1) | 1회 |
| 2 | 0, 1, 2 (0 <= 2, 1 <= 2) | 2회 |
| 3 | 0, 1, 2, 3 (0 <= 3, 1 <= 3, 2 <= 3) | 3회 |
| N | 0 ~ N | N회 |

### 5.3 테스트 시나리오

| 시나리오 ID | 설명 | 입력 | 기대 결과 |
|-------------|------|------|-----------|
| TC-001 | 반복 횟수 1 | repeatCount=1 | 1회 재생 후 다음 세그먼트 |
| TC-002 | 반복 횟수 2 | repeatCount=2 | 2회 재생 후 다음 세그먼트 |
| TC-003 | 반복 횟수 3 | repeatCount=3 | 3회 재생 후 다음 세그먼트 |
| TC-004 | 스킵 시 반복 | repeatCount=2, skip 호출 | 동일한 반복 로직 적용 |

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
| SPEC-PLAYBACK-001-FIX | 관련 | 재생 속도 버그 수정 (동일 파일) |
| SPEC-MODE-001 | 관련 | 재생 모드 초기 구현 |

---

## 7. 용어 정의

| 용어 | 정의 |
|------|------|
| repeatCount | 사용자가 설정한 세그먼트 반복 재생 횟수 |
| newRepeatCount | 현재까지 진행된 반복 횟수 카운터 (0부터 시작) |
| off-by-one error | 경계 조건에서 1만큼 차이가 나는 프로그래밍 오류 |
| 쉐도잉 모드 | TTS 음성을 듣고 따라 말하는 연습 모드 |
