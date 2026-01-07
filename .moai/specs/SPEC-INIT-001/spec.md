---
id: SPEC-INIT-001
version: "1.0.0"
status: "implemented"
created: "2026-01-06"
updated: "2026-01-07"
author: "MoAI-ADK"
priority: "high"
---

# SPEC-INIT-001: Shadow Tutor 프로젝트 초기 설정

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-06 | MoAI-ADK | 초기 SPEC 생성 |
| 1.0.0 | 2026-01-07 | MoAI-ADK | 상태 변경: draft -> implemented (구현 완료 확인) |

---

## 1. 개요

Shadow Tutor 프로젝트의 기술 스택 초기화를 수행합니다. Next.js 16 App Router 기반의 모바일 퍼스트 PWA 구조를 설정하고, Tailwind CSS 4와 shadcn/ui를 통한 UI 시스템, Zustand 5를 활용한 상태 관리 기본 구조를 구축합니다.

### 1.1 목적

- Next.js 16 App Router 프로젝트 기반 구축
- 모바일 퍼스트 반응형 UI 시스템 설정
- 타입 안전한 상태 관리 구조 확립
- 개발 생산성을 위한 표준 폴더 구조 생성

### 1.2 범위

- Next.js 16 프로젝트 생성 및 설정
- Tailwind CSS 4 + shadcn/ui 통합
- Zustand 5 상태 관리 기본 구조
- 표준 폴더 구조 및 파일 템플릿

---

## 2. EARS 요구사항

### 2.1 Ubiquitous Requirements (항상 참인 요구사항)

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** TypeScript strict 모드로 컴파일되어야 한다 |
| UR-002 | 시스템은 **항상** ESLint 검사를 통과해야 한다 |
| UR-003 | 시스템은 **항상** Next.js App Router 구조를 따라야 한다 |
| UR-004 | 시스템은 **항상** 모바일 퍼스트 반응형 디자인을 지원해야 한다 |

### 2.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 개발 서버가 시작될 때 **THEN** Next.js 개발 서버가 localhost:3000에서 정상적으로 실행되어야 한다 |
| ED-002 | **WHEN** 프로덕션 빌드가 실행될 때 **THEN** 빌드 오류 없이 .next 폴더에 결과물이 생성되어야 한다 |
| ED-003 | **WHEN** Tailwind CSS 클래스가 적용될 때 **THEN** 스타일이 올바르게 렌더링되어야 한다 |
| ED-004 | **WHEN** shadcn/ui Button 컴포넌트가 임포트될 때 **THEN** variant props와 함께 정상적으로 렌더링되어야 한다 |
| ED-005 | **WHEN** Zustand 스토어가 초기화될 때 **THEN** 기본 상태값이 설정되어야 한다 |

### 2.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 개발 환경이면 **THEN** Turbopack 핫 리로드가 활성화되어야 한다 |
| SD-002 | **IF** 프로덕션 환경이면 **THEN** 최적화된 번들이 생성되어야 한다 |
| SD-003 | **IF** TypeScript 타입 오류가 있으면 **THEN** 빌드가 실패해야 한다 |

### 2.4 Unwanted Behavior Requirements (원치 않는 동작)

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 any 타입을 명시적으로 **사용하지 않아야 한다** |
| UB-002 | 시스템은 console.log를 프로덕션 코드에 **포함하지 않아야 한다** |
| UB-003 | 시스템은 CSS 인라인 스타일을 **사용하지 않아야 한다** (Tailwind 사용) |
| UB-004 | 시스템은 Pages Router 구조를 **사용하지 않아야 한다** |

### 2.5 Optional Feature Requirements (선택적 기능)

| ID | 요구사항 |
|----|----------|
| OF-001 | **가능하면** PWA manifest 기본 설정을 포함해야 한다 |
| OF-002 | **가능하면** 기본 SEO 메타데이터를 설정해야 한다 |

---

## 3. 기술 스택

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.0.0 | React 프레임워크 (App Router) |
| react | 19.0.0 | UI 라이브러리 |
| react-dom | 19.0.0 | React DOM 렌더링 |
| typescript | 5.7.2 | 타입 시스템 |
| tailwindcss | 4.0.0 | 유틸리티 CSS 프레임워크 |
| zustand | 5.0.0 | 상태 관리 |
| lucide-react | latest | 아이콘 라이브러리 |
| clsx | latest | 조건부 클래스명 |
| tailwind-merge | latest | Tailwind 클래스 병합 |
| class-variance-authority | latest | shadcn/ui 의존성 |

---

## 4. 폴더 구조

```
shadow-tutor/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   └── layout/
│   │       └── header.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── stores/
│   │   └── app-store.ts
│   ├── hooks/
│   ├── types/
│   │   └── index.ts
│   └── services/
├── public/
│   └── icons/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── components.json
└── package.json
```

---

## 5. 의존성

### 5.1 내부 의존성

- 없음 (초기 SPEC)

### 5.2 외부 의존성

- Node.js v20.0.0 이상
- npm v10.0.0 이상

---

## 6. 참고 자료

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
