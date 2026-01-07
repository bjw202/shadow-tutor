# SPEC-INDEX-001-FIX: 구현 계획

---
spec_id: SPEC-INDEX-001-FIX
phase: plan
created: 2026-01-07
status: Completed
---

## 1. 구현 개요

### 1.1 목표

홈 페이지의 두 가지 버그 수정:
1. 버튼 네비게이션 복구 (Link 추가)
2. 테마 변경 시 실제 화면 반영 (ThemeProvider 추가)

### 1.2 핵심 변경 사항

1. `page.tsx`: "Start Practice", "Settings" 버튼에 Link 추가
2. `theme-provider.tsx`: 신규 생성 - DOM 클래스 적용 로직
3. `layout.tsx`: ThemeProvider 래핑
4. `app-store.ts`: 중복 로직 정리

---

## 2. 구현 단계

### Phase 1: 버튼 네비게이션 수정

**파일**: `src/app/page.tsx`

**작업 내용**:

1. "Start Practice" 버튼을 `<Link href="/practice">`로 감싸기
2. "Settings" 버튼을 `<Link href="/settings">`로 감싸기

**예상 변경 라인**: 4줄 추가

**Before:**
```tsx
<Button variant="secondary">Start Practice</Button>
```

**After:**
```tsx
<Link href="/practice">
  <Button variant="secondary">Start Practice</Button>
</Link>
```

### Phase 2: ThemeProvider 생성

**파일**: `src/components/theme-provider.tsx` (신규)

**작업 내용**:

1. `applyThemeToDOM` 함수 구현
   - `document.documentElement`에서 light/dark 클래스 제거
   - 현재 테마에 따라 적절한 클래스 추가
   - system 테마인 경우 `prefers-color-scheme` 확인
2. `ThemeProvider` 컴포넌트 구현
   - `useAppStore`에서 theme 구독
   - `useEffect`로 테마 변경 시 DOM 업데이트
   - system 테마인 경우 미디어 쿼리 리스너 등록

**예상 라인**: 35줄

### Phase 3: Layout에 ThemeProvider 적용

**파일**: `src/app/layout.tsx`

**작업 내용**:

1. `ThemeProvider` import 추가
2. `<body>` 내부를 `<ThemeProvider>`로 래핑

**예상 변경 라인**: 3줄 변경

### Phase 4: app-store 정리

**파일**: `src/stores/app-store.ts`

**작업 내용**:

1. `setTheme`에서 DOM 조작 로직 제거 (ThemeProvider가 담당)
2. 순수하게 상태만 관리하도록 유지

**예상 변경 라인**: 변경 없음 (이미 정리됨)

### Phase 5: 검증

**작업 내용**:

1. TypeScript 타입 체크 실행
2. Next.js 빌드 확인
3. 개발 서버에서 수동 테스트
   - "Start Practice" 버튼 → /practice 이동
   - "Settings" 버튼 → /settings 이동
   - Light/Dark/System 버튼 → 화면 테마 변경

---

## 3. 구현 순서

```
1. page.tsx - Link 추가
   ↓
2. theme-provider.tsx 생성
   ↓
3. layout.tsx - ThemeProvider 래핑
   ↓
4. app-store.ts 정리 (필요시)
   ↓
5. npm run build
   ↓
6. 수동 테스트
```

---

## 4. 리스크 및 완화 방안

### 4.1 SSR 하이드레이션 불일치

**리스크**: ThemeProvider가 클라이언트에서만 DOM을 조작하므로 서버 렌더링과 불일치 발생 가능

**완화**:
- `<html>` 태그에 `suppressHydrationWarning` 속성 추가 (이미 존재)
- `"use client"` 지시어로 클라이언트 컴포넌트로 명시

### 4.2 테마 깜빡임 (FOUC)

**리스크**: 페이지 로드 시 잠시 기본 테마가 보이다가 설정된 테마로 변경

**완화**:
- 현재 수준에서는 수용 가능
- 추후 개선 시 `<head>` 스크립트로 초기 테마 적용 가능

### 4.3 시스템 테마 변경 미감지

**리스크**: 시스템 테마가 변경되어도 앱 테마가 업데이트되지 않음

**완화**:
- `matchMedia` 이벤트 리스너로 시스템 테마 변경 감지
- ThemeProvider에서 구현 완료

---

## 5. 완료 기준

- [x] TypeScript 타입 체크 통과
- [x] Next.js 빌드 성공
- [x] "Start Practice" 버튼 → /practice 이동 확인
- [x] "Settings" 버튼 → /settings 이동 확인
- [x] Light 버튼 → 라이트 테마 적용 확인
- [x] Dark 버튼 → 다크 테마 적용 확인
- [x] System 버튼 → 시스템 설정 따름 확인

---

## 6. 구현 결과

### 6.1 완료 상태

모든 구현 단계 완료 (2026-01-07)

### 6.2 검증 결과

- [x] TypeScript 타입 체크 통과
- [x] Next.js 빌드 성공
- [x] 네비게이션 동작 확인
- [x] 테마 변경 동작 확인

### 6.3 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/app/page.tsx` | 수정 | Link 컴포넌트 추가 (2개 버튼) |
| `src/components/theme-provider.tsx` | 신규 | 테마 DOM 적용 로직 |
| `src/app/layout.tsx` | 수정 | ThemeProvider import 및 래핑 |
| `src/stores/app-store.ts` | 정리 | 순수 상태 관리로 복원 |

