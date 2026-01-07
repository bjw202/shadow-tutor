---
id: SPEC-PLAYER-001
type: implementation-plan
version: "1.0.0"
created: "2026-01-07"
---

# SPEC-PLAYER-001: 구현 계획

## 1. 마일스톤 개요

### 1.1 Primary Goal (핵심 기능)

**목표:** 프로그레스 바 및 시크 기능 구현

**구현 항목:**
- ProgressBar 컴포넌트 생성
- 시간 표시 포맷팅 유틸리티
- useAudioPlayer 훅 확장 (seek 기능)
- 프로그레스 바 클릭/드래그 이벤트 처리

**관련 요구사항:** UR-002, ED-001, ED-002, ED-007, SD-001, SD-006, SD-007

**기술적 접근:**
- shadcn/ui Slider 컴포넌트 활용
- HTML5 Audio currentTime 속성 활용
- requestAnimationFrame을 사용한 부드러운 업데이트

### 1.2 Secondary Goal (부가 기능)

**목표:** 볼륨 조절 기능 구현

**구현 항목:**
- VolumeControl 컴포넌트 생성
- 볼륨 아이콘 상태 관리 (음소거/낮음/높음)
- 음소거 토글 기능
- practiceStore 볼륨 상태 추가

**관련 요구사항:** UR-004, ED-003, ED-004, SD-002, SD-003, SD-004, SD-008

**기술적 접근:**
- HTML5 Audio volume 속성 활용
- lucide-react 볼륨 아이콘 (Volume, Volume1, Volume2, VolumeX)
- localStorage를 통한 볼륨 설정 유지

### 1.3 Tertiary Goal (보완 기능)

**목표:** 텍스트 하이라이트 및 자동 스크롤 강화

**구현 항목:**
- SegmentHighlight 컴포넌트 생성
- SegmentList 자동 스크롤 기능
- useAutoScroll 커스텀 훅
- 하이라이트 애니메이션 CSS

**관련 요구사항:** UR-001, ED-005, ED-006, SD-005, UB-003, UB-004

**기술적 접근:**
- scrollIntoView API 활용
- Intersection Observer를 통한 스크롤 감지
- CSS transition/animation 활용

### 1.4 Optional Goal (선택 기능)

**목표:** 키보드 접근성 및 추가 기능

**구현 항목:**
- 키보드 시크 (방향키 5초 전/후)
- 더블 탭 시크 (모바일 10초)
- 버퍼링 상태 표시

**관련 요구사항:** UR-005, ED-008, OF-001, OF-002, OF-003

---

## 2. 기술적 접근 방식

### 2.1 컴포넌트 아키텍처

```
AudioPlayer (container)
├── SegmentHighlight (텍스트 하이라이트)
├── ProgressBar (프로그레스 바)
│   ├── TimeDisplay (현재 시간)
│   ├── Slider (shadcn/ui)
│   └── TimeDisplay (총 시간)
├── PlayerControls (기존 재생 버튼)
└── VolumeControl (볼륨 조절)
    ├── VolumeIcon (상태별 아이콘)
    └── Slider (볼륨 슬라이더)
```

### 2.2 상태 관리 전략

**전역 상태 (practiceStore):**
- volume: 볼륨 레벨 (0-1)
- isMuted: 음소거 상태
- isAutoScrollEnabled: 자동 스크롤 활성화

**로컬 상태 (useAudioPlayer):**
- currentTime: 현재 재생 시간
- duration: 총 오디오 길이
- isSeeking: 시크 중 여부

### 2.3 이벤트 처리 전략

**프로그레스 바:**
```typescript
// 드래그 시작 시 오디오 일시정지 (끊김 방지)
// 드래그 종료 시 시크 후 재개
const handleSeekStart = () => {
  wasPlayingBeforeSeek.current = isPlaying;
  if (isPlaying) pause();
};

const handleSeekEnd = (value: number) => {
  seekTo(value);
  if (wasPlayingBeforeSeek.current) play();
};
```

**자동 스크롤:**
```typescript
// 사용자 스크롤 감지 시 자동 스크롤 비활성화
// 3초 후 재활성화
const handleUserScroll = () => {
  setAutoScrollEnabled(false);
  clearTimeout(scrollTimeoutRef.current);
  scrollTimeoutRef.current = setTimeout(() => {
    setAutoScrollEnabled(true);
  }, 3000);
};
```

---

## 3. 구현 순서

### Phase 1: 프로그레스 바 기반 구축

**Step 1.1:** 시간 포맷팅 유틸리티 생성
- `formatTime(seconds: number): string` 함수
- 분:초 형식 (예: 1:30)

**Step 1.2:** useAudioPlayer 훅 확장
- currentTime, duration 상태 추가
- seekTo(time: number) 함수 추가
- timeupdate 이벤트 리스너 최적화

**Step 1.3:** ProgressBar 컴포넌트 생성
- shadcn/ui Slider 기반
- 시간 표시 UI
- 클릭/드래그 이벤트 핸들링

**Step 1.4:** AudioPlayer 통합
- ProgressBar 컴포넌트 배치
- 레이아웃 재구성

### Phase 2: 볼륨 조절 구현

**Step 2.1:** practiceStore 확장
- volume, isMuted 상태 추가
- setVolume, toggleMute 액션 추가
- persist 미들웨어에 volume 추가

