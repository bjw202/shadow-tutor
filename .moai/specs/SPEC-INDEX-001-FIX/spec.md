# SPEC-INDEX-001-FIX: 홈 페이지 버튼 네비게이션 및 테마 버그 수정

---
spec_id: SPEC-INDEX-001-FIX
title: 홈 페이지 버튼 네비게이션 및 테마 버그 수정
created: 2026-01-07
status: Implemented
priority: high
author: MoAI-ADK
lifecycle: bug-fix
tags: [bugfix, navigation, theme, link, dom-class]
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-07 | MoAI-ADK | 초기 SPEC 생성 및 구현 완료 |

---

## 1. 문제 설명 (Problem Statement)

### 1.1 현상

홈 페이지(index)에서 두 가지 버그 발생:

**버그 1: 버튼 네비게이션 실패**
- "Start Practice" 버튼 클릭 시 `/practice`로 이동 안 됨
- "Settings" 버튼 클릭 시 `/settings`로 이동 안 됨
- "Upload File" 버튼만 정상 동작

**버그 2: 테마 변경 미반영**
- Light/Dark/System 버튼 클릭 시 상태값만 변경됨
- 실제 화면 테마(색상)는 변경되지 않음

### 1.2 예상 동작

```
버그 1:
Given: 홈 페이지에서 "Start Practice" 버튼이 표시됨
When: 버튼을 클릭한다
Then: /practice 페이지로 이동해야 한다

버그 2:
Given: 테마가 "system"으로 설정됨
When: "Dark" 버튼을 클릭한다
Then: 화면이 다크 테마로 변경되어야 한다
```

### 1.3 실제 동작

**버그 1:**
- 버튼 클릭 → 아무 반응 없음 (페이지 이동 안 됨)

**버그 2:**
- 버튼 클릭 → "Current theme: dark" 텍스트만 변경됨
- 화면 색상은 그대로 유지

### 1.4 영향 범위

- **홈 페이지 (/)**: 네비게이션 및 테마 기능 미작동
- **전체 앱**: 테마 설정이 시각적으로 반영되지 않음

---

## 2. 근본 원인 분석 (Root Cause Analysis)

### 2.1 버그 1: Link 컴포넌트 누락

**문제 코드 (page.tsx:62-65, 78-81):**
```tsx
// "Start Practice" 버튼 - Link 없음
<Button variant="secondary" className="w-full">
  <Play className="mr-2 h-4 w-4" />
  Start Practice
</Button>

// "Settings" 버튼 - Link 없음
<Button variant="outline" className="w-full">
  <Settings className="mr-2 h-4 w-4" />
  Settings
</Button>
```

**정상 코드 (Upload 버튼):**
```tsx
<Link href="/upload">
  <Button className="w-full">Upload File</Button>
</Link>
```

### 2.2 버그 2: DOM 클래스 미적용

**문제 코드 (app-store.ts):**
```typescript
setTheme: (theme) => set({ theme })
// 상태만 변경하고 DOM에 클래스를 적용하지 않음
```

**Tailwind CSS의 다크 모드 동작 원리:**
```css
/* globals.css */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```

Tailwind의 다크 모드는 `<html>` 요소에 `dark` 클래스가 있어야 `.dark` CSS 변수가 활성화됩니다.

### 2.3 테스트 커버리지 부재

| 컴포넌트 | 테스트 존재 | 버그 유형 |
|----------|------------|----------|
| `page.tsx` | ❌ 없음 | Link 누락 |
| `app-store.ts` | ❌ 없음 | DOM 미반영 |
| `file-dropzone.tsx` | ✅ 있음 | - |
| `text-preview.tsx` | ✅ 있음 | - |

---

## 3. 수정 사항 (Changes Required)

### 3.1 page.tsx - Link 추가

**변경 내용:**

```tsx
// Before (버그)
<CardContent>
  <Button variant="secondary" className="w-full">
    <Play className="mr-2 h-4 w-4" />
    Start Practice
  </Button>
</CardContent>

// After (수정)
<CardContent>
  <Link href="/practice">
    <Button variant="secondary" className="w-full">
      <Play className="mr-2 h-4 w-4" />
      Start Practice
    </Button>
  </Link>
</CardContent>
```

