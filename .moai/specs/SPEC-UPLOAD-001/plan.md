---
id: SPEC-UPLOAD-001
document_type: implementation-plan
version: "1.1.0"
created: "2026-01-06"
updated: "2026-01-07"
---

# SPEC-UPLOAD-001: 구현 계획

## 관련 SPEC

- [spec.md](./spec.md) - EARS 요구사항 명세

---

## 1. 구현 단계 개요

| 단계 | 설명 | 우선순위 | 상태 |
|------|------|----------|------|
| Step 1 | 타입 정의 및 인터페이스 설계 | High | COMPLETED |
| Step 2 | 텍스트 파서 유틸리티 구현 | High | COMPLETED |
| Step 3 | Zustand 스토어 구현 | High | COMPLETED |
| Step 4 | FileDropzone 컴포넌트 구현 | High | COMPLETED |
| Step 5 | TextPreview 컴포넌트 구현 | Medium | COMPLETED |
| Step 6 | SegmentEditor 컴포넌트 구현 | Medium | COMPLETED |
| Step 7 | Upload 페이지 통합 | High | COMPLETED |

---

## 구현 완료 요약

**구현 일자:** 2026-01-07

**테스트 결과:**
- 총 테스트: 79개
- 통과: 79개 (100%)
- 실패: 0개

**품질 검증:**
- TypeScript 타입 체크: 0 errors
- ESLint: 4 warnings (테스트 파일 내 minor issues)

**생성된 파일:**

구현 파일:
- `src/types/upload.ts` - 타입 정의
- `src/lib/utils/text-parser.ts` - 텍스트 파서
- `src/stores/upload-store.ts` - Zustand 스토어
- `src/components/upload/file-dropzone.tsx` - 드롭존 컴포넌트
- `src/components/upload/text-preview.tsx` - 미리보기 컴포넌트
- `src/components/upload/segment-editor.tsx` - 편집기 컴포넌트
- `src/components/ui/select.tsx` - Select UI 컴포넌트
- `src/app/upload/page.tsx` - 업로드 페이지

테스트 파일:
- `src/__tests__/unit/lib/text-parser.test.ts` (24 tests)
- `src/__tests__/unit/stores/upload-store.test.ts` (23 tests)
- `src/__tests__/unit/components/file-dropzone.test.tsx` (11 tests)
- `src/__tests__/unit/components/text-preview.test.tsx` (9 tests)
- `src/__tests__/unit/components/segment-editor.test.tsx` (12 tests)

---

## 2. 상세 구현 계획

### Step 1: 타입 정의 및 인터페이스 설계

**파일:** `src/types/upload.ts`

**구현 내용:**
- `Segment` 인터페이스: id, text, startIndex, endIndex
- `UploadState` 타입: idle, uploading, parsing, completed, error
- `ParsedContent` 인터페이스: segments, originalText, fileName
- `UploadError` 타입: 파일 크기 초과, 잘못된 형식, 빈 파일 등

**의존성:** 없음

**인수 조건:**
- 모든 타입이 TypeScript strict 모드에서 컴파일 가능
- JSDoc 주석으로 각 타입 설명 포함

---

### Step 2: 텍스트 파서 유틸리티 구현

**파일:** `src/lib/utils/text-parser.ts`

**구현 내용:**
- `parseTextBySentence()`: 문장 단위 분할 (마침표, 느낌표, 물음표 기준)
- `parseTextByPhrase()`: 구문 단위 분할 (쉼표, 세미콜론 포함)
- `parseTextByParagraph()`: 단락 단위 분할 (빈 줄 기준)
- `validateTextFile()`: 파일 유효성 검증 (크기, 확장자, 내용)

**의존성:** Step 1 (타입 정의)

**인수 조건:**
- 영어 및 한국어 텍스트 모두 올바르게 분할
- 연속된 구분자 처리 (예: "..." 또는 "!!!")
- 빈 세그먼트 제거

**TDD 접근:**
```typescript
// RED: 테스트 먼저 작성
describe('parseTextBySentence', () => {
  it('should split text by sentence endings', () => {
    const text = "Hello world. How are you? I am fine!";
    const segments = parseTextBySentence(text);
    expect(segments).toHaveLength(3);
  });
});
```

---

### Step 3: Zustand 스토어 구현

**파일:** `src/stores/upload-store.ts`

**구현 내용:**
- `uploadStore` 생성 (Zustand)
- 상태: segments, originalText, fileName, status, error
- 액션: setFile, parseFile, updateSegment, clearStore, setError

**의존성:** Step 1 (타입 정의), Step 2 (텍스트 파서)

