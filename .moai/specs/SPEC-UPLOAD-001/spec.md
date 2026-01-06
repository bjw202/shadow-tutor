---
id: SPEC-UPLOAD-001
version: "1.1.0"
status: "implemented"
created: "2026-01-06"
updated: "2026-01-07"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-UPLOAD-001: 텍스트 파일 업로드

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-06 | MoAI-ADK | 초기 SPEC 생성 |
| 1.1.0 | 2026-01-07 | MoAI-ADK | TDD 구현 완료 (79 tests, 100% pass) |

---

## 1. 개요

Shadow Tutor 애플리케이션의 텍스트 파일 업로드 기능을 구현합니다. 사용자가 .txt 파일을 드래그 앤 드롭으로 업로드하고, 텍스트를 문장/구문 단위로 분할하여 쉐도잉 연습에 활용할 수 있도록 합니다.

### 1.1 목적

- 사용자가 자신만의 학습 자료를 업로드할 수 있도록 함
- 텍스트를 쉐도잉 연습에 적합한 세그먼트로 분할
- 업로드된 컨텐츠 미리보기 및 편집 기능 제공

### 1.2 범위

- .txt 파일 드래그 앤 드롭 업로드
- 파일 유효성 검증 (확장자, 크기)
- 텍스트 파싱 및 문장/구문 단위 분할
- 업로드된 컨텐츠 미리보기
- Zustand를 통한 로컬 상태 저장

---

## 2. EARS 요구사항

### 2.1 Ubiquitous Requirements (항상 참인 요구사항)

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** UTF-8 인코딩 텍스트 파일을 지원해야 한다 |
| UR-002 | 시스템은 **항상** 업로드된 텍스트를 세그먼트로 분할해야 한다 |
| UR-003 | 시스템은 **항상** 파일 업로드 진행률을 표시해야 한다 |
| UR-004 | 시스템은 **항상** 모바일 환경에서 파일 선택 버튼을 제공해야 한다 |

### 2.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 사용자가 .txt 파일을 드롭존에 드롭할 때 **THEN** 파일이 업로드되고 파싱되어야 한다 |
| ED-002 | **WHEN** 사용자가 파일 선택 버튼을 클릭할 때 **THEN** 파일 탐색기가 열려야 한다 |
| ED-003 | **WHEN** 파일 파싱이 완료될 때 **THEN** 세그먼트 목록이 미리보기에 표시되어야 한다 |
| ED-004 | **WHEN** 사용자가 '확인' 버튼을 클릭할 때 **THEN** 세그먼트가 uploadStore에 저장되어야 한다 |
| ED-005 | **WHEN** 사용자가 세그먼트 경계를 조정할 때 **THEN** 미리보기가 실시간 업데이트되어야 한다 |

### 2.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 업로드 중이면 **THEN** 로딩 인디케이터가 표시되어야 한다 |
| SD-002 | **IF** 파싱 완료 상태이면 **THEN** 세그먼트 편집기가 활성화되어야 한다 |
| SD-003 | **IF** 에러 상태이면 **THEN** 에러 메시지와 재시도 버튼이 표시되어야 한다 |
| SD-004 | **IF** 텍스트가 비어있으면 **THEN** '확인' 버튼이 비활성화되어야 한다 |

### 2.4 Unwanted Behavior Requirements (원치 않는 동작)

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 1MB를 초과하는 파일을 **업로드하지 않아야 한다** |
| UB-002 | 시스템은 .txt 외의 파일 형식을 **허용하지 않아야 한다** |
| UB-003 | 시스템은 빈 파일을 **처리하지 않아야 한다** |
| UB-004 | 시스템은 서버에 파일을 **저장하지 않아야 한다** (클라이언트 처리만) |

### 2.5 Optional Feature Requirements (선택적 기능)

| ID | 요구사항 |
|----|----------|
| OF-001 | **가능하면** 분할 모드 선택 (문장/구문/단락)을 제공해야 한다 |
| OF-002 | **가능하면** 최근 업로드 히스토리를 표시해야 한다 |

---

## 3. 기술 스택

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.x | App Router, 페이지 라우팅 |
| react | 19.x | UI 컴포넌트 |
| typescript | 5.7.x | 타입 안전성 |
| tailwindcss | 4.x | 스타일링 |
| shadcn/ui | latest | Card, Button, ScrollArea 컴포넌트 |
| zustand | 5.x | uploadStore 상태 관리 |

---

## 4. 컴포넌트 구조

```
src/
├── app/
│   ├── upload/
│   │   └── page.tsx              # 업로드 페이지
│   └── api/
│       └── parse/
│           └── route.ts          # 텍스트 파싱 API (선택적)
├── components/
│   └── upload/
│       ├── file-dropzone.tsx     # 드래그앤드롭 컴포넌트
│       ├── text-preview.tsx      # 텍스트 미리보기
│       └── segment-editor.tsx    # 세그먼트 편집기
├── lib/
│   └── utils/
│       └── text-parser.ts        # 텍스트 파싱 유틸리티
├── stores/
│   └── upload-store.ts           # 업로드 상태 관리
└── types/
    └── upload.ts                 # 업로드 관련 타입 정의
```

---

## 5. 의존성

### 5.1 내부 의존성

- SPEC-INIT-001: 프로젝트 초기 설정 (완료 필요)

### 5.2 외부 의존성

- shadcn/ui: Card, Button, ScrollArea 컴포넌트
- Native File API: 파일 드래그 앤 드롭

---

## 6. 참고 자료

- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
