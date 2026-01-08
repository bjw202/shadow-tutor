---
id: SPEC-PLAYBACK-001-FIX
type: implementation-plan
version: "1.1.0"
created: "2026-01-08"
updated: "2026-01-08"
tags:
  - SPEC-PLAYBACK-001-FIX
  - bug-fix
  - ui-enhancement
  - audio
  - playback-speed
---

# SPEC-PLAYBACK-001-FIX 구현 계획

## 1. 마일스톤

### Priority High: 핵심 버그 수정

#### Milestone 1.1: 클라이언트 훅 수정 (핵심)

**목표:** TTS 생성 요청 시 speed 파라미터 제거

**작업 항목:**
1. `/src/lib/hooks/use-audio-player.ts` 수정
   - Line 148: `generateSpeech` 호출 시 `speed: playbackSpeed` 제거
   - Lines 115, 156: `audio.playbackRate = playbackSpeed` 유지 (클라이언트 측 속도 조절)

**예상 변경 파일:**
- `src/lib/hooks/use-audio-player.ts`

#### Milestone 1.2: TTS API 속도 파라미터 수정 (선택적)

**목표:** 서버 측에서 항상 1.0x 속도로 오디오 생성

**작업 항목:**
1. `/src/app/api/tts/route.ts` 수정 (선택적)
   - OpenAI API 호출 시 `speed: 1.0` 고정
   - 요청 파라미터의 `speed` 값 무시 (하위 호환성 유지)

**예상 변경 파일:**
- `src/app/api/tts/route.ts` (선택적)

### Priority Medium: UI Enhancement

#### Milestone 2.1: 프리셋 버튼 변경

**목표:** 사용자 친화적인 속도 프리셋 값 제공

**작업 항목:**
1. `/src/components/practice/playback-speed.tsx` 수정
   - Line 14: `SPEED_PRESETS` 배열 변경
   - 변경 전: `[0.5, 0.75, 1.0, 1.25, 1.5, 2.0]`
   - 변경 후: `[0.5, 0.8, 1.0, 1.2, 1.5, 2.0]`

**예상 변경 파일:**
- `src/components/practice/playback-speed.tsx`

### Priority Medium: 테스트 및 검증

#### Milestone 3.1: 단위 테스트 수정

**목표:** 변경된 동작에 맞게 테스트 케이스 업데이트

**작업 항목:**
1. useAudioPlayer 훅 테스트 수정
   - generateSpeech 호출 시 speed 파라미터 미포함 검증
   - playbackRate만으로 속도 조절 검증

2. PlaybackSpeed 컴포넌트 테스트 수정 (해당 시)
   - 새 프리셋 값 렌더링 검증

**예상 변경 파일:**
- `src/lib/hooks/__tests__/use-audio-player.test.ts`
- `src/components/practice/__tests__/playback-speed.test.tsx` (해당 시)

#### Milestone 3.2: 통합 테스트

**목표:** 전체 재생 흐름에서 속도가 올바르게 적용되는지 검증

**작업 항목:**
1. E2E 테스트 시나리오 추가
   - 1.0x, 1.5x, 2.0x 속도에서 실제 재생 속도 검증
   - 재생 중 속도 변경 시 즉시 반영 확인
   - 새 프리셋 버튼 클릭 동작 검증

### Priority Low: 문서화

#### Milestone 4.1: SPEC 문서 동기화

**목표:** 관련 SPEC 문서에 변경 사항 반영

**작업 항목:**
1. SPEC-TTS-001 업데이트
   - speed 파라미터 동작 변경 문서화
2. SPEC-SETTINGS-001 업데이트
   - 프리셋 버튼 값 변경 문서화

---

## 2. 기술적 접근 방식

### 2.1 아키텍처 변경

```
[기존 흐름]
사용자 설정 (1.5x)
    ↓
generateSpeech({ speed: 1.5 })
    ↓
TTS API (speed: 1.5로 생성) → 1.5배 빠른 오디오
    ↓
playbackRate = 1.5 적용 → 2.25배 빠른 재생
```

```
[수정 후 흐름]
사용자 설정 (1.5x)
    ↓
generateSpeech({ }) // speed 파라미터 없음
    ↓
TTS API (speed: 1.0으로 생성) → 원본 속도 오디오
    ↓
playbackRate = 1.5 적용 → 1.5배 빠른 재생 (의도대로)
```

### 2.2 코드 변경 상세

#### 파일 1: `/src/app/api/tts/route.ts`

```typescript
// 변경 전 (Line 67-72)
const response = await openai.audio.speech.create({
  model: "tts-1",
  voice: voice,
  input: text,
  speed,  // 사용자 설정 속도 사용
  response_format: "mp3",
});

// 변경 후
const response = await openai.audio.speech.create({
  model: "tts-1",
  voice: voice,
  input: text,
  speed: 1.0,  // 항상 원본 속도로 생성
  response_format: "mp3",
});
```

#### 파일 2: `/src/lib/hooks/use-audio-player.ts`

```typescript
// 변경 전 (Line 145-149)
const response = await generateSpeech({
  text: segment.text,
  voice: selectedVoice,
  speed: playbackSpeed,  // 제거 필요
});

// 변경 후
const response = await generateSpeech({
  text: segment.text,
  voice: selectedVoice,
  // speed 파라미터 제거 - 클라이언트 측 playbackRate만 사용
});
```

#### 파일 3: `/src/components/practice/playback-speed.tsx`

```typescript
// 변경 전 (Line 14)
const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// 변경 후
const SPEED_PRESETS = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];
```