**인수 조건:**
- 상태 변경이 올바르게 반영됨
- persist 미들웨어로 localStorage 저장 (선택적)
- devtools 미들웨어 지원

**TDD 접근:**
```typescript
describe('uploadStore', () => {
  it('should parse file and update segments', async () => {
    const store = useUploadStore.getState();
    await store.parseFile(mockFile);
    expect(store.segments.length).toBeGreaterThan(0);
  });
});
```

---

### Step 4: FileDropzone 컴포넌트 구현

**파일:** `src/components/upload/file-dropzone.tsx`

**구현 내용:**
- 드래그 앤 드롭 영역 UI (shadcn/ui Card 기반)
- 파일 선택 버튼 (모바일 대응)
- 드래그 오버 시 시각적 피드백
- 파일 유효성 검증 및 에러 표시
- 업로드 진행률 표시

**의존성:** Step 1 (타입 정의), Step 3 (스토어)

**인수 조건:**
- 데스크톱: 드래그 앤 드롭 동작
- 모바일: 파일 선택 버튼으로 대체
- 잘못된 파일 타입 시 에러 메시지 표시
- 1MB 초과 파일 거부

**TDD 접근:**
```typescript
describe('FileDropzone', () => {
  it('should accept .txt files', async () => {
    render(<FileDropzone onFileSelect={mockOnSelect} />);
    // 드롭 이벤트 시뮬레이션
  });

  it('should reject non-.txt files', async () => {
    // 에러 메시지 표시 확인
  });
});
```

---

### Step 5: TextPreview 컴포넌트 구현

**파일:** `src/components/upload/text-preview.tsx`

**구현 내용:**
- 세그먼트 목록 표시 (shadcn/ui ScrollArea)
- 각 세그먼트 인덱스 번호 표시
- 세그먼트 클릭 시 편집 모드 전환
- 빈 상태 메시지 표시

**의존성:** Step 1 (타입 정의), Step 3 (스토어)

**인수 조건:**
- 세그먼트가 순서대로 표시됨
- 스크롤 가능한 영역에서 긴 목록 처리
- 접근성: 키보드 네비게이션 지원

---

### Step 6: SegmentEditor 컴포넌트 구현

**파일:** `src/components/upload/segment-editor.tsx`

**구현 내용:**
- 세그먼트 경계 조정 UI
- 세그먼트 병합 기능
- 세그먼트 분할 기능
- 변경사항 실시간 미리보기

**의존성:** Step 1, Step 3, Step 5

**인수 조건:**
- 세그먼트 텍스트 직접 편집 가능
- 인접 세그먼트 병합 가능
- 특정 위치에서 세그먼트 분할 가능
- 변경 시 스토어 자동 업데이트

---

### Step 7: Upload 페이지 통합

**파일:** `src/app/upload/page.tsx`

**구현 내용:**
- FileDropzone, TextPreview, SegmentEditor 통합
- 워크플로우: 업로드 → 미리보기 → 편집 → 확인
- '확인' 버튼으로 최종 저장
- '취소' 버튼으로 초기화
- 반응형 레이아웃

**의존성:** Step 4, Step 5, Step 6

**인수 조건:**
- 전체 업로드 워크플로우 동작
- 상태에 따른 UI 전환
- 모바일/데스크톱 반응형 대응

---

## 3. 기술적 고려사항

### 3.1 파일 처리

- FileReader API 사용하여 클라이언트 측 파일 읽기
- UTF-8 인코딩 기본 지원
- 대용량 파일 (1MB 제한) 처리 최적화

### 3.2 상태 관리

- Zustand 선택 이유: 간결한 API, TypeScript 지원, 적은 보일러플레이트
- 선택적 localStorage persist로 새로고침 후에도 상태 유지

### 3.3 접근성

- 키보드 네비게이션 지원
- 스크린 리더 호환성
- ARIA 레이블 적용

---

## 4. 리스크 및 대응

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|-----------|
| 브라우저 호환성 | Medium | File API polyfill 검토 |
| 대용량 파일 성능 | Low | 1MB 제한으로 완화 |
| 문장 분할 정확도 | Medium | 다양한 언어 테스트 케이스 추가 |
| 모바일 UX | Medium | 파일 선택 버튼 우선 제공 |

---

## 5. 다음 단계

구현 완료 후:
1. `/moai:2-run SPEC-UPLOAD-001` 실행하여 TDD 개발 시작
2. 테스트 커버리지 85% 이상 달성
3. `/moai:3-sync SPEC-UPLOAD-001` 실행하여 문서 동기화
