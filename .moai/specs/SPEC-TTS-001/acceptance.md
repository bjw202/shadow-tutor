---
id: SPEC-TTS-001
version: "1.0.0"
status: "planned"
---

# SPEC-TTS-001: 인수 기준

## Traceability

- **SPEC**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)

---

## 1. 인수 테스트 시나리오

### Scenario 1: 기본 TTS 오디오 재생

```gherkin
Feature: TTS 오디오 재생
  사용자가 텍스트 세그먼트를 원어민 발음으로 들을 수 있다

  Background:
    Given 사용자가 텍스트를 업로드하고 세그먼트가 생성되었다
    And 연습 페이지에 진입했다

  Scenario: 세그먼트 선택 시 오디오 재생
    Given 세그먼트 목록이 표시되어 있다
    When 사용자가 첫 번째 세그먼트를 클릭한다
    Then 로딩 인디케이터가 표시된다
    And TTS API가 호출된다
    And 오디오가 재생된다
    And 선택된 세그먼트가 하이라이트된다

  Scenario: 재생 버튼으로 현재 세그먼트 재생
    Given 첫 번째 세그먼트가 선택되어 있다
    And 오디오가 정지 상태이다
    When 사용자가 재생 버튼을 클릭한다
    Then 현재 세그먼트의 오디오가 재생된다
    And 재생 버튼이 일시정지 아이콘으로 변경된다

  Scenario: 일시정지 버튼으로 재생 일시정지
    Given 오디오가 재생 중이다
    When 사용자가 일시정지 버튼을 클릭한다
    Then 오디오 재생이 일시정지된다
    And 일시정지 버튼이 재생 아이콘으로 변경된다

  Scenario: 재생 완료 시 상태 변경
    Given 오디오가 재생 중이다
    When 오디오 재생이 완료된다
    Then 재생 상태가 'stopped'으로 변경된다
    And 재생 버튼이 표시된다
```

### Scenario 2: 세그먼트 네비게이션

```gherkin
Feature: 세그먼트 네비게이션
  사용자가 다음/이전 세그먼트로 이동할 수 있다

  Background:
    Given 3개의 세그먼트가 있다
    And 두 번째 세그먼트가 선택되어 있다

  Scenario: 다음 세그먼트로 이동
    When 사용자가 다음 버튼을 클릭한다
    Then 세 번째 세그먼트가 선택된다
    And 세 번째 세그먼트의 오디오가 자동 재생된다
    And 세 번째 세그먼트가 하이라이트된다

  Scenario: 이전 세그먼트로 이동
    When 사용자가 이전 버튼을 클릭한다
    Then 첫 번째 세그먼트가 선택된다
    And 첫 번째 세그먼트의 오디오가 자동 재생된다

  Scenario: 첫 번째 세그먼트에서 이전 버튼 비활성화
    Given 첫 번째 세그먼트가 선택되어 있다
    Then 이전 버튼이 비활성화 상태이다

  Scenario: 마지막 세그먼트에서 다음 버튼 비활성화
    Given 마지막 세그먼트가 선택되어 있다
    Then 다음 버튼이 비활성화 상태이다
```

### Scenario 3: 재생 속도 조절

```gherkin
Feature: 재생 속도 조절
  사용자가 오디오 재생 속도를 조절할 수 있다

  Background:
    Given 오디오가 재생 중이다
    And 현재 재생 속도가 1.0x이다

  Scenario: 슬라이더로 속도 변경
    When 사용자가 속도 슬라이더를 1.5x로 조절한다
    Then 현재 재생 중인 오디오의 속도가 1.5x로 변경된다
    And 속도 표시가 "1.5x"로 업데이트된다

  Scenario: 프리셋 버튼으로 속도 변경
    When 사용자가 "0.5x" 프리셋 버튼을 클릭한다
    Then 재생 속도가 0.5x로 변경된다
    And 슬라이더 위치가 0.5x로 이동한다

  Scenario: 속도 범위 제한
    When 사용자가 슬라이더를 최대로 이동한다
    Then 재생 속도가 2.0x를 초과하지 않는다
    When 사용자가 슬라이더를 최소로 이동한다
    Then 재생 속도가 0.5x 미만이 되지 않는다
```

### Scenario 4: 음성 선택

