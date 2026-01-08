# SPEC-UPLOAD-002: 구현 계획

---
spec_id: SPEC-UPLOAD-002
version: 1.0.0
created: 2026-01-08
updated: 2026-01-08
---

## 개요

본 문서는 SPEC-UPLOAD-002 "탭 전환 방식 텍스트 붙여넣기 기능"의 구현 계획을 정의합니다.

---

## 구현 범위

### 신규 생성 컴포넌트

#### 1. InputMethodTabs (src/components/upload/input-method-tabs.tsx)

**역할**: 파일 업로드와 텍스트 붙여넣기 탭을 관리하는 컨테이너 컴포넌트

**주요 기능**:
- shadcn/ui Tabs 컴포넌트 기반 구현
- 탭 전환 시 콘텐츠 초기화 로직
- 활성 탭 상태 관리
- ARIA 접근성 속성 적용

**구현 요소**:
- Tabs, TabsList, TabsTrigger, TabsContent 조합
- 탭 전환 핸들러 (onValueChange)
- 콘텐츠 초기화 확인 다이얼로그 (선택적)

#### 2. TextInputArea (src/components/upload/text-input-area.tsx)

**역할**: 텍스트 직접 입력을 위한 Textarea 컴포넌트

**주요 기능**:
- 문자 수 실시간 카운팅
- 최대 문자 수 제한 (10,000자)
- 문자 수 경고 표시 (9,000자 초과 시)
- 제출 버튼 활성화/비활성화 로직

**구현 요소**:
- shadcn/ui Textarea 컴포넌트
- 문자 수 카운터 UI
- 상태 기반 스타일링 (정상/경고/초과)
- "연습 시작" 버튼

### 수정 컴포넌트

#### 1. upload/page.tsx (app/upload/page.tsx)

**수정 내용**:
- 기존 FileDropZone을 InputMethodTabs로 래핑
- uploadStore 연동 로직 추가
- 페이지 레이아웃 조정

### 스토어 확장

#### uploadStore 확장 (stores/upload-store.ts)

**신규 상태**:
```typescript
inputMethod: 'file' | 'text'  // 현재 선택된 입력 방식
textInput: string              // 텍스트 입력 내용
```

**신규 액션**:
```typescript
setInputMethod(method: 'file' | 'text'): void
setTextInput(text: string): void
clearContent(): void
processTextInput(): void
```

---

## 기술 스택

### UI 컴포넌트

| 컴포넌트 | 패키지 | 용도 |
|----------|--------|------|
| Tabs | shadcn/ui | 탭 컨테이너 |
| TabsList | shadcn/ui | 탭 목록 |
| TabsTrigger | shadcn/ui | 탭 버튼 |
| TabsContent | shadcn/ui | 탭 콘텐츠 영역 |
| Textarea | shadcn/ui | 텍스트 입력 |
| Button | shadcn/ui | 제출 버튼 |

### 상태 관리

- **Zustand 5.x**: uploadStore 확장
- **로컬 상태**: 컴포넌트 내부 UI 상태

### 타입 정의

```typescript
// types/upload.ts
export type InputMethod = 'file' | 'text';

export interface TextInputState {
  value: string;
  charCount: number;
  isValid: boolean;
  warning: 'none' | 'approaching' | 'exceeded';
}
```

---

## 마일스톤

### Primary Goal: 핵심 기능 구현

**작업 목록**:

1. shadcn/ui Tabs 컴포넌트 설치 및 설정
2. InputMethodTabs 컴포넌트 구현
   - 탭 UI 구조 생성
   - 탭 전환 이벤트 핸들러
   - 기존 FileDropZone 통합
3. TextInputArea 컴포넌트 구현
   - Textarea 기본 구현
   - 문자 수 카운터 UI
   - 유효성 검증 로직
4. uploadStore 확장
   - 신규 상태 및 액션 추가
   - 텍스트 파싱 로직 통합
5. upload/page.tsx 수정
   - InputMethodTabs 적용
   - 스토어 연동

