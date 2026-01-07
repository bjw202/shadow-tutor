# SPEC-SETTINGS-001: Acceptance Criteria

---
spec_id: SPEC-SETTINGS-001
version: 1.0.0
created: 2026-01-07
updated: 2026-01-07
---

## 1. Overview

본 문서는 SPEC-SETTINGS-001의 인수 조건을 Given-When-Then 형식으로 정의한다.

---

## 2. Test Scenarios

### 2.1 Settings Page Navigation

#### Scenario 2.1.1: 설정 페이지 접근

```gherkin
Feature: 설정 페이지 네비게이션

  Scenario: 사용자가 설정 페이지로 이동
    Given 사용자가 Shadow Tutor 앱의 어느 페이지에 있음
    When 설정 아이콘 또는 링크를 클릭
    Then /settings 페이지로 이동
    And 현재 저장된 모든 설정 값이 표시됨

  Scenario: 설정 페이지에서 뒤로가기
    Given 사용자가 /settings 페이지에 있음
    When 뒤로가기 버튼을 클릭
    Then 이전 페이지로 이동
    And 변경된 설정이 저장된 상태로 유지됨
```

---

### 2.2 TTS Settings - Voice Selection

#### Scenario 2.2.1: 음성 선택

```gherkin
Feature: TTS 음성 선택

  Scenario: 사용자가 TTS 음성을 변경
    Given 사용자가 설정 페이지의 TTS 설정 섹션에 있음
    And 현재 선택된 음성이 "Nova"
    When 음성 선택 드롭다운을 클릭
    And "Echo" 음성을 선택
    Then 선택된 음성이 "Echo"로 변경됨
    And localStorage에 "echo" 값이 저장됨
    And practice 화면에서 해당 음성이 사용됨

  Scenario: 음성 변경 시 오디오 캐시 초기화
    Given 사용자가 설정 페이지에 있음
    And 일부 세그먼트의 오디오가 캐시되어 있음
    When 음성을 변경
    Then 기존 오디오 캐시가 초기화됨
    And 새 음성으로 오디오 재생성 필요함
```

---

### 2.3 TTS Settings - Playback Speed

#### Scenario 2.3.1: 재생 속도 슬라이더 조작

```gherkin
Feature: 재생 속도 설정

  Scenario: 슬라이더로 재생 속도 변경
    Given 사용자가 설정 페이지에 있음
    And 현재 재생 속도가 1.0x
    When 속도 슬라이더를 1.5x 위치로 드래그
    Then 표시된 속도가 "1.50x"로 업데이트됨
    And localStorage에 1.5 값이 저장됨

  Scenario: 프리셋 버튼으로 재생 속도 변경
    Given 사용자가 설정 페이지에 있음
    And 현재 재생 속도가 1.0x
    When "0.75x" 프리셋 버튼을 클릭
    Then 재생 속도가 0.75x로 변경됨
    And "0.75x" 버튼이 선택된 상태로 표시됨

  Scenario: 최소/최대 속도 제한
    Given 사용자가 설정 페이지에 있음
    When 속도 슬라이더를 최소값(0.5x) 이하로 드래그 시도
    Then 속도가 0.5x로 제한됨
    When 속도 슬라이더를 최대값(2.0x) 이상으로 드래그 시도
    Then 속도가 2.0x로 제한됨
```

---

### 2.4 TTS Settings - Volume Control

#### Scenario 2.4.1: 볼륨 조절

```gherkin
Feature: 볼륨 설정

  Scenario: 볼륨 슬라이더 조작
    Given 사용자가 설정 페이지에 있음
    And 현재 볼륨이 100%
    When 볼륨 슬라이더를 50% 위치로 드래그
    Then 볼륨 아이콘이 중간 볼륨 아이콘으로 변경됨
    And localStorage에 0.5 값이 저장됨

  Scenario: 음소거 토글
    Given 사용자가 설정 페이지에 있음
    And 볼륨이 0이 아닌 상태
    When 볼륨 아이콘을 클릭
    Then 볼륨이 음소거됨
    And 볼륨 아이콘이 음소거 아이콘으로 변경됨
    When 음소거 아이콘을 다시 클릭
    Then 이전 볼륨 레벨로 복원됨

  Scenario: 볼륨 0으로 설정
    Given 사용자가 설정 페이지에 있음
    When 볼륨 슬라이더를 0% 위치로 드래그
    Then 볼륨 아이콘이 음소거 아이콘으로 변경됨
    And 음소거 상태로 저장됨
```