```gherkin
Feature: 음성 선택
  사용자가 TTS 음성을 선택할 수 있다

  Background:
    Given 현재 음성이 'nova'로 설정되어 있다

  Scenario: 음성 변경
    When 사용자가 음성 선택 드롭다운을 연다
    Then 6가지 음성 옵션이 표시된다
      | Voice   | Description            |
      | alloy   | Neutral, balanced      |
      | echo    | Warm, conversational   |
      | fable   | Expressive, narrative  |
      | onyx    | Deep, authoritative    |
      | nova    | Friendly, upbeat       |
      | shimmer | Clear, professional    |
    When 사용자가 'echo'를 선택한다
    Then 음성이 'echo'로 변경된다
    And 다음 TTS 생성부터 'echo' 음성이 적용된다

  Scenario: 음성 변경 시 캐시 무효화
    Given 'nova' 음성으로 생성된 오디오가 캐시되어 있다
    When 사용자가 음성을 'echo'로 변경한다
    And 같은 세그먼트를 재생한다
    Then 새로운 TTS API 호출이 발생한다
    And 'echo' 음성으로 오디오가 재생된다
```

### Scenario 5: 에러 처리

```gherkin
Feature: 에러 처리
  TTS API 에러 발생 시 사용자에게 피드백을 제공한다

  Scenario: TTS API 호출 실패
    Given 네트워크 연결이 불안정하다
    When 사용자가 세그먼트를 재생하려고 한다
    And TTS API 호출이 실패한다
    Then 에러 메시지가 표시된다
    And 재시도 버튼이 표시된다
    When 사용자가 재시도 버튼을 클릭한다
    Then TTS API가 다시 호출된다

  Scenario: 텍스트 길이 초과
    Given 세그먼트 텍스트가 1000자를 초과한다
    When TTS 변환을 시도한다
    Then "텍스트가 너무 깁니다" 에러 메시지가 표시된다
    And TTS API 호출이 발생하지 않는다

  Scenario: 빈 세그먼트 처리
    Given 세그먼트 텍스트가 비어있다
    When 해당 세그먼트를 선택한다
    Then 재생 버튼이 비활성화된다
    And "재생할 텍스트가 없습니다" 메시지가 표시된다
```

### Scenario 6: 모바일 UI

```gherkin
Feature: 모바일 최적화
  모바일 환경에서 터치로 조작할 수 있다

  Background:
    Given 사용자가 모바일 디바이스를 사용 중이다
    And 연습 페이지에 진입했다

  Scenario: 터치로 세그먼트 선택
    When 사용자가 세그먼트를 탭한다
    Then 해당 세그먼트가 선택된다
    And 오디오가 재생된다

  Scenario: 터치로 재생 컨트롤 조작
    Given 오디오 플레이어가 표시되어 있다
    When 사용자가 재생 버튼을 탭한다
    Then 오디오가 재생된다
    When 사용자가 다음 버튼을 탭한다
    Then 다음 세그먼트로 이동한다

  Scenario: 한 손 조작 가능
    Then 주요 컨트롤이 화면 하단에 위치한다
    And 버튼 크기가 최소 44x44px 이상이다
```

---

## 2. API 테스트 시나리오

### POST /api/tts

```gherkin
Feature: TTS API

  Scenario: 정상적인 TTS 요청
    Given 유효한 요청 데이터
      | text                        | voice | speed |
      | Hello, this is a test.      | nova  | 1.0   |
    When POST /api/tts를 호출한다
    Then 응답 상태 코드가 200이다
    And 응답 본문에 audioData가 포함된다
    And audioData가 유효한 base64 문자열이다
    And contentType이 'audio/mpeg'이다

  Scenario: 텍스트 누락
    Given 요청 데이터에 text가 없다
    When POST /api/tts를 호출한다
    Then 응답 상태 코드가 400이다
    And 에러 코드가 'INVALID_INPUT'이다

  Scenario: 텍스트 길이 초과
    Given text가 1001자 이상이다
    When POST /api/tts를 호출한다
    Then 응답 상태 코드가 400이다
    And 에러 코드가 'TEXT_TOO_LONG'이다

  Scenario: 잘못된 음성 옵션
    Given voice가 'invalid_voice'이다
    When POST /api/tts를 호출한다
    Then 응답 상태 코드가 400이다
    And 에러 코드가 'INVALID_INPUT'이다

  Scenario: 속도 범위 초과
    Given speed가 3.0이다
    When POST /api/tts를 호출한다
    Then 응답 상태 코드가 400이다
    And 에러 코드가 'INVALID_INPUT'이다
```

---

## 3. 상태 관리 테스트

### practiceStore

