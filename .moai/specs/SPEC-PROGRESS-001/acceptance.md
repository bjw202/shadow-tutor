# SPEC-PROGRESS-001: 인수 기준

---
spec_id: SPEC-PROGRESS-001
title: 진행률 관리 및 저장 - 인수 기준
created: 2025-01-07
status: Planned
author: MoAI-ADK
tags: [progress, indexeddb, storage, session, tracking, acceptance-criteria]
---

## 1. 개요

이 문서는 SPEC-PROGRESS-001 (진행률 관리 및 저장) 기능의 인수 기준을 정의합니다. 모든 시나리오는 Given-When-Then 형식으로 작성되었습니다.

---

## 2. Feature: 세션 초기화 및 생성

### Scenario 2.1: 새로운 콘텐츠로 학습 시작 시 세션 생성

```gherkin
Feature: 세션 초기화 및 생성
  사용자가 새로운 콘텐츠로 학습을 시작하면
  시스템은 새로운 세션을 생성하고 IndexedDB에 저장해야 한다

  Scenario: 새로운 콘텐츠로 학습 시작 시 세션 생성
    Given 사용자가 콘텐츠 "English Podcast Episode 1"를 업로드했다
    And 해당 콘텐츠에 대한 기존 세션이 없다
    And 콘텐츠에 10개의 세그먼트가 있다
    When 사용자가 학습을 시작한다
    Then 새로운 세션이 생성되어야 한다
    And 세션의 contentId가 업로드된 콘텐츠 ID와 일치해야 한다
    And 세션의 totalSegments가 10이어야 한다
    And 세션의 completedSegments가 0이어야 한다
    And 모든 segmentProgress의 status가 "not_started"여야 한다
    And 세션이 IndexedDB에 저장되어야 한다
```

### Scenario 2.2: 기존 세션이 있는 콘텐츠로 학습 시작

```gherkin
  Scenario: 기존 세션이 있는 콘텐츠로 학습 시작
    Given 사용자가 콘텐츠 "English Podcast Episode 1"를 선택했다
    And 해당 콘텐츠에 대한 미완료 세션이 존재한다
    When 사용자가 학습을 시작한다
    Then 새로운 세션이 생성되지 않아야 한다
    And 기존 세션이 로드되어야 한다
    And ResumePrompt가 표시되어야 한다
```

### Scenario 2.3: IndexedDB 접근 불가 시 폴백

```gherkin
  Scenario: IndexedDB 접근 불가 시 localStorage 폴백
    Given IndexedDB가 사용 불가능한 환경이다 (프라이빗 브라우징 등)
    And 사용자가 새로운 콘텐츠로 학습을 시작한다
    When 세션 생성이 시도된다
    Then 시스템은 localStorage를 폴백으로 사용해야 한다
    And 세션 데이터가 localStorage에 저장되어야 한다
    And 사용자에게 오류 메시지가 표시되지 않아야 한다
```

---

## 3. Feature: 세그먼트 진행률 추적

### Scenario 3.1: 세그먼트 재생 완료 시 상태 업데이트

```gherkin
Feature: 세그먼트 진행률 추적
  사용자가 세그먼트를 학습하면
  시스템은 해당 세그먼트의 상태를 추적하고 업데이트해야 한다

  Scenario: 세그먼트 재생 완료 시 상태 업데이트
    Given 사용자가 세그먼트 3을 학습 중이다
    And 세그먼트 3의 상태가 "in_progress"이다
    When 세그먼트 3의 재생이 완료된다
    Then 세그먼트 3의 상태가 "completed"로 변경되어야 한다
    And 세그먼트 3의 lastPracticedAt이 현재 시간으로 업데이트되어야 한다
    And 세션의 completedSegments가 1 증가해야 한다
    And 변경사항이 IndexedDB에 저장되어야 한다
```

### Scenario 3.2: 세그먼트 반복 학습 시 repeatCount 증가

```gherkin
  Scenario: 세그먼트 반복 학습 시 repeatCount 증가
    Given 사용자가 세그먼트 3을 학습 중이다
    And 세그먼트 3의 repeatCount가 2이다
    When 세그먼트 3의 재생이 완료된다
    Then 세그먼트 3의 repeatCount가 3으로 증가해야 한다
```

