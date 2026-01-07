# SPEC-INIT-001: 수용 기준

## 개요

Shadow Tutor 프로젝트 초기 설정의 수용 기준 및 테스트 시나리오입니다.

---

## 1. 수용 기준 시나리오

### AC-001: 개발 서버 실행

```gherkin
Feature: 개발 서버 실행
  Shadow Tutor 개발 서버가 정상적으로 시작되어야 한다

  Scenario: 개발 서버 시작
    Given Next.js 16 프로젝트가 생성되어 있고
    And 모든 의존성이 설치되어 있을 때
    When 'npm run dev' 명령을 실행하면
    Then 개발 서버가 localhost:3000에서 시작되어야 하고
    And 홈 페이지가 오류 없이 렌더링되어야 하고
    And 콘솔에 TypeScript 오류가 없어야 한다
```

### AC-002: 프로덕션 빌드

```gherkin
Feature: 프로덕션 빌드
  Shadow Tutor 프로덕션 빌드가 성공해야 한다

  Scenario: 빌드 실행
    Given 개발 서버가 정상 동작하고
    And TypeScript 타입 체크가 통과할 때
    When 'npm run build' 명령을 실행하면
    Then 빌드가 성공적으로 완료되어야 하고
    And .next 폴더에 빌드 결과물이 생성되어야 하고
    And 빌드 오류가 0개여야 한다
```

### AC-003: TypeScript 타입 안전성

```gherkin
Feature: TypeScript 타입 안전성
  모든 코드가 TypeScript strict 모드를 통과해야 한다

  Scenario: 타입 체크 실행
    Given TypeScript strict 모드가 활성화되어 있고
    And 모든 소스 파일이 .ts 또는 .tsx 확장자를 사용할 때
    When 'npx tsc --noEmit' 명령을 실행하면
    Then 타입 오류가 0개여야 하고
    And any 타입이 명시적으로 사용되지 않아야 한다
```

### AC-004: shadcn/ui Button 컴포넌트

```gherkin
Feature: Button 컴포넌트 렌더링
  shadcn/ui Button이 정상적으로 동작해야 한다

  Scenario: Button 기본 렌더링
    Given shadcn/ui가 설정되어 있고
    And Button 컴포넌트가 설치되어 있을 때
    When Button 컴포넌트를 페이지에 임포트하면
    Then 버튼이 Tailwind 스타일과 함께 렌더링되어야 하고
    And 클릭 이벤트가 정상 동작해야 한다

  Scenario: Button variant 적용
    Given Button 컴포넌트가 렌더링되어 있을 때
    When variant="destructive" props를 전달하면
    Then 빨간색 배경의 버튼이 렌더링되어야 한다
```

### AC-005: shadcn/ui Card 컴포넌트

```gherkin
Feature: Card 컴포넌트 렌더링
  shadcn/ui Card가 정상적으로 동작해야 한다

  Scenario: Card 기본 렌더링
    Given shadcn/ui가 설정되어 있고
    And Card 컴포넌트가 설치되어 있을 때
    When Card, CardHeader, CardContent를 페이지에 임포트하면
    Then 카드가 border와 shadow와 함께 렌더링되어야 하고
    And 내부 콘텐츠가 올바르게 배치되어야 한다
```

### AC-006: Zustand 스토어 초기화

```gherkin
Feature: Zustand 스토어
  Zustand 상태 관리가 정상 동작해야 한다

  Scenario: 스토어 초기화
    Given Zustand 스토어가 정의되어 있고
    And 초기 상태값이 설정되어 있을 때
    When 앱이 로드되면
    Then 스토어가 초기 상태로 초기화되어야 하고
    And theme이 'system'이어야 하고
    And isLoading이 false여야 한다

  Scenario: 상태 변경
    Given 스토어가 초기화되어 있을 때
    When setTheme('dark')를 호출하면
    Then theme 상태가 'dark'로 변경되어야 한다
```

### AC-007: 폴더 구조 검증

```gherkin
Feature: 폴더 구조
  표준 폴더 구조가 생성되어야 한다

  Scenario: 필수 디렉토리 존재
    Given 프로젝트가 초기화되어 있을 때
    When 폴더 구조를 확인하면
    Then src/app/ 디렉토리가 존재해야 하고
    And src/components/ui/ 디렉토리가 존재해야 하고
    And src/lib/ 디렉토리가 존재해야 하고
    And src/stores/ 디렉토리가 존재해야 하고
    And src/types/ 디렉토리가 존재해야 한다
```

---

## 2. 품질 게이트

### 2.1 필수 통과 조건

| 항목 | 기준 | 검증 방법 |
|------|------|-----------|
| 타입 오류 | 0개 | `npx tsc --noEmit` |
| 빌드 오류 | 0개 | `npm run build` |
| ESLint 오류 | 0개 | `npm run lint` |
| 개발 서버 | 정상 시작 | `npm run dev` |

### 2.2 권장 조건

| 항목 | 기준 | 검증 방법 |
|------|------|-----------|
| 빌드 경고 | 최소화 | 빌드 로그 확인 |
| 번들 크기 | 200KB 미만 (gzip) | 빌드 출력 확인 |

---

## 3. 수동 검증 체크리스트

- [ ] localhost:3000 접속 시 홈 페이지 표시
- [ ] Button 컴포넌트 클릭 동작 확인
- [ ] Card 컴포넌트 스타일 적용 확인
- [ ] Tailwind CSS 클래스 적용 확인
- [ ] React DevTools에서 컴포넌트 트리 확인
- [ ] 콘솔 오류 없음 확인
- [ ] 모바일 뷰포트에서 반응형 확인

---

## 4. 완료 기준

모든 수용 기준 시나리오가 통과하고, 품질 게이트의 필수 통과 조건을 만족하면 SPEC-INIT-001이 완료된 것으로 간주합니다.