### 2.3 캐싱 이점

| 시나리오 | 기존 동작 | 수정 후 동작 |
|----------|----------|-------------|
| 1.0x로 재생 → 1.5x로 변경 | 새 TTS 생성 필요 | 캐시 재사용 |
| 1.5x로 재생 → 2.0x로 변경 | 새 TTS 생성 필요 | 캐시 재사용 |
| 동일 세그먼트 반복 재생 | 속도별 캐시 필요 | 단일 캐시 사용 |

**비용 절감 효과:** 속도 변경 시 API 호출 0건

---

## 3. TDD 접근 방식

### 3.1 RED 단계 (실패하는 테스트 작성)

```typescript
// TTS API Route 테스트
describe("POST /api/tts", () => {
  it("should always generate audio at 1.0x speed regardless of speed parameter", async () => {
    const mockCreate = vi.spyOn(openai.audio.speech, "create");

    await POST({ body: { text: "test", voice: "nova", speed: 1.5 } });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ speed: 1.0 })  // 항상 1.0
    );
  });
});

// useAudioPlayer 훅 테스트
describe("useAudioPlayer", () => {
  it("should not pass speed parameter to generateSpeech", async () => {
    const mockGenerateSpeech = vi.spyOn(tts, "generateSpeech");

    // ... 훅 실행 및 재생 트리거

    expect(mockGenerateSpeech).toHaveBeenCalledWith(
      expect.not.objectContaining({ speed: expect.any(Number) })
    );
  });

  it("should apply speed only via playbackRate", async () => {
    // 1.5x 속도 설정
    // 실제 audio.playbackRate가 1.5인지 확인
    // TTS API에는 speed가 전달되지 않았는지 확인
  });
});
```

### 3.2 GREEN 단계 (테스트 통과 코드 작성)

위 Milestone 1.1, 1.2의 코드 변경 적용

### 3.3 REFACTOR 단계

- 불필요한 speed 파라미터 관련 코드 정리
- TTSRequest 인터페이스 단순화 검토

---

## 4. 검증 체크리스트

### 4.1 버그 수정 검증

- [ ] 1.0x 속도 설정 시 실제 재생 속도 1.0x 확인
- [ ] 1.1x 속도 설정 시 실제 재생 속도 1.1x 확인 (이전: ~1.21x)
- [ ] 1.5x 속도 설정 시 실제 재생 속도 1.5x 확인 (이전: ~2.25x)
- [ ] 2.0x 속도 설정 시 실제 재생 속도 2.0x 확인 (이전: ~4.0x)
- [ ] 0.5x 속도 설정 시 실제 재생 속도 0.5x 확인 (이전: ~0.25x)
- [ ] 재생 중 속도 변경 시 즉시 반영 확인
- [ ] 속도 변경 시 API 재호출 없음 확인

### 4.2 UI Enhancement 검증

- [ ] 프리셋 버튼 6개 렌더링 확인 (0.5, 0.8, 1, 1.2, 1.5, 2)
- [ ] 각 프리셋 버튼 클릭 시 해당 속도 적용 확인
- [ ] 슬라이더 범위 유지 (0.5~2.0, step 0.05)
- [ ] 슬라이더로 세밀한 속도 조절 가능 확인

### 4.3 회귀 테스트

- [ ] 재생/일시정지/정지 기능 정상 동작
- [ ] 세그먼트 이동 (이전/다음) 정상 동작
- [ ] 음성 변경 시 새 TTS 생성 정상 동작
- [ ] 볼륨 조절 정상 동작

### 4.4 성능 검증

- [ ] 속도 변경 반응 시간 < 50ms
- [ ] 메모리 사용량 증가 없음
- [ ] API 호출 횟수 감소 확인

---

## 5. 예상 소요 리소스

### 5.1 파일 변경 규모

| 파일 | 변경 라인 수 | 복잡도 |
|------|------------|--------|
| src/lib/hooks/use-audio-player.ts | ~1줄 | 낮음 |
| src/components/practice/playback-speed.tsx | ~1줄 | 낮음 |
| src/app/api/tts/route.ts (선택적) | ~1줄 | 낮음 |
| 테스트 파일들 | ~30줄 | 중간 |

**총 예상 변경:** 약 30-40줄

### 5.2 테스트 범위

- 단위 테스트: 2-3개 신규/수정
- 통합 테스트: 2-3개 신규/수정

---

## 6. 롤백 계획

### 6.1 즉시 롤백

문제 발생 시 Git revert로 이전 커밋으로 복귀:
```bash
git revert HEAD~n  # n = 변경 커밋 수
```

### 6.2 수동 롤백

1. `/src/lib/hooks/use-audio-player.ts`: `generateSpeech` 호출에 `speed: playbackSpeed` 추가
2. `/src/components/practice/playback-speed.tsx`: `SPEED_PRESETS` 원래 값으로 복원
3. `/src/app/api/tts/route.ts` (변경한 경우): `speed: 1.0` → `speed` 변수로 복원
4. 테스트 파일 복원

---

## 7. 참고 사항

### 7.1 호환성

- 이 변경은 기존 캐시된 오디오와 호환됩니다 (세션 캐시이므로 무효화 불필요)
- API 인터페이스 변경 최소화 (하위 호환성 유지)

### 7.2 추가 고려사항

- 향후 TTS 모델 변경 (tts-1-hd 등) 시에도 동일한 패턴 적용
- 서버 측 속도 조절이 필요한 경우 별도 SPEC으로 기능 추가 검토