---

### 2.5 Shadowing Settings - Pause Duration

#### Scenario 2.5.1: 일시정지 시간 설정

```gherkin
Feature: 쉐도잉 일시정지 시간 설정

  Scenario: 일시정지 시간 변경
    Given 사용자가 설정 페이지의 쉐도잉 설정 섹션에 있음
    And 현재 일시정지 시간이 5초
    When 일시정지 시간 슬라이더를 10초 위치로 드래그
    Then 표시된 시간이 "10s"로 업데이트됨
    And localStorage에 10 값이 저장됨

  Scenario: 최소/최대 일시정지 시간 제한
    Given 사용자가 설정 페이지에 있음
    When 일시정지 시간을 1초 미만으로 설정 시도
    Then 시간이 1초로 제한됨
    When 일시정지 시간을 30초 초과로 설정 시도
    Then 시간이 30초로 제한됨
```

---

### 2.6 Shadowing Settings - Repeat Count

#### Scenario 2.6.1: 반복 횟수 설정

```gherkin
Feature: 쉐도잉 반복 횟수 설정

  Scenario: 반복 횟수 증가
    Given 사용자가 설정 페이지에 있음
    And 현재 반복 횟수가 1회
    When "+" 버튼을 클릭
    Then 반복 횟수가 2회로 증가됨
    And 진행 바가 업데이트됨

  Scenario: 반복 횟수 감소
    Given 사용자가 설정 페이지에 있음
    And 현재 반복 횟수가 3회
    When "-" 버튼을 클릭
    Then 반복 횟수가 2회로 감소됨

  Scenario: 최소 반복 횟수 제한
    Given 사용자가 설정 페이지에 있음
    And 현재 반복 횟수가 1회 (최소값)
    When "-" 버튼을 클릭 시도
    Then 반복 횟수가 1회로 유지됨
    And "-" 버튼이 비활성화 상태

  Scenario: 최대 반복 횟수 제한
    Given 사용자가 설정 페이지에 있음
    And 현재 반복 횟수가 10회 (최대값)
    When "+" 버튼을 클릭 시도
    Then 반복 횟수가 10회로 유지됨
    And "+" 버튼이 비활성화 상태
```

---

### 2.7 Shadowing Settings - Auto-advance

#### Scenario 2.7.1: 자동 진행 토글

```gherkin
Feature: 쉐도잉 자동 진행 설정

  Scenario: 자동 진행 활성화
    Given 사용자가 설정 페이지에 있음
    And 자동 진행이 비활성화 상태
    When 자동 진행 스위치를 켬
    Then 스위치가 활성화 상태로 변경됨
    And localStorage에 true 값이 저장됨

  Scenario: 자동 진행 비활성화
    Given 사용자가 설정 페이지에 있음
    And 자동 진행이 활성화 상태
    When 자동 진행 스위치를 끔
    Then 스위치가 비활성화 상태로 변경됨
    And localStorage에 false 값이 저장됨
```

---

### 2.8 Settings Reset

#### Scenario 2.8.1: 설정 초기화

```gherkin
Feature: 설정 초기화

  Scenario: 모든 설정을 기본값으로 초기화
    Given 사용자가 설정 페이지에 있음
    And 여러 설정이 기본값에서 변경된 상태
    When "Reset to Defaults" 버튼을 클릭
    Then 확인 대화상자가 표시됨
    When 확인을 클릭
    Then 모든 설정이 기본값으로 복원됨:
      | 설정 | 기본값 |
      | Voice | Nova |
      | Speed | 1.0x |
      | Volume | 100% |
      | Pause Duration | 5s |
      | Repeat Count | 1 |
      | Auto-advance | On |
    And localStorage가 기본값으로 업데이트됨

  Scenario: 설정 초기화 취소
    Given 사용자가 설정 페이지에 있음
    And "Reset to Defaults" 버튼을 클릭
    And 확인 대화상자가 표시됨
    When 취소를 클릭
    Then 설정이 변경되지 않음
    And 대화상자가 닫힘
```

---

### 2.9 Settings Persistence

#### Scenario 2.9.1: 설정 영속화

