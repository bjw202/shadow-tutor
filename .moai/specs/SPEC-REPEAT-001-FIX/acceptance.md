# SPEC-REPEAT-001-FIX: 인수 조건

## 추적성

- **SPEC ID**: SPEC-REPEAT-001-FIX
- **관련 문서**: [spec.md](./spec.md), [plan.md](./plan.md)

---

## 1. 인수 테스트 시나리오

### 1.1 반복 횟수 1회 설정 (REQ-002)

```gherkin
Feature: 반복 횟수 1회 설정 시 정상 동작

  Scenario: 반복 횟수 1회로 세그먼트 재생
    Given 쉐도잉 모드가 활성화되어 있다
    And 반복 횟수(repeatCount)가 1로 설정되어 있다
    And 현재 세그먼트 인덱스가 0이다
    When 세그먼트 재생이 완료된다
    And 쉐도잉 일시정지가 완료된다
    Then 세그먼트는 정확히 1회 재생되어야 한다
    And 다음 세그먼트(인덱스 1)로 이동해야 한다
```

### 1.2 반복 횟수 2회 설정 (REQ-003)

```gherkin
Feature: 반복 횟수 2회 설정 시 정상 동작

  Scenario: 반복 횟수 2회로 세그먼트 재생
    Given 쉐도잉 모드가 활성화되어 있다
    And 반복 횟수(repeatCount)가 2로 설정되어 있다
    And 현재 세그먼트 인덱스가 0이다
    When 세그먼트 재생이 완료된다
    And 쉐도잉 일시정지가 완료된다
    Then 세그먼트가 반복 재생되어야 한다
    When 세그먼트 재생이 두 번째로 완료된다
    And 쉐도잉 일시정지가 완료된다
    Then 세그먼트는 정확히 2회 재생되어야 한다
    And 다음 세그먼트(인덱스 1)로 이동해야 한다
```

### 1.3 반복 횟수 3회 설정 (REQ-003)

```gherkin
Feature: 반복 횟수 3회 설정 시 정상 동작

  Scenario: 반복 횟수 3회로 세그먼트 재생
    Given 쉐도잉 모드가 활성화되어 있다
    And 반복 횟수(repeatCount)가 3으로 설정되어 있다
    And 현재 세그먼트 인덱스가 0이다
    When 세그먼트 재생과 일시정지가 3회 완료된다
    Then 세그먼트는 정확히 3회 재생되어야 한다
    And 다음 세그먼트(인덱스 1)로 이동해야 한다
```

### 1.4 일시정지 스킵 시 반복 동작 (REQ-004)

```gherkin
Feature: 스킵 기능에서도 반복 횟수 정상 동작

  Scenario: 스킵 시 반복 횟수 로직 적용
    Given 쉐도잉 모드가 활성화되어 있다
    And 반복 횟수(repeatCount)가 2로 설정되어 있다
    And 현재 세그먼트 인덱스가 0이다
    And 쉐도잉 일시정지 중이다
    When 사용자가 스킵 버튼을 누른다
    Then 현재 세그먼트가 다시 재생되어야 한다 (1회차)
    When 재생 완료 후 스킵 버튼을 다시 누른다
    Then 현재 세그먼트가 다시 재생되어야 한다 (2회차)
    When 재생 완료 후 스킵 버튼을 다시 누른다
    Then 다음 세그먼트(인덱스 1)로 이동해야 한다
```

---

## 2. 엣지 케이스

### 2.1 반복 횟수 대용량 값

```gherkin
Scenario: 큰 반복 횟수 값 처리
  Given 반복 횟수(repeatCount)가 10으로 설정되어 있다
  When 세그먼트 재생과 일시정지가 10회 완료된다
  Then 세그먼트는 정확히 10회 재생되어야 한다
  And 다음 세그먼트로 이동해야 한다
```

### 2.2 마지막 세그먼트에서의 반복

```gherkin
Scenario: 마지막 세그먼트에서 반복 후 종료
  Given 현재 마지막 세그먼트에 있다
  And 반복 횟수(repeatCount)가 2로 설정되어 있다
  When 세그먼트 재생과 일시정지가 2회 완료된다
  Then 재생이 종료되어야 한다
  And 자동으로 다음 세그먼트로 이동하지 않아야 한다
```

### 2.3 재생 모드 전환 시 반복 카운터 초기화

```gherkin
Scenario: 모드 전환 시 반복 카운터 리셋
  Given 쉐도잉 모드에서 반복 재생 중이다 (현재 1회차)
  When 일반 모드로 전환한다
  And 다시 쉐도잉 모드로 전환한다
  Then 반복 카운터는 0으로 초기화되어야 한다
```

---

## 3. 단위 테스트 케이스

### 3.1 테스트 파일 위치

`src/lib/hooks/__tests__/use-playback-mode.test.ts`