### Scenario 3.3: 새로운 세그먼트로 이동 시 상태 저장

```gherkin
  Scenario: 새로운 세그먼트로 이동 시 상태 저장
    Given 사용자가 세그먼트 2를 학습 중이다
    And 세그먼트 2의 상태가 "in_progress"이다
    When 사용자가 세그먼트 3으로 이동한다
    Then 세그먼트 2의 현재 상태가 저장되어야 한다
    And 세그먼트 3의 상태가 "in_progress"로 변경되어야 한다
    And lastActiveAt이 현재 시간으로 업데이트되어야 한다
```

### Scenario 3.4: 진행률 저장 실패 시 재시도

```gherkin
  Scenario: 진행률 저장 실패 시 재시도
    Given 사용자가 세그먼트 3을 완료했다
    And IndexedDB 저장이 일시적으로 실패했다
    When 저장 재시도가 실행된다
    Then 최대 3회까지 저장을 재시도해야 한다
    And 재시도 성공 시 데이터가 저장되어야 한다
    And 재시도 실패 시 메모리 캐시에 보관되어야 한다
```

---

## 4. Feature: 진행률 표시

### Scenario 4.1: 진행률 바 표시

```gherkin
Feature: 진행률 표시
  활성 세션이 있을 때
  시스템은 진행률을 시각적으로 표시해야 한다

  Scenario: 진행률 바 표시
    Given 세션이 활성 상태이다
    And 전체 세그먼트가 10개이다
    And 완료된 세그먼트가 3개이다
    When 진행률 바가 렌더링된다
    Then 진행률 바가 30%를 표시해야 한다
    And "3/10 완료" 텍스트가 표시되어야 한다
```

### Scenario 4.2: 학습 완료 시 세션 요약 표시

```gherkin
  Scenario: 학습 완료 시 세션 요약 표시
    Given 전체 세그먼트가 10개이다
    And 완료된 세그먼트가 9개이다
    When 마지막 세그먼트(10번째)가 완료된다
    Then SessionSummary 모달이 표시되어야 한다
    And 완료율 100%가 표시되어야 한다
    And 총 학습 시간이 표시되어야 한다
    And 축하 메시지가 표시되어야 한다
```

### Scenario 4.3: 세그먼트별 상태 아이콘 표시

```gherkin
  Scenario: 세그먼트별 상태 아이콘 표시
    Given 세션에 5개의 세그먼트가 있다
    And 세그먼트 1, 2는 완료 상태이다
    And 세그먼트 3은 진행 중 상태이다
    And 세그먼트 4, 5는 미시작 상태이다
    When 세그먼트 진행률이 렌더링된다
    Then 세그먼트 1, 2는 완료 아이콘(체크마크)을 표시해야 한다
    And 세그먼트 3은 진행 중 아이콘을 표시해야 한다
    And 세그먼트 4, 5는 미시작 아이콘을 표시해야 한다
```

---

## 5. Feature: 세션 복원 (이어하기)

### Scenario 5.1: 앱 시작 시 미완료 세션 감지

```gherkin
Feature: 세션 복원 (이어하기)
  사용자가 앱을 다시 시작할 때
  시스템은 미완료 세션을 복원할 수 있어야 한다

  Scenario: 앱 시작 시 미완료 세션 감지
    Given 사용자가 이전에 "English Podcast Episode 1"을 학습했다
    And 해당 세션이 50% 완료 상태로 저장되어 있다
    When 사용자가 앱을 시작한다
    Then ResumePrompt가 표시되어야 한다
    And 콘텐츠 제목 "English Podcast Episode 1"이 표시되어야 한다
    And 진행률 "50% 완료"가 표시되어야 한다
    And "이어하기" 버튼이 활성화되어야 한다
```

### Scenario 5.2: 이어하기 선택 시 마지막 위치로 복원