```gherkin
Feature: 설정 영속화

  Scenario: 페이지 새로고침 후 설정 유지
    Given 사용자가 설정을 변경함 (음성: Echo, 속도: 1.5x)
    When 페이지를 새로고침
    Then 변경된 설정이 그대로 표시됨:
      | 설정 | 값 |
      | Voice | Echo |
      | Speed | 1.5x |

  Scenario: 브라우저 종료 후 설정 유지
    Given 사용자가 설정을 변경함
    When 브라우저를 종료하고 다시 시작
    And 앱에 접속
    Then 이전에 저장된 설정이 복원됨

  Scenario: 새 탭에서 설정 공유
    Given 사용자가 탭 A에서 설정을 변경함
    When 새 탭 B에서 앱을 열음
    Then 탭 A에서 변경한 설정이 탭 B에도 적용됨
```

---

### 2.10 Settings Synchronization

#### Scenario 2.10.1: Practice 화면과의 동기화

```gherkin
Feature: Practice 화면과의 설정 동기화

  Scenario: 설정 변경이 Practice 화면에 즉시 반영
    Given 사용자가 설정 페이지에서 재생 속도를 1.5x로 변경
    When Practice 페이지로 이동
    Then 오디오 재생 속도가 1.5x로 적용됨

  Scenario: Practice 화면에서의 임시 변경
    Given 사용자가 Practice 화면에서 속도를 일시적으로 0.75x로 변경
    When 설정 페이지로 이동
    Then 설정 페이지에는 저장된 속도 (예: 1.5x)가 표시됨
    And Practice 화면의 임시 변경은 세션 종료 시 초기화됨
```

---

## 3. Edge Cases

### 3.1 localStorage 관련

```gherkin
Feature: localStorage 엣지 케이스

  Scenario: localStorage가 비어있는 경우 (첫 방문)
    Given 사용자가 처음 앱에 접속 (localStorage 비어있음)
    When 설정 페이지로 이동
    Then 모든 설정이 기본값으로 표시됨
    And 기본값이 localStorage에 저장됨

  Scenario: localStorage 데이터가 손상된 경우
    Given localStorage에 유효하지 않은 JSON이 저장됨
    When 앱이 로드됨
    Then 기본값으로 설정이 초기화됨
    And 손상된 데이터가 유효한 기본값으로 덮어쓰기됨
    And 오류 없이 앱이 정상 동작함

  Scenario: localStorage 저장 실패 (용량 초과)
    Given localStorage가 거의 가득 찬 상태
    When 설정 저장 시도
    Then 저장 실패 오류가 콘솔에 기록됨
    And 사용자에게 오류 메시지가 표시됨
    And 앱은 계속 동작함 (메모리 내 설정 사용)
```

### 3.2 동시성 관련

```gherkin
Feature: 동시성 엣지 케이스

  Scenario: 빠른 연속 설정 변경
    Given 사용자가 설정 페이지에 있음
    When 속도 슬라이더를 빠르게 여러 번 드래그
    Then 마지막 값만 저장됨
    And UI가 최종 값으로 안정됨
    And 성능 저하 없음
```

---

## 4. Accessibility Testing Criteria

### 4.1 키보드 접근성

```gherkin
Feature: 키보드 접근성

  Scenario: Tab 키로 모든 컨트롤 접근
    Given 사용자가 설정 페이지에 있음
    When Tab 키를 순차적으로 누름
    Then 다음 순서로 포커스 이동:
      | 순서 | 컨트롤 |
      | 1 | 뒤로가기 버튼 |
      | 2 | 음성 선택 드롭다운 |
      | 3 | 속도 슬라이더 |
      | 4 | 속도 프리셋 버튼들 |
      | 5 | 볼륨 컨트롤 |
      | 6 | 일시정지 시간 슬라이더 |
      | 7 | 반복 횟수 - 버튼 |
      | 8 | 반복 횟수 + 버튼 |
      | 9 | 자동 진행 스위치 |
      | 10 | 초기화 버튼 |

  Scenario: 슬라이더 키보드 조작
    Given 속도 슬라이더에 포커스가 있음
    When 오른쪽 화살표 키를 누름
    Then 속도가 0.05씩 증가
    When 왼쪽 화살표 키를 누름
    Then 속도가 0.05씩 감소
```

### 4.2 스크린 리더 지원

```gherkin
Feature: 스크린 리더 지원

  Scenario: 설정 변경 안내
    Given 스크린 리더가 활성화됨
    When 속도를 1.5x로 변경
    Then 스크린 리더가 "Speed: 1.50x"를 읽음

  Scenario: ARIA 라벨 제공
    Given 스크린 리더가 활성화됨
    When 볼륨 슬라이더에 포커스
    Then 스크린 리더가 "Volume" 라벨과 현재 값을 읽음
```

