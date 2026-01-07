# SPEC-MODE-001-FIX: 인수 기준

---
spec_id: SPEC-MODE-001-FIX
title: 연속 모드 자동 다음 문장 기능 버그 수정 - 인수 기준
created: 2026-01-07
status: Implemented
author: MoAI-ADK
tags: [bugfix, continuous-mode, auto-advance, acceptance-criteria]
---

## 1. 개요

이 문서는 SPEC-MODE-001-FIX (연속 모드 자동 다음 문장 기능 버그 수정)의 인수 기준을 정의합니다.

---

## 2. Feature: 연속 모드 자동 진행

### Scenario 2.1: 연속 모드에서 자동으로 다음 세그먼트로 진행 (AC-002 재검증)

```gherkin
Feature: 연속 모드 자동 진행
  연속 재생 모드에서 세그먼트 재생이 완료되면
  시스템은 자동으로 다음 세그먼트를 재생해야 한다

  Scenario: 연속 모드에서 자동으로 다음 세그먼트로 진행
    Given 사용자가 연속 재생 모드를 선택했다
    And 현재 세그먼트 2/5를 재생 중이다
    When 세그먼트 2의 재생이 완료된다
    Then 세그먼트 3이 자동으로 재생되어야 한다
    And 세그먼트 인디케이터가 3/5로 업데이트되어야 한다
    And playbackState가 "playing"이어야 한다
```

### Scenario 2.2: 마지막 세그먼트에서 정지 (AC-003)

```gherkin
  Scenario: 마지막 세그먼트에서 정지
    Given 사용자가 연속 재생 모드를 선택했다
    And 현재 마지막 세그먼트 5/5를 재생 중이다
    When 세그먼트 5의 재생이 완료된다
    Then 재생이 정지되어야 한다
    And 다음 세그먼트로 진행하지 않아야 한다
    And playbackState가 "stopped"이어야 한다
```

### Scenario 2.3: 중간 세그먼트에서 연속 진행

```gherkin
  Scenario: 여러 세그먼트 연속 진행
    Given 사용자가 연속 재생 모드를 선택했다
    And 현재 세그먼트 1/5를 재생 중이다
    When 세그먼트 1의 재생이 완료된다
    And 세그먼트 2의 재생이 완료된다
    And 세그먼트 3의 재생이 완료된다
    Then 세그먼트 4가 재생되어야 한다
    And 세그먼트 인디케이터가 4/5로 표시되어야 한다
```

---

## 3. Feature: 쉐도잉 모드 영향 없음

### Scenario 3.1: 쉐도잉 모드 기존 동작 유지

```gherkin
Feature: 쉐도잉 모드 기존 동작 유지
  버그 수정 후에도 쉐도잉 모드는 기존과 동일하게 동작해야 한다

  Scenario: 쉐도잉 모드에서 타이머 동작
    Given 사용자가 쉐도잉 모드를 선택했다
    And 일시정지 시간이 5초로 설정되어 있다
    When 세그먼트 재생이 완료된다
    Then 5초 카운트다운 타이머가 표시되어야 한다
    And isShadowingPaused가 true이어야 한다
```

### Scenario 3.2: 쉐도잉 모드 반복 동작

```gherkin
  Scenario: 쉐도잉 모드에서 반복 재생
    Given 사용자가 쉐도잉 모드를 선택했다
    And 반복 횟수가 2회로 설정되어 있다
    And 현재 반복 횟수가 0이다
    When 세그먼트 재생이 완료된다
    And 일시정지 시간이 경과한다
    Then 같은 세그먼트가 다시 재생되어야 한다
    And 반복 횟수가 1로 증가해야 한다
```

---

## 4. Feature: 하위 호환성

### Scenario 4.1: 기존 useAudioPlayer 사용 코드 호환

```gherkin
Feature: 하위 호환성
  기존 코드가 변경 없이 동작해야 한다

  Scenario: 옵션 없이 useAudioPlayer 호출
    Given 기존 코드에서 useAudioPlayer()를 옵션 없이 호출한다
    When 훅이 실행된다
    Then 오류가 발생하지 않아야 한다
    And 모든 기능이 정상 동작해야 한다
```

### Scenario 4.2: 기존 AudioPlayer 사용 코드 호환

```gherkin
  Scenario: onSegmentEnd 없이 AudioPlayer 사용
    Given 기존 코드에서 AudioPlayer를 onSegmentEnd 없이 사용한다
    When 컴포넌트가 렌더링된다
    Then 오류가 발생하지 않아야 한다
    And 모든 기능이 정상 동작해야 한다
```

---

## 5. Quality Gates

### 5.1 코드 품질

- [x] TypeScript strict 모드 오류 0개
- [x] ESLint 오류 0개
- [x] 테스트 커버리지 85% 이상 유지 (625/625 테스트 통과)

### 5.2 기능 검증

- [x] 연속 모드 자동 진행 동작 확인
- [x] 마지막 세그먼트 정지 동작 확인
- [x] 쉐도잉 모드 기존 동작 유지 확인

### 5.3 하위 호환성

- [x] 기존 테스트 전체 통과
- [x] 기존 코드 변경 없이 동작

---

## 6. Definition of Done

이 버그 수정이 완료되었다고 판단하기 위한 조건:

1. **모든 시나리오 통과**: 위에 정의된 모든 Given-When-Then 시나리오 통과
2. **Quality Gates 충족**: 모든 품질 기준 충족
3. **기존 테스트 통과**: SPEC-MODE-001 관련 테스트 전체 통과
4. **수동 테스트 완료**:
   - 연속 모드 자동 진행 동작 확인
   - 쉐도잉 모드 기존 동작 확인
5. **코드 리뷰 완료**: 변경 사항 검토
6. **문서화 완료**: SPEC 문서 동기화

---

## 7. 테스트 시나리오 매핑

| Scenario | 관련 요구사항 | 우선순위 |
|----------|--------------|---------|
| 2.1 | SPEC-MODE-001 AC-002 | High |
| 2.2 | SPEC-MODE-001 AC-003 | High |
| 2.3 | SPEC-MODE-001 AC-002 확장 | Medium |
| 3.1 | SPEC-MODE-001 AC-005 | High |
| 3.2 | SPEC-MODE-001 AC-006 | Medium |
| 4.1 | 하위 호환성 | High |
| 4.2 | 하위 호환성 | High |