```gherkin
  Scenario: 이어하기 선택 시 마지막 위치로 복원
    Given ResumePrompt가 표시되어 있다
    And 마지막으로 학습한 세그먼트가 5번째이다
    When 사용자가 "이어하기" 버튼을 클릭한다
    Then 세션이 복원되어야 한다
    And 플레이어가 세그먼트 5로 이동해야 한다
    And 진행률 바가 현재 상태를 반영해야 한다
```

### Scenario 5.3: 새로 시작 선택 시 세션 초기화

```gherkin
  Scenario: 새로 시작 선택 시 세션 초기화
    Given ResumePrompt가 표시되어 있다
    And 기존 세션이 50% 완료 상태이다
    When 사용자가 "새로 시작" 버튼을 클릭한다
    Then 기존 세션의 진행률이 초기화되어야 한다
    And 모든 세그먼트 상태가 "not_started"로 변경되어야 한다
    And 플레이어가 첫 번째 세그먼트로 이동해야 한다
```

### Scenario 5.4: 완료된 세션이 있는 경우

```gherkin
  Scenario: 완료된 세션이 있는 경우
    Given 사용자가 "English Podcast Episode 1"을 완료했다
    And 해당 세션이 100% 완료 상태이다
    When 사용자가 같은 콘텐츠로 학습을 시작한다
    Then ResumePrompt에 "다시 학습하기" 옵션이 표시되어야 한다
    And "다시 학습하기" 선택 시 진행률이 초기화되어야 한다
```

---

## 6. Feature: 세션 관리

### Scenario 6.1: 세션 삭제

```gherkin
Feature: 세션 관리
  사용자가 저장된 세션을 관리할 수 있어야 한다

  Scenario: 세션 삭제
    Given 세션 목록에 3개의 세션이 있다
    And "English Podcast Episode 2" 세션이 선택되어 있다
    When 사용자가 삭제 버튼을 클릭한다
    And 삭제 확인 다이얼로그에서 "삭제"를 선택한다
    Then 해당 세션이 IndexedDB에서 삭제되어야 한다
    And 세션 목록에서 해당 세션이 제거되어야 한다
    And 세션 목록에 2개의 세션만 표시되어야 한다
```

### Scenario 6.2: 오래된 세션 자동 정리

```gherkin
  Scenario: 오래된 세션 자동 정리
    Given 30일 이상 된 세션이 2개 존재한다
    And 30일 미만의 세션이 3개 존재한다
    When 앱이 시작된다
    Then 30일 이상 된 세션 2개가 삭제되어야 한다
    And 30일 미만의 세션 3개는 유지되어야 한다
```

---

## 7. Feature: 성능 요구사항

### Scenario 7.1: 진행률 저장 응답 시간

```gherkin
Feature: 성능 요구사항
  시스템은 정의된 성능 기준을 충족해야 한다

  Scenario: 진행률 저장 응답 시간
    Given 세션이 활성 상태이다
    When 세그먼트 상태가 업데이트된다
    Then 저장이 1초 이내에 완료되어야 한다
```

### Scenario 7.2: 세션 목록 로딩 시간

```gherkin
  Scenario: 세션 목록 로딩 시간
    Given IndexedDB에 50개의 세션이 저장되어 있다
    When 세션 목록이 요청된다
    Then 목록이 500ms 이내에 로드되어야 한다
```

---

## 8. Edge Cases

### Scenario 8.1: 저장 중 브라우저 종료

```gherkin
Feature: Edge Cases
  시스템은 예외 상황을 안전하게 처리해야 한다

  Scenario: 저장 중 브라우저 종료
    Given 사용자가 세그먼트를 완료했다
    And 저장이 진행 중이다
    When 브라우저가 갑자기 종료된다
    Then 다음 앱 시작 시 마지막으로 저장된 상태가 복원되어야 한다
    And 저장되지 않은 진행률은 손실될 수 있다 (허용됨)
```

### Scenario 8.2: 동일 콘텐츠 중복 세션 방지

```gherkin
  Scenario: 동일 콘텐츠 중복 세션 방지
    Given "English Podcast Episode 1"에 대한 세션이 이미 존재한다
    When 같은 콘텐츠로 새 세션 생성이 시도된다
    Then 새 세션이 생성되지 않아야 한다
    And 기존 세션이 활성화되어야 한다
```