```gherkin
Feature: Practice Store

  Scenario: 세션 초기화
    Given practiceStore가 초기 상태이다
    When initSession(segments)을 호출한다
    Then segments가 저장된다
    And currentSegmentIndex가 0이다
    And playbackState가 'idle'이다

  Scenario: 재생 상태 변경
    Given 세션이 초기화되어 있다
    When play()를 호출한다
    Then playbackState가 'playing'으로 변경된다
    When pause()를 호출한다
    Then playbackState가 'paused'로 변경된다
    When stop()를 호출한다
    Then playbackState가 'stopped'으로 변경된다

  Scenario: 세그먼트 네비게이션
    Given currentSegmentIndex가 1이다
    And 총 3개의 세그먼트가 있다
    When nextSegment()를 호출한다
    Then currentSegmentIndex가 2가 된다
    When previousSegment()를 호출한다
    Then currentSegmentIndex가 1이 된다

  Scenario: 오디오 캐싱
    Given 세션이 초기화되어 있다
    When cacheAudio('segment-1', 'base64-data')를 호출한다
    Then audioCache에 'segment-1' 키로 데이터가 저장된다
    And 같은 세그먼트 재생 시 캐시된 데이터를 반환한다

  Scenario: 음성 변경 시 캐시 초기화
    Given audioCache에 데이터가 있다
    When setVoice('echo')를 호출한다
    Then audioCache가 비워진다
```

---

## 4. 컴포넌트 테스트

### AudioPlayer 컴포넌트

```gherkin
Feature: AudioPlayer Component

  Scenario: 초기 렌더링
    Given 세그먼트가 선택되어 있다
    When AudioPlayer가 렌더링된다
    Then 재생 버튼이 표시된다
    And 이전/다음 버튼이 표시된다
    And 현재 세그먼트 텍스트가 표시된다

  Scenario: 로딩 상태 표시
    Given playbackState가 'loading'이다
    When AudioPlayer가 렌더링된다
    Then 로딩 스피너가 표시된다
    And 재생 버튼이 비활성화된다

  Scenario: 재생/일시정지 토글
    When 재생 버튼을 클릭한다
    Then play 액션이 호출된다
    Given playbackState가 'playing'이다
    When 일시정지 버튼을 클릭한다
    Then pause 액션이 호출된다
```

### PlaybackSpeed 컴포넌트

```gherkin
Feature: PlaybackSpeed Component

  Scenario: 슬라이더 조작
    Given 현재 속도가 1.0이다
    When 슬라이더를 1.5로 드래그한다
    Then onChange(1.5)가 호출된다
    And 표시 값이 "1.5x"로 업데이트된다

  Scenario: 프리셋 버튼
    When "2.0x" 버튼을 클릭한다
    Then onChange(2.0)이 호출된다
```

### VoiceSelector 컴포넌트

```gherkin
Feature: VoiceSelector Component

  Scenario: 드롭다운 열기
    When 선택 버튼을 클릭한다
    Then 6가지 음성 옵션이 표시된다
    And 각 옵션에 음성 이름과 설명이 표시된다

  Scenario: 음성 선택
    Given 드롭다운이 열려있다
    When 'shimmer' 옵션을 클릭한다
    Then onChange('shimmer')가 호출된다
    And 드롭다운이 닫힌다
```

---

## 5. Quality Gate

### 테스트 커버리지

| 영역 | 목표 커버리지 |
|------|--------------|
| TTS API Route | >= 90% |
| practiceStore | >= 90% |
| useAudioPlayer Hook | >= 85% |
| 컴포넌트 | >= 80% |
| 전체 | >= 85% |

### 성능 기준

| 메트릭 | 합격 기준 |
|--------|----------|
| TTS 응답 시간 | < 3초 (P95) |
| 오디오 시작 지연 | < 500ms |
| 컴포넌트 렌더링 | < 100ms |

### 접근성 기준

| 기준 | 검증 항목 |
|------|----------|
| WCAG 2.1 AA | 색상 대비, 키보드 네비게이션 |
| 터치 타겟 | 최소 44x44px |
| 스크린 리더 | aria-label 적용 |

---

## 6. Definition of Done

### 코드 품질

- [ ] 모든 파일에 TypeScript 타입 정의
- [ ] ESLint 오류 0건
- [ ] Prettier 포맷 적용

### 테스트

- [ ] 단위 테스트 작성 및 통과
- [ ] 통합 테스트 작성 및 통과
- [ ] 테스트 커버리지 85% 이상

### 기능 검증

- [ ] 모든 EARS 요구사항 충족
- [ ] 모든 인수 테스트 시나리오 통과
- [ ] 모바일 브라우저 테스트 (Chrome, Safari)

### 문서화

- [ ] API 문서 업데이트
- [ ] 컴포넌트 Props 문서화
- [ ] README 사용법 추가

### 리뷰

- [ ] 코드 리뷰 완료
- [ ] QA 검증 완료