---

## 5. Performance Criteria

### 5.1 성능 요구사항

| 메트릭 | 목표값 | 측정 방법 |
|--------|--------|----------|
| 설정 페이지 초기 로드 | < 500ms | Lighthouse FCP |
| 설정 저장 응답 시간 | < 100ms | Performance API |
| Practice 화면 반영 | < 16ms (1 frame) | 사용자 인지 불가 |
| 메모리 사용량 | < 5MB 증가 | Chrome DevTools |

### 5.2 성능 테스트 시나리오

```gherkin
Feature: 성능 테스트

  Scenario: 대량 설정 변경 성능
    Given 사용자가 설정 페이지에 있음
    When 모든 설정을 연속으로 변경 (10회)
    Then 총 소요 시간 < 1초
    And UI 프리징 없음

  Scenario: 설정 페이지 재방문 성능
    Given 사용자가 설정 페이지를 방문한 적 있음
    When 다시 설정 페이지로 이동
    Then 로드 시간 < 200ms (캐시 활용)
```

---

## 6. Browser Compatibility

### 6.1 지원 브라우저 테스트

```gherkin
Feature: 브라우저 호환성

  Scenario Outline: 다양한 브라우저에서 설정 기능 동작
    Given <browser> 브라우저에서 앱 실행
    When 모든 설정 기능을 테스트
    Then 모든 기능이 정상 동작함

    Examples:
      | browser |
      | Chrome 90+ |
      | Safari 14+ (iOS) |
      | Firefox 88+ |
      | Edge 90+ |
```

---

## 7. Mobile-Specific Testing

### 7.1 모바일 UI 테스트

```gherkin
Feature: 모바일 UI 테스트

  Scenario: 터치 친화적 컨트롤
    Given 모바일 기기에서 설정 페이지 열음
    Then 모든 인터랙티브 요소가 최소 44x44px
    And 터치로 쉽게 조작 가능

  Scenario: 세로 모드 레이아웃
    Given 모바일 기기 세로 모드
    When 설정 페이지 열음
    Then 모든 설정이 세로로 스크롤 가능하게 배치됨
    And 좌우 스크롤 불필요

  Scenario: 가로 모드 레이아웃
    Given 모바일 기기 가로 모드
    When 설정 페이지 열음
    Then 레이아웃이 가로 모드에 맞게 조정됨
```

---

## 8. Definition of Done

### 8.1 인수 테스트 완료 체크리스트

- [ ] 모든 Given-When-Then 시나리오 통과
- [ ] 모든 엣지 케이스 처리 확인
- [ ] 키보드 접근성 테스트 통과
- [ ] 스크린 리더 테스트 통과
- [ ] 성능 기준 충족
- [ ] 모든 지원 브라우저에서 테스트 완료
- [ ] 모바일 기기 테스트 완료

### 8.2 테스트 커버리지 목표

| 테스트 유형 | 목표 커버리지 |
|------------|--------------|
| Unit Tests | >= 85% |
| Component Tests | >= 80% |
| E2E Tests | Critical paths 100% |

---

## 9. Traceability Matrix

| 시나리오 ID | SPEC 요구사항 | 테스트 파일 |
|------------|--------------|-------------|
| 2.1.1 | ED-008 | settings.spec.ts |
| 2.2.1 | ED-001 | tts-settings.test.tsx |
| 2.3.1 | ED-002 | playback-speed.test.tsx |
| 2.4.1 | ED-003 | volume-control.test.tsx |
| 2.5.1 | ED-004 | shadowing-section.test.tsx |
| 2.6.1 | ED-005 | shadowing-section.test.tsx |
| 2.7.1 | ED-006 | shadowing-section.test.tsx |
| 2.8.1 | ED-007 | reset-settings.test.tsx |
| 2.9.1 | UR-001, UR-002 | settings-store.test.ts |
| 2.10.1 | UB-002 | settings-sync.test.tsx |
| 3.x | UB-001, UB-003 | settings-store.test.ts |
| 4.x | UR-003 | accessibility.spec.ts |

---

*Document Version: 1.0.0*
*SPEC ID: SPEC-SETTINGS-001*
*Created: 2026-01-07*