### Scenario 8.3: localStorage 용량 초과

```gherkin
  Scenario: localStorage 용량 초과 (폴백 모드)
    Given IndexedDB가 사용 불가능하다
    And localStorage가 거의 가득 찬 상태이다
    When 새 세션 저장이 시도된다
    Then 가장 오래된 세션이 삭제되어야 한다
    And 새 세션이 저장되어야 한다
```

---

## 9. Quality Gates

### 9.1 코드 품질

- [ ] 테스트 커버리지 ≥ 85%
- [ ] TypeScript strict 모드 적용
- [ ] ESLint 경고 0개
- [ ] 모든 함수에 JSDoc 주석

### 9.2 성능 기준

- [ ] 진행률 저장: < 1초
- [ ] 세션 목록 로딩: < 500ms
- [ ] 메모리 누수 없음 (Chrome DevTools 검증)

### 9.3 접근성

- [ ] 키보드 탐색 지원
- [ ] 스크린 리더 호환
- [ ] 색상 대비 WCAG 2.1 AA 준수

### 9.4 브라우저 호환성

- [ ] Chrome 90+ 테스트 통과
- [ ] Firefox 88+ 테스트 통과
- [ ] Safari 14+ 테스트 통과
- [ ] Edge 90+ 테스트 통과

---

## 10. Definition of Done

이 SPEC의 구현이 완료되었다고 판단하기 위한 조건:

1. **모든 시나리오 통과**: 위에 정의된 모든 Given-When-Then 시나리오가 통과해야 함
2. **Quality Gates 충족**: 모든 품질 기준이 충족되어야 함
3. **코드 리뷰 완료**: 최소 1명의 리뷰어 승인
4. **문서화 완료**:
   - API 문서 업데이트
   - README 업데이트
   - 변경 사항 CHANGELOG 추가
5. **통합 테스트 통과**: 기존 기능과의 통합 테스트 통과
6. **사용자 테스트**: 최소 3개의 학습 세션 완료 테스트

---

## Appendix: 테스트 데이터

### A. 샘플 세션 데이터

```typescript
const sampleSession: SessionData = {
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  contentId: 'content-001',
  contentTitle: 'English Podcast Episode 1',
  totalSegments: 10,
  completedSegments: 3,
  startedAt: 1704585600000, // 2025-01-07 00:00:00
  lastActiveAt: 1704589200000, // 2025-01-07 01:00:00
  totalDurationMs: 3600000, // 1 hour
  segmentProgress: [
    { segmentId: 'seg-1', status: 'completed', repeatCount: 2, lastPracticedAt: 1704586200000 },
    { segmentId: 'seg-2', status: 'completed', repeatCount: 1, lastPracticedAt: 1704587400000 },
    { segmentId: 'seg-3', status: 'completed', repeatCount: 1, lastPracticedAt: 1704588600000 },
    { segmentId: 'seg-4', status: 'in_progress', repeatCount: 0, lastPracticedAt: 1704589200000 },
    { segmentId: 'seg-5', status: 'not_started', repeatCount: 0, lastPracticedAt: 0 },
    // ... 나머지 세그먼트
  ],
};
```

### B. 테스트 시나리오 매핑

| Scenario | 관련 요구사항 | 우선순위 |
|----------|--------------|---------|
| 2.1 | UR-002, ED-001 | High |
| 2.2 | ED-002, UB-003 | High |
| 2.3 | SD-003, UB-002 | High |
| 3.1 | ED-001, UR-004 | High |
| 3.2 | UR-004 | Medium |
| 3.3 | ED-004, UR-003 | High |
| 3.4 | UB-001 | Medium |
| 4.1 | UR-001, SD-001 | High |
| 4.2 | SD-002, OF-003 | Medium |
| 4.3 | UR-004 | Medium |
| 5.1 | ED-002 | High |
| 5.2 | ED-003 | High |
| 5.3 | ED-003 | Medium |
| 5.4 | SD-002 | Low |
| 6.1 | OF-002, ED-005 | Low |
| 6.2 | UB-004 | Low |
| 7.1 | UR-003 | High |
| 7.2 | - | Medium |
