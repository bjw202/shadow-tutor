# SPEC-AUTOPLAY-001-FIX: 구현 계획

---
spec_id: SPEC-AUTOPLAY-001-FIX
phase: plan
created: 2026-01-07
status: Completed
---

## 1. 구현 개요

### 1.1 목표

두 개의 Audio 인스턴스 문제를 해결하여 자동 재생이 끝까지 동작하도록 수정

### 1.2 핵심 변경 사항

1. `AudioPlayer` 컴포넌트에서 자동 진행 로직 내부 처리
2. `session/page.tsx`에서 중복 `useAudioPlayer` 호출 제거
3. `goToSegment` 함수를 콜백으로 노출

---

## 2. 구현 단계

### Phase 1: AudioPlayer 수정

**파일**: `src/components/practice/audio-player.tsx`

**작업 내용**:

1. `usePlaybackMode` 훅 import 추가
2. `onSegmentEnd` props를 `onReady` props로 변경
3. `actionsRef`와 `currentIndexRef` 생성
4. `handleInternalSegmentEnd` 콜백 구현
5. `useAudioPlayer`에 내부 콜백 전달
6. refs 업데이트 로직 추가
7. `onReady` 콜백으로 `goToSegment` 노출

**예상 변경 라인**: 약 40줄 추가/수정

### Phase 2: session/page.tsx 수정

**파일**: `src/app/practice/session/page.tsx`

**작업 내용**:

1. `useAudioPlayer` import 제거
2. `usePlaybackMode` import 제거 (AudioPlayer 내부로 이동)
3. `handleAudioSegmentEnd` 함수 제거
4. `audioActionsRef` 생성
5. `handleAudioReady` 콜백 구현
6. `handleSegmentSelect` 콜백 구현
7. `AudioPlayer` props 변경: `onSegmentEnd` → `onReady`
8. `SegmentList` onSelect 핸들러 변경
9. `PlaybackSpeed` onChange 핸들러를 스토어 함수로 변경

**예상 변경 라인**: 약 20줄 변경

### Phase 3: 검증

**작업 내용**:

1. TypeScript 타입 체크 실행
2. Next.js 빌드 확인
3. 개발 서버에서 수동 테스트
   - 연속 모드 전체 자동 재생
   - 쉐도잉 모드 전체 자동 재생
   - 세그먼트 선택 동작

---

## 3. 구현 순서

```
1. audio-player.tsx 수정
   ↓
2. session/page.tsx 수정
   ↓
3. npm run type-check
   ↓
4. npm run build
   ↓
5. 수동 테스트
```

---

## 4. 리스크 및 완화 방안

### 4.1 Ref 클로저 문제

**리스크**: `handleInternalSegmentEnd`에서 `nextSegment`, `play`가 stale closure로 잘못된 값 참조

**완화**: `useRef`로 최신 함수 참조 유지

### 4.2 초기화 순서 문제

**리스크**: `onReady` 콜백이 `goToSegment` 정의 전에 호출될 수 있음

**완화**: `useEffect`로 `goToSegment` 정의 후 콜백 호출

### 4.3 하위 호환성

**리스크**: `AudioPlayer` props 변경으로 기존 사용처 오류

**완화**: 이 프로젝트에서 `AudioPlayer`는 `session/page.tsx`에서만 사용되므로 영향 없음

---

## 5. 완료 기준

- [ ] TypeScript 타입 체크 통과
- [ ] Next.js 빌드 성공
- [ ] 연속 모드: 5개 세그먼트 자동 재생 확인
- [ ] 쉐도잉 모드: 반복 + 자동 진행 확인
- [ ] 세그먼트 선택: 클릭 시 해당 세그먼트 재생 확인

---

## 6. 구현 결과

### 6.1 완료 상태

모든 구현 단계 완료 (2026-01-07)

### 6.2 검증 결과

- [x] TypeScript 타입 체크 통과
- [x] Next.js 빌드 성공
- [x] 개발 서버에서 동작 확인 (사용자 검증)

### 6.3 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `src/components/practice/audio-player.tsx` | 수정 | 자동 진행 로직 내부화, props 변경 |
| `src/app/practice/session/page.tsx` | 수정 | 중복 훅 호출 제거, 콜백 패턴 적용 |