**Step 2.2:** VolumeControl 컴포넌트 생성
- 볼륨 아이콘 (상태별 분기)
- 볼륨 슬라이더
- 클릭 토글 기능

**Step 2.3:** useAudioPlayer 훅 통합
- volume 변경 시 audio.volume 동기화
- isMuted 변경 시 audio.muted 동기화

**Step 2.4:** 모바일 대응
- 화면 너비 감지
- 모바일에서 볼륨 컨트롤 숨김

### Phase 3: 텍스트 하이라이트 강화

**Step 3.1:** SegmentHighlight 컴포넌트 생성
- 현재 세그먼트 텍스트 강조 표시
- 재생 상태에 따른 시각적 피드백

**Step 3.2:** useAutoScroll 훅 생성
- scrollIntoView 로직
- 사용자 스크롤 감지
- 타이머 기반 재활성화

**Step 3.3:** SegmentList 개선
- 자동 스크롤 통합
- 현재 세그먼트 하이라이트 애니메이션

### Phase 4: 접근성 및 최적화

**Step 4.1:** 키보드 네비게이션
- 방향키 시크 (5초)
- Tab 네비게이션 순서

**Step 4.2:** ARIA 속성 추가
- aria-label
- aria-valuenow, aria-valuemin, aria-valuemax
- role="slider"

**Step 4.3:** 성능 최적화
- 불필요한 리렌더링 방지
- requestAnimationFrame 활용

---

## 4. 파일 생성/수정 목록

### 4.1 신규 파일

| 파일 경로 | 설명 |
|-----------|------|
| `src/components/practice/progress-bar.tsx` | 프로그레스 바 컴포넌트 |
| `src/components/practice/volume-control.tsx` | 볼륨 조절 컴포넌트 |
| `src/components/practice/segment-highlight.tsx` | 텍스트 하이라이트 컴포넌트 |
| `src/lib/hooks/use-auto-scroll.ts` | 자동 스크롤 훅 |
| `src/lib/utils/format-time.ts` | 시간 포맷팅 유틸리티 |

### 4.2 수정 파일

| 파일 경로 | 수정 내용 |
|-----------|----------|
| `src/components/practice/audio-player.tsx` | UI 레이아웃 재구성, 신규 컴포넌트 통합 |
| `src/components/practice/segment-list.tsx` | 자동 스크롤, 하이라이트 애니메이션 추가 |
| `src/lib/hooks/use-audio-player.ts` | seekTo, currentTime, duration 추가 |
| `src/stores/practice-store.ts` | volume, isMuted, isAutoScrollEnabled 추가 |
| `src/types/audio.ts` | 타입 확장 |

### 4.3 설치 필요 패키지

```bash
# shadcn/ui Slider (필수)
npx shadcn@latest add slider

# framer-motion (선택적 - 고급 애니메이션 시)
npm install framer-motion
```

---

## 5. 위험 요소 및 대응

### 5.1 기술적 위험

| 위험 | 영향 | 대응 방안 |
|------|------|----------|
| 프로그레스 바 드래그 중 오디오 끊김 | 사용자 경험 저하 | 드래그 시작 시 일시정지, 종료 시 재개 |
| 자동 스크롤과 사용자 스크롤 충돌 | 혼란스러운 UX | Intersection Observer로 사용자 스크롤 감지 |
| 모바일 볼륨 제어 제한 | iOS에서 시스템 볼륨만 가능 | 모바일에서 볼륨 컨트롤 숨김 |
| 60fps 업데이트 성능 | 배터리 소모 증가 | requestAnimationFrame 사용, 적정 업데이트 주기 |

### 5.2 브라우저 호환성

| 기능 | Chrome | Safari | Firefox |
|------|--------|--------|---------|
| Audio API | 지원 | 지원 | 지원 |
| scrollIntoView | 지원 | 지원 | 지원 |
| Intersection Observer | 지원 | 지원 | 지원 |
| CSS scroll-behavior | 지원 | 지원 | 지원 |

---

## 6. 테스트 전략

### 6.1 단위 테스트

- formatTime 유틸리티 함수
- useAudioPlayer seekTo 기능
- useAutoScroll 스크롤 로직

### 6.2 통합 테스트

- ProgressBar 클릭/드래그 동작
- VolumeControl 상태 변경
- SegmentList 자동 스크롤

### 6.3 E2E 테스트

- 전체 재생 플로우 (재생 -> 시크 -> 일시정지)
- 모바일 터치 상호작용
- 키보드 네비게이션

---

## 7. 참고 사항

### 7.1 SPEC-TTS-001 연계

이 SPEC은 SPEC-TTS-001의 미구현 선택적 기능(OF-002, OF-003)을 구현합니다:
- OF-002: 볼륨 조절 기능 -> Secondary Goal
- OF-003: 오디오 프로그레스 바 (seek) -> Primary Goal

### 7.2 후속 SPEC 연계

- SPEC-SHADOW-001: 쉐도잉 모드 자동 일시정지 (이 SPEC의 타이머 기반 로직 활용 가능)
- SPEC-PWA-001: 오프라인 오디오 캐싱 (볼륨 설정 포함)

---

*Document Version: 1.0.0*
*Created: 2026-01-07*