Settings 버튼도 동일하게 `<Link href="/settings">` 추가.

### 3.2 theme-provider.tsx - 신규 생성

**파일**: `src/components/theme-provider.tsx`

**역할**: 테마 상태 변경 시 `<html>` 요소에 클래스 적용

```tsx
"use client";

import { useEffect } from "react";
import { useAppStore, Theme } from "@/stores/app-store";

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    root.classList.add(systemPrefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    applyThemeToDOM(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyThemeToDOM("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return <>{children}</>;
}
```

### 3.3 layout.tsx - ThemeProvider 래핑

**변경 내용:**

```tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="...">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 4. 검증 기준 (Acceptance Criteria)

### 4.1 버튼 네비게이션

```gherkin
Scenario: Start Practice 버튼 클릭 시 페이지 이동
  Given 홈 페이지가 표시되어 있다
  When "Start Practice" 버튼을 클릭한다
  Then /practice 페이지로 이동해야 한다

Scenario: Settings 버튼 클릭 시 페이지 이동
  Given 홈 페이지가 표시되어 있다
  When "Settings" 버튼을 클릭한다
  Then /settings 페이지로 이동해야 한다
```

### 4.2 테마 변경

```gherkin
Scenario: 다크 테마 적용
  Given 테마가 "light"로 설정되어 있다
  When "Dark" 버튼을 클릭한다
  Then <html> 요소에 "dark" 클래스가 추가되어야 한다
  And 배경색이 어두운 색으로 변경되어야 한다

Scenario: 시스템 테마 적용
  Given 시스템이 다크 모드로 설정되어 있다
  When "System" 버튼을 클릭한다
  Then <html> 요소에 "dark" 클래스가 추가되어야 한다
```

---

## 5. 관련 파일

### 수정된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/app/page.tsx` | 수정 | Link 컴포넌트 추가 |
| `src/components/theme-provider.tsx` | 신규 | 테마 DOM 적용 로직 |
| `src/app/layout.tsx` | 수정 | ThemeProvider 래핑 |
| `src/stores/app-store.ts` | 정리 | 중복 로직 제거 |

### 변경 없음

- `src/app/globals.css` - 기존 테마 CSS 변수 유지
- `src/components/ui/*` - UI 컴포넌트 변경 없음

---

## 6. 교훈 (Lessons Learned)

### 6.1 UI 렌더링 ≠ 기능 동작

```
나쁜 예: 버튼이 보이면 동작한다고 가정
좋은 예: 버튼의 클릭 이벤트와 결과(페이지 이동)를 검증
```

### 6.2 상태 변경 ≠ 시각적 반영

```
나쁜 예: Zustand 상태가 변경되면 UI가 반영된다고 가정
좋은 예: 상태 변경 → DOM 업데이트 → CSS 반영 전체 흐름 검증
```

### 6.3 바이브 코딩의 테스트 부채

빠른 개발 속도를 위해 테스트를 생략하면 다음과 같은 버그가 발생합니다:

| 테스트 유형 | 누락 시 발생 버그 |
|------------|------------------|
| 단위 테스트 | 함수 로직 오류 |
| 통합 테스트 | 컴포넌트 간 연결 오류 (이번 사례) |
| E2E 테스트 | 사용자 시나리오 오류 |

### 6.4 권장 테스트 패턴

```tsx
// 네비게이션 테스트
it("Start Practice 버튼에 올바른 href가 있어야 한다", () => {
  const link = screen.getByRole("link", { name: /start practice/i });
  expect(link).toHaveAttribute("href", "/practice");
});

// 테마 적용 테스트
it("다크 테마 선택 시 html에 dark 클래스가 추가되어야 한다", () => {
  fireEvent.click(screen.getByText("Dark"));
  expect(document.documentElement).toHaveClass("dark");
});
```

---

## 7. 추적성 (Traceability)

### 관련 SPEC

- SPEC-INIT-001: 프로젝트 초기화 (홈 페이지 생성)

### 테스트 커버리지 개선 필요

- [ ] `page.tsx`에 대한 통합 테스트 추가
- [ ] `theme-provider.tsx`에 대한 단위 테스트 추가
- [ ] E2E 테스트로 전체 네비게이션 흐름 검증

