# SPEC-INIT-001: 구현 계획

## 개요

Shadow Tutor 프로젝트 초기 설정을 위한 상세 구현 계획입니다.

---

## 1. 작업 분해

### Phase 1: Next.js 프로젝트 생성

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 1.1 | create-next-app 실행 | 없음 | 2분 |
| 1.2 | package.json 버전 확인 | 1.1 | 1분 |
| 1.3 | 불필요한 boilerplate 정리 | 1.2 | 2분 |

**명령어:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Phase 2: TypeScript 설정 최적화

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 2.1 | tsconfig.json strict 모드 확인 | Phase 1 | 1분 |
| 2.2 | path alias 설정 확인 | 2.1 | 1분 |

**파일:** `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Phase 3: Tailwind CSS 4 설정

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 3.1 | tailwind.config.ts 설정 | Phase 1 | 2분 |
| 3.2 | globals.css 업데이트 | 3.1 | 1분 |
| 3.3 | 테마 색상 정의 | 3.2 | 2분 |

### Phase 4: 폴더 구조 생성

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 4.1 | components/ 구조 생성 | Phase 1 | 1분 |
| 4.2 | lib/ 구조 생성 | Phase 1 | 1분 |
| 4.3 | stores/ 구조 생성 | Phase 1 | 1분 |
| 4.4 | types/ 구조 생성 | Phase 1 | 1분 |
| 4.5 | services/, hooks/ 생성 | Phase 1 | 1분 |

### Phase 5: shadcn/ui 설정

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 5.1 | shadcn init 실행 | Phase 3 | 1분 |
| 5.2 | Button 컴포넌트 추가 | 5.1 | 1분 |
| 5.3 | Card 컴포넌트 추가 | 5.1 | 1분 |

**명령어:**
```bash
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
```

### Phase 6: Zustand 스토어 설정

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 6.1 | zustand 설치 | Phase 1 | 1분 |
| 6.2 | app-store.ts 생성 | 6.1 | 3분 |
| 6.3 | 타입 정의 | 6.2 | 2분 |

**파일:** `src/stores/app-store.ts`
```typescript
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  setTheme: (theme: AppState['theme']) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  isLoading: false,
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

### Phase 7: 유틸리티 함수

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 7.1 | clsx, tailwind-merge 설치 확인 | Phase 5 | 1분 |
| 7.2 | utils.ts cn() 함수 생성 | 7.1 | 1분 |

**파일:** `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Phase 8: 검증

| 순서 | 작업 | 의존성 | 예상 시간 |
|------|------|--------|-----------|
| 8.1 | npm run dev 실행 | Phase 1-7 | 2분 |
| 8.2 | npm run build 실행 | 8.1 | 3분 |
| 8.3 | npx tsc --noEmit 실행 | 8.2 | 1분 |

---

## 2. 리스크 분석

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|--------|--------|--------|-----------|
| Tailwind CSS 4 호환성 | 중간 | 높음 | v3로 폴백 가능 |
| React 19 peer dependency 경고 | 높음 | 낮음 | 경고 무시 가능 |
| shadcn/ui Tailwind 4 미지원 | 낮음 | 중간 | 수동 스타일 조정 |

---

## 3. 산출물 체크리스트

- [ ] package.json (의존성 정의)
- [ ] tsconfig.json (TypeScript 설정)
- [ ] tailwind.config.ts (Tailwind 설정)
- [ ] next.config.ts (Next.js 설정)
- [ ] components.json (shadcn/ui 설정)
- [ ] src/app/layout.tsx (루트 레이아웃)
- [ ] src/app/page.tsx (홈 페이지)
- [ ] src/app/globals.css (글로벌 스타일)
- [ ] src/components/ui/button.tsx (Button 컴포넌트)
- [ ] src/components/ui/card.tsx (Card 컴포넌트)
- [ ] src/lib/utils.ts (유틸리티 함수)
- [ ] src/stores/app-store.ts (Zustand 스토어)
- [ ] src/types/index.ts (타입 정의)

---

## 4. 검증 기준

1. `npm run dev` - 개발 서버 정상 실행
2. `npm run build` - 빌드 성공 (오류 0개)
3. `npx tsc --noEmit` - 타입 오류 0개
4. 브라우저에서 Button, Card 컴포넌트 렌더링 확인
5. Zustand 스토어 상태 변경 동작 확인