**완료 기준**:
- 탭 전환 기능 동작
- 텍스트 입력 및 문자 수 표시
- 연습 페이지로 정상 이동

### Secondary Goal: 사용자 경험 개선

**작업 목록**:

1. 접근성(a11y) 강화
   - ARIA 레이블 추가
   - 키보드 네비게이션 테스트
2. 반응형 레이아웃 최적화
   - 모바일 환경 테스트
   - 터치 인터랙션 개선
3. 에러 상태 UI 구현
   - 문자 수 초과 경고
   - 입력 오류 메시지

**완료 기준**:
- Lighthouse 접근성 점수 90+
- 모바일 Chrome/Safari 정상 동작

### Final Goal: 품질 보증

**작업 목록**:

1. 단위 테스트 작성
   - InputMethodTabs 테스트
   - TextInputArea 테스트
   - uploadStore 확장 테스트
2. 통합 테스트 작성
   - 탭 전환 시나리오
   - 텍스트 제출 시나리오
3. E2E 테스트 작성
   - 전체 사용자 플로우

**완료 기준**:
- 테스트 커버리지 90% 이상
- 모든 테스트 통과

### Optional Goal: 부가 기능

**작업 목록**:

1. 임시 저장 기능 (localStorage)
2. 텍스트 포맷 자동 정리
3. 붙여넣기 시 확인 다이얼로그

**완료 기준**:
- 선택적 구현 완료

---

## 아키텍처 설계 방향

### 컴포넌트 계층 구조

```
app/upload/page.tsx
  InputMethodTabs
    TabsList
      TabsTrigger (파일 업로드)
      TabsTrigger (텍스트 붙여넣기)
    TabsContent (file)
      FileDropZone (SPEC-UPLOAD-001)
    TabsContent (text)
      TextInputArea
        Textarea
        CharacterCounter
        SubmitButton
```

### 데이터 흐름

```
사용자 입력
    |
    v
TextInputArea (로컬 상태)
    |
    v
uploadStore.setTextInput()
    |
    v
uploadStore.processTextInput()
    |
    v
uploadStore.segments (공유 상태)
    |
    v
연습 페이지 (/practice)
```

### 상태 분리 원칙

| 상태 유형 | 위치 | 예시 |
|----------|------|------|
| UI 상태 | 컴포넌트 로컬 | 포커스, 호버 |
| 폼 상태 | 컴포넌트 로컬 | 입력 값, 유효성 |
| 애플리케이션 상태 | Zustand | 세그먼트, 로딩 |
| 영속 상태 | localStorage | 임시 저장 |

---

## 리스크 분석

### 기술적 리스크

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|--------|--------|--------|----------|
| 클립보드 API 호환성 | 낮음 | 중간 | 폴백으로 수동 입력 지원 |
| 대용량 텍스트 성능 | 중간 | 중간 | 디바운싱, 가상화 고려 |
| 탭 전환 데이터 손실 | 낮음 | 높음 | 확인 다이얼로그 제공 |

### 의존성 리스크

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|--------|--------|--------|----------|
| SPEC-UPLOAD-001 미완료 | 낮음 | 높음 | 스텁 컴포넌트로 개발 진행 |
| shadcn/ui 버전 충돌 | 낮음 | 중간 | 버전 고정, 문서 확인 |

### 사용자 경험 리스크

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|--------|--------|--------|----------|
| 탭 전환 혼란 | 중간 | 중간 | 명확한 시각적 피드백 |
| 문자 수 제한 인지 부족 | 중간 | 낮음 | 사전 안내 및 실시간 표시 |

---

## 참고 자료

### shadcn/ui 컴포넌트 문서

- Tabs: https://ui.shadcn.com/docs/components/tabs
- Textarea: https://ui.shadcn.com/docs/components/textarea
- Button: https://ui.shadcn.com/docs/components/button

### 접근성 가이드

- WAI-ARIA Tabs Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/

---

*TAG: SPEC-UPLOAD-002*
