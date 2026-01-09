# SPEC-REPEAT-001-FIX: 구현 계획

## 추적성

- **SPEC ID**: SPEC-REPEAT-001-FIX
- **관련 문서**: [spec.md](./spec.md), [acceptance.md](./acceptance.md)

---

## 1. 구현 개요

### 1.1 목표

쉐도잉 모드에서 반복 횟수가 설정값보다 1회 적게 재생되는 off-by-one 버그를 수정한다.

### 1.2 수정 범위

| 항목 | 값 |
|------|-----|
| 수정 파일 | 1개 (`use-playback-mode.ts`) |
| 수정 위치 | 2곳 (비교 연산자 변경) |
| 수정 내용 | `<` → `<=` |
| 위험도 | 낮음 (단순 연산자 변경) |

---

## 2. 마일스톤

### 마일스톤 1: 코드 수정 (Priority High)

#### 작업 1.1: handlePauseComplete 함수 수정

- **파일**: `src/lib/hooks/use-playback-mode.ts`
- **위치**: 라인 53-72 부근
- **변경**: `newRepeatCount < state.shadowingSettings.repeatCount` → `newRepeatCount <= state.shadowingSettings.repeatCount`

#### 작업 1.2: skipPause 함수 수정

- **파일**: `src/lib/hooks/use-playback-mode.ts`
- **위치**: 라인 123-142 부근
- **변경**: `newRepeatCount < state.shadowingSettings.repeatCount` → `newRepeatCount <= state.shadowingSettings.repeatCount`

### 마일스톤 2: 테스트 작성 및 검증 (Priority High)

#### 작업 2.1: 단위 테스트 작성

- **파일**: `src/lib/hooks/__tests__/use-playback-mode.test.ts`
- **테스트 케이스**:
  - repeatCount=1 일 때 1회 재생 검증
  - repeatCount=2 일 때 2회 재생 검증
  - repeatCount=3 일 때 3회 재생 검증
  - skipPause 시 동일 로직 적용 검증

#### 작업 2.2: 기존 테스트 실행

- 전체 테스트 스위트 실행
- 회귀 테스트 확인

### 마일스톤 3: 문서화 (Priority Medium)

#### 작업 3.1: SPEC 문서 업데이트

- spec.md status를 "completed"로 변경
- HISTORY 섹션에 완료 기록 추가

---

## 3. 기술적 접근

### 3.1 문제 분석

```
현재 로직:
- newRepeatCount는 0부터 시작
- repeatCount=2 설정 시
  - newRepeatCount=0: 0 < 2 → true (1회차 재생)
  - newRepeatCount=1: 1 < 2 → true (2회차 재생)
  - newRepeatCount=2: 2 < 2 → false (다음 세그먼트로 이동)

문제: 위 분석은 잘못됨. 실제로는:
  - newRepeatCount=1: 1 < 2 → true (반복)
  - newRepeatCount=2: 2 < 2 → false (종료)
  → 실제 재생은 1회만 발생

수정 후 로직:
- newRepeatCount=1: 1 <= 2 → true (반복)
- newRepeatCount=2: 2 <= 2 → true (반복)
- newRepeatCount=3: 3 <= 2 → false (종료)
→ 2회 재생 후 종료
```

### 3.2 수정 전략

1. **최소 침습적 수정**: 비교 연산자만 변경 (`<` → `<=`)
2. **두 위치 동시 수정**: 동일한 로직이 두 곳에 있으므로 일관성 있게 수정
3. **테스트 우선**: 수정 전 실패하는 테스트 작성, 수정 후 통과 확인

---

## 4. 파일 변경 목록

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/lib/hooks/use-playback-mode.ts` | 수정 | 비교 연산자 2곳 변경 |
| `src/lib/hooks/__tests__/use-playback-mode.test.ts` | 추가/수정 | 반복 횟수 테스트 추가 |

---

## 5. 의존성

### 5.1 선행 조건

- 없음 (독립적인 버그 수정)

### 5.2 후행 작업

- 없음

---

## 6. 위험 요소 및 대응

| 위험 | 확률 | 영향 | 대응 방안 |
|------|------|------|-----------|
| 다른 기능에 영향 | 낮음 | 중간 | 전체 테스트 스위트 실행으로 회귀 확인 |
| 동일 로직 누락 | 낮음 | 높음 | 코드 검색으로 모든 위치 확인 |

---

## 7. 완료 조건

- [ ] `handlePauseComplete` 함수 수정 완료
- [ ] `skipPause` 함수 수정 완료
- [ ] 반복 횟수 관련 단위 테스트 통과
- [ ] 전체 테스트 스위트 통과
- [ ] 코드 리뷰 완료

---

## 8. 추적성

| 요구사항 ID | 구현 작업 |
|-------------|-----------|
| REQ-001 | 작업 1.1, 1.2 |
| REQ-002 | 작업 1.1, 1.2, 2.1 |
| REQ-003 | 작업 1.1, 1.2, 2.1 |
| REQ-004 | 작업 1.2, 2.1 |
| NFR-001 | 작업 2.2 |
