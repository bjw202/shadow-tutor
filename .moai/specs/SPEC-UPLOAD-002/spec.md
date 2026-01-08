# SPEC-UPLOAD-002: 탭 전환 방식 텍스트 붙여넣기 기능

---
id: SPEC-UPLOAD-002
version: 1.0.0
status: Planned
created: 2026-01-08
updated: 2026-01-08
author: workflow-spec
priority: Medium
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-08 | workflow-spec | Initial SPEC creation |

---

## Environment

### 시스템 컨텍스트

Shadow Tutor 애플리케이션의 업로드 페이지에서 사용자가 콘텐츠를 입력하는 두 가지 방식을 제공합니다:

1. **파일 업로드 탭**: 기존 SPEC-UPLOAD-001에서 구현된 .txt 파일 드래그앤드롭 업로드
2. **텍스트 붙여넣기 탭**: 본 SPEC에서 구현할 직접 텍스트 입력 기능

### 기술 스택

- **프레임워크**: Next.js 16.x, React 19.x, TypeScript 5.7.x
- **UI 컴포넌트**: shadcn/ui (Tabs, Textarea, Button)
- **상태 관리**: Zustand 5.x
- **스타일링**: Tailwind CSS 4.x

### 의존성

- SPEC-UPLOAD-001: 파일 업로드 탭 구현 (완료 필요)
- uploadStore: 업로드 상태 관리 스토어

---

## Assumptions

### 사용자 행동 가정

1. 사용자는 웹 브라우저에서 텍스트를 복사하여 붙여넣기를 시도할 것이다
2. 사용자는 모바일 환경에서 긴 텍스트보다는 짧은 문장을 입력할 가능성이 높다
3. 탭 전환 시 이전 탭의 데이터 손실에 대한 명시적 안내가 필요하다

### 기술적 가정

1. shadcn/ui Tabs 컴포넌트는 접근성(a11y) 표준을 준수한다
2. Textarea 컴포넌트는 한글, 영어, 특수문자를 모두 지원한다
3. 클립보드 API는 대부분의 모바일 브라우저에서 지원된다

### 비즈니스 가정

1. 텍스트 직접 입력은 파일 업로드와 동일한 처리 파이프라인을 사용한다
2. 문자 수 제한은 API 비용 관리를 위해 필요하다

---

## Requirements

### Ubiquitous Requirements (항상 적용)

#### UR-001: 탭 UI 표시
시스템은 **항상** 업로드 페이지에 "파일 업로드"와 "텍스트 붙여넣기" 두 개의 탭을 표시해야 한다.

#### UR-002: 탭 활성 상태 표시
시스템은 **항상** 현재 활성화된 탭을 시각적으로 구분하여 표시해야 한다.

#### UR-003: 접근성 표준 준수
시스템은 **항상** ARIA 레이블과 키보드 네비게이션을 지원해야 한다.

#### UR-004: 문자 수 카운터 표시
시스템은 **항상** 텍스트 입력 영역에서 현재 문자 수와 최대 문자 수를 표시해야 한다.

### Event-Driven Requirements (이벤트 기반)

#### ED-001: 탭 전환 시 콘텐츠 초기화
**WHEN** 사용자가 다른 탭으로 전환하면 **THEN** 이전 탭의 입력 내용을 초기화해야 한다.

#### ED-002: 텍스트 붙여넣기 처리
**WHEN** 사용자가 텍스트를 붙여넣으면 **THEN** 시스템은 텍스트를 문장 단위로 파싱하여 세그먼트로 분할해야 한다.

#### ED-003: 문자 수 초과 입력 처리
**WHEN** 입력 텍스트가 최대 문자 수(10,000자)를 초과하면 **THEN** 시스템은 초과 텍스트 입력을 차단하고 경고 메시지를 표시해야 한다.

#### ED-004: 텍스트 제출 처리
**WHEN** 사용자가 "연습 시작" 버튼을 클릭하면 **THEN** 시스템은 텍스트를 세그먼트로 변환하고 연습 페이지로 이동해야 한다.

#### ED-005: 빈 텍스트 제출 시도 처리
**WHEN** 빈 텍스트 상태에서 제출 버튼을 클릭하면 **THEN** 시스템은 버튼을 비활성화 상태로 유지하고 입력을 요청하는 메시지를 표시해야 한다.

### State-Driven Requirements (상태 기반)

#### SD-001: 텍스트 탭 활성화 시 입력 영역 표시
**IF** "텍스트 붙여넣기" 탭이 활성화된 상태 **THEN** 텍스트 입력 영역과 문자 수 카운터를 표시해야 한다.