### 3.2 테스트 케이스 명세

| 테스트 ID | 설명 | 기대 결과 |
|-----------|------|-----------|
| TC-REPEAT-001 | repeatCount=1 시 1회 재생 | 1회 재생 후 다음 세그먼트 |
| TC-REPEAT-002 | repeatCount=2 시 2회 재생 | 2회 재생 후 다음 세그먼트 |
| TC-REPEAT-003 | repeatCount=3 시 3회 재생 | 3회 재생 후 다음 세그먼트 |
| TC-REPEAT-004 | skipPause 호출 시 반복 로직 | 동일한 반복 횟수 적용 |
| TC-REPEAT-005 | 반복 카운터 증가 확인 | 각 재생 완료 후 +1 |

### 3.3 테스트 코드 예시

```typescript
describe('usePlaybackMode - repeat count bug fix', () => {
  describe('handlePauseComplete', () => {
    it('should play segment exactly once when repeatCount is 1', async () => {
      // Given
      const { result } = renderHook(() => usePlaybackMode());
      act(() => {
        mockSettingsStore.setState({
          shadowingSettings: { repeatCount: 1 }
        });
      });

      // When
      await act(async () => {
        result.current.handlePauseComplete();
      });

      // Then
      expect(mockPracticeStore.getState().currentRepeatCount).toBe(1);
      expect(mockPracticeStore.getState().segmentIndex).toBe(1);
    });

    it('should play segment exactly twice when repeatCount is 2', async () => {
      // Given
      const { result } = renderHook(() => usePlaybackMode());
      act(() => {
        mockSettingsStore.setState({
          shadowingSettings: { repeatCount: 2 }
        });
      });

      // When - 첫 번째 재생 완료
      await act(async () => {
        result.current.handlePauseComplete();
      });

      // Then - 아직 같은 세그먼트
      expect(mockPracticeStore.getState().segmentIndex).toBe(0);
      expect(mockPracticeStore.getState().currentRepeatCount).toBe(1);

      // When - 두 번째 재생 완료
      await act(async () => {
        result.current.handlePauseComplete();
      });

      // Then - 다음 세그먼트로 이동
      expect(mockPracticeStore.getState().segmentIndex).toBe(1);
    });

    it('should play segment exactly three times when repeatCount is 3', async () => {
      // Given
      const { result } = renderHook(() => usePlaybackMode());
      act(() => {
        mockSettingsStore.setState({
          shadowingSettings: { repeatCount: 3 }
        });
      });

      // When & Then - 3회 반복 확인
      for (let i = 0; i < 2; i++) {
        await act(async () => {
          result.current.handlePauseComplete();
        });
        expect(mockPracticeStore.getState().segmentIndex).toBe(0);
      }

      await act(async () => {
        result.current.handlePauseComplete();
      });
      expect(mockPracticeStore.getState().segmentIndex).toBe(1);
    });
  });

  describe('skipPause', () => {
    it('should apply same repeat logic when skipping pause', async () => {
      // Given
      const { result } = renderHook(() => usePlaybackMode());
      act(() => {
        mockSettingsStore.setState({
          shadowingSettings: { repeatCount: 2 }
        });
        mockPracticeStore.setState({ isPausedForShadowing: true });
      });

      // When - 첫 번째 스킵
      await act(async () => {
        result.current.skipPause();
      });

      // Then - 아직 같은 세그먼트
      expect(mockPracticeStore.getState().segmentIndex).toBe(0);

      // When - 두 번째 스킵
      await act(async () => {
        result.current.skipPause();
      });

      // Then - 다음 세그먼트로 이동
      expect(mockPracticeStore.getState().segmentIndex).toBe(1);
    });
  });
});
```

---

## 4. 품질 게이트

### 4.1 코드 품질

| 항목 | 기준 | 도구 |
|------|------|------|
| 테스트 커버리지 | >= 85% | Vitest |
| 린트 오류 | 0개 | ESLint |
| 타입 오류 | 0개 | TypeScript |

### 4.2 기능 검증

| 항목 | 기준 |
|------|------|
| 반복 횟수 정확성 | repeatCount=N 설정 시 정확히 N회 재생 |
| 기존 기능 호환 | 모든 기존 테스트 통과 |

---

## 5. 완료 정의 (Definition of Done)

- [ ] 모든 인수 테스트 시나리오 통과
- [ ] 단위 테스트 커버리지 85% 이상
- [ ] ESLint 오류 0개
- [ ] TypeScript 컴파일 오류 0개
- [ ] 회귀 테스트 통과 (기존 테스트 전체)
- [ ] 코드 리뷰 승인

---

## 6. 검증 명령어

```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test -- use-playback-mode.test.ts

# 커버리지 확인
npm test -- --coverage

# 린트 검사
npm run lint

# 타입 검사
npm run type-check
```