#### SD-002: 파일 탭 활성화 시 드롭존 표시
**IF** "파일 업로드" 탭이 활성화된 상태 **THEN** 파일 드래그앤드롭 영역을 표시해야 한다.

#### SD-003: 유효한 텍스트 입력 시 버튼 활성화
**IF** 텍스트가 1자 이상 10,000자 이하로 입력된 상태 **THEN** "연습 시작" 버튼을 활성화해야 한다.

#### SD-004: 문자 수 경고 상태 표시
**IF** 텍스트가 9,000자를 초과한 상태 **THEN** 문자 수 카운터를 경고 색상(주황색)으로 표시해야 한다.

### Unwanted Behavior Requirements (금지 사항)

#### UB-001: 탭 전환 시 데이터 동기화 금지
시스템은 파일 업로드 탭과 텍스트 붙여넣기 탭의 데이터를 **동기화하지 않아야 한다**.

#### UB-002: 무효한 입력으로 페이지 이동 금지
시스템은 빈 텍스트 또는 문자 수 초과 상태에서 연습 페이지로 **이동하지 않아야 한다**.

#### UB-003: 제출 중 중복 요청 금지
시스템은 텍스트 처리 중에 추가 제출 요청을 **허용하지 않아야 한다**.

### Optional Feature Requirements (선택적 기능)

#### OF-001: 임시 저장 기능
**가능하면** 브라우저 로컬 스토리지를 사용하여 텍스트 입력 내용을 임시 저장하여 새로고침 시 복원 기능을 제공한다.

#### OF-002: 텍스트 포맷 정리
**가능하면** 붙여넣기된 텍스트에서 불필요한 공백과 줄바꿈을 자동으로 정리한다.

---

## Specifications

### 컴포넌트 구조

```
src/components/upload/
  input-method-tabs.tsx    # 탭 컨테이너 컴포넌트 (신규)
  text-input-area.tsx      # 텍스트 입력 영역 컴포넌트 (신규)
  file-drop-zone.tsx       # 기존 파일 드롭 영역 (SPEC-UPLOAD-001)
```

### API 인터페이스

#### InputMethodTabs Props

```typescript
interface InputMethodTabsProps {
  defaultTab?: 'file' | 'text';
  onContentReady: (content: string) => void;
}
```

#### TextInputArea Props

```typescript
interface TextInputAreaProps {
  maxLength?: number;
  placeholder?: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}
```

### 상태 관리

#### uploadStore 확장

```typescript
interface UploadState {
  // 기존 상태
  content: string;
  segments: Segment[];
  isLoading: boolean;
  error: string | null;

  // 신규 상태
  inputMethod: 'file' | 'text';
  textInput: string;

  // 신규 액션
  setInputMethod: (method: 'file' | 'text') => void;
  setTextInput: (text: string) => void;
  clearContent: () => void;
}
```

### UI/UX 명세

#### 탭 레이아웃

- 탭 너비: 동일한 비율 (50% : 50%)
- 활성 탭: 하단 보더 강조 (primary-500)
- 비활성 탭: 회색 텍스트 (gray-500)

#### 텍스트 입력 영역

- 높이: 최소 200px, 최대 400px (자동 조절)
- 패딩: 16px
- 폰트: 시스템 기본 폰트, 16px
- 플레이스홀더: "연습할 영어 텍스트를 여기에 붙여넣으세요..."

#### 문자 수 카운터

- 위치: 텍스트 영역 우측 하단
- 형식: "현재/최대" (예: "1,234 / 10,000")
- 색상: 기본(gray-500), 경고(orange-500), 초과(red-500)

### 검증 규칙

| 검증 항목 | 규칙 | 오류 메시지 |
|----------|------|------------|
| 최소 길이 | 1자 이상 | "텍스트를 입력해주세요" |
| 최대 길이 | 10,000자 이하 | "최대 10,000자까지 입력 가능합니다" |
| 유효 문자 | 영문, 숫자, 기본 구두점 | "지원하지 않는 문자가 포함되어 있습니다" |

---

## Traceability

### Related SPECs

- **SPEC-UPLOAD-001**: 파일 업로드 기능 (선행 의존성)
- **SPEC-SEGMENT-001**: 세그먼트 파싱 로직 (연계)
- **SPEC-PRACTICE-001**: 연습 페이지 (후속)

### Test Coverage Targets

- 단위 테스트: 90% 이상
- 통합 테스트: 주요 사용자 플로우 4개 시나리오
- E2E 테스트: 탭 전환 및 텍스트 제출 플로우

### Change History

- 2026-01-08: 초기 SPEC 작성

---

*TAG: SPEC-UPLOAD-002*
