---
id: SPEC-PLAYBACK-001-FIX
version: "1.1.0"
status: "draft"
created: "2026-01-08"
updated: "2026-01-08"
author: "MoAI-ADK"
priority: "high"
lifecycle: "spec-first"
related_specs:
  - SPEC-TTS-001
  - SPEC-PLAYER-001
  - SPEC-SETTINGS-001
---

# SPEC-PLAYBACK-001-FIX: 오디오 재생 속도 버그 수정 및 프리셋 UI 개선

## HISTORY

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | 2026-01-08 | MoAI-ADK | 초기 SPEC 생성 |
| 1.1.0 | 2026-01-08 | MoAI-ADK | UI Enhancement 범위 추가 (프리셋 버튼 변경) |

---

## 1. 개요

Shadow Tutor 애플리케이션에서 사용자가 설정한 재생 속도가 의도한 것보다 과도하게 빠르거나 느리게 적용되는 버그를 수정하고, 재생 속도 프리셋 버튼 UI를 개선합니다.

### 1.1 문제 정의

**현상:**
- 사용자가 1.1x 속도를 설정하면 실제로는 약 1.21x (1.1 x 1.1)로 재생됨
- 사용자가 1.5x 속도를 설정하면 실제로는 약 2.25x (1.5 x 1.5)로 재생됨
- 배속 설정이 직관적이지 않고 예상보다 과도하게 빠름

**근본 원인:**
1. **서버 측 (TTS API)**: OpenAI TTS API의 `speed` 파라미터로 오디오 생성 시 속도가 적용됨
2. **클라이언트 측 (Audio Element)**: `HTMLAudioElement.playbackRate`로 동일한 속도가 다시 적용됨

**영향 파일:**
- `/src/lib/hooks/use-audio-player.ts` (Lines 115, 148, 156)
- `/src/app/api/tts/route.ts` (Line 31, 71)
- `/src/components/practice/playback-speed.tsx` (Line 14)

### 1.2 목적

- 재생 속도가 한 곳에서만 적용되도록 수정
- 사용자가 설정한 속도와 실제 재생 속도가 1:1로 일치하도록 보장
- 직관적인 배속 경험 제공
- 프리셋 버튼을 사용자 친화적인 값으로 개선

### 1.3 범위

**포함 (In Scope):**
- TTS API 호출 시 속도 파라미터 제거 (항상 1.0x로 생성)
- 클라이언트 측 playbackRate만 사용하여 속도 조절
- 프리셋 버튼 값 변경: [0.5, 0.75, 1, 1.25, 1.5] -> [0.5, 0.8, 1, 1.2, 1.5, 2]
- 관련 테스트 케이스 수정

**제외 (Out of Scope):**
- TTS 음성 품질 변경
- 슬라이더 범위/스텝 변경 (기존 0.5~2.0, step 0.05 유지)
- 오디오 캐싱 로직 변경 (이미 세그먼트 ID 기반)

---

## 2. 기술 분석

### 2.1 현재 동작 흐름

```
사용자 설정: 1.5x 속도
    ↓
TTS API 호출: speed=1.5로 오디오 생성 (이미 1.5배 빠른 오디오)
    ↓
클라이언트 재생: playbackRate=1.5 적용 (1.5 x 1.5 = 2.25배)
    ↓
실제 재생 속도: 2.25x (의도한 1.5x와 불일치)
```

### 2.2 수정 후 동작 흐름

```
사용자 설정: 1.5x 속도
    ↓
TTS API 호출: speed=1.0으로 오디오 생성 (원본 속도 오디오)
    ↓
클라이언트 재생: playbackRate=1.5 적용
    ↓
실제 재생 속도: 1.5x (의도와 일치)
```

### 2.3 설계 결정: 클라이언트 측 속도 조절 선택 이유

| 접근 방식 | 장점 | 단점 |
|-----------|------|------|
| **서버 측 (TTS API)** | 일관된 오디오 품질 | 속도별 캐시 필요, API 비용 증가 |
| **클라이언트 측 (playbackRate)** | 단일 캐시, 즉각적인 속도 변경, API 비용 절감 | 극단적 속도에서 품질 저하 가능 |

**결정: 클라이언트 측 playbackRate 사용**

**근거:**
1. **캐시 효율성**: 속도에 관계없이 동일한 오디오 캐시 재사용 가능
2. **API 비용 절감**: 속도 변경 시 재생성 불필요
3. **즉각적 반응**: 재생 중 속도 변경 시 즉시 적용
4. **지원 범위**: 0.5x ~ 2.0x 범위에서 품질 저하 없음

---

## 3. EARS 요구사항

### 3.1 Ubiquitous Requirements (항상 참인 요구사항)

| ID | 요구사항 |
|----|----------|
| UR-001 | 시스템은 **항상** TTS API 호출 시 speed 파라미터를 1.0으로 고정해야 한다 |
| UR-002 | 시스템은 **항상** 사용자가 설정한 재생 속도를 HTMLAudioElement.playbackRate로만 적용해야 한다 |
| UR-003 | 시스템은 **항상** 사용자가 설정한 속도와 실제 재생 속도가 1:1로 일치해야 한다 |
| UR-004 | 시스템은 **항상** 오디오 캐시를 속도에 관계없이 재사용할 수 있어야 한다 |

### 3.2 Event-Driven Requirements (이벤트 기반)

| ID | 요구사항 |
|----|----------|
| ED-001 | **WHEN** 사용자가 재생 속도를 변경할 때 **THEN** 현재 재생 중인 오디오의 playbackRate가 즉시 변경되어야 한다 |
| ED-002 | **WHEN** 새 세그먼트 재생이 시작될 때 **THEN** 현재 설정된 속도가 playbackRate에 적용되어야 한다 |
| ED-003 | **WHEN** TTS API가 호출될 때 **THEN** speed 파라미터는 1.0이어야 한다 |

### 3.3 State-Driven Requirements (상태 기반)

| ID | 요구사항 |
|----|----------|
| SD-001 | **IF** 재생 속도가 1.5x로 설정되어 있으면 **THEN** playbackRate는 1.5여야 한다 |
| SD-002 | **IF** 동일 세그먼트를 다른 속도로 재생할 때 **THEN** 캐시된 오디오를 재사용해야 한다 |

### 3.4 Unwanted Behavior Requirements (원치 않는 동작)

| ID | 요구사항 |
|----|----------|
| UB-001 | 시스템은 재생 속도를 **이중으로 적용하지 않아야 한다** |
| UB-002 | 시스템은 TTS API 호출 시 사용자 설정 속도를 **전달하지 않아야 한다** |
| UB-003 | 시스템은 속도 변경 시 오디오를 **재생성하지 않아야 한다** |

### 3.5 Optional Requirements (선택적 요구사항)

| ID | 요구사항 |
|----|----------|
| OP-001 | **가능하면** 프리셋 버튼은 사용자가 자주 사용하는 속도 값을 제공해야 한다 |
| OP-002 | **가능하면** 프리셋에 2.0x 속도 옵션을 포함하여 최대 속도 선택을 용이하게 해야 한다 |

---

## 4. UI Enhancement: 프리셋 버튼 변경

### 4.1 변경 내용

**현재 프리셋:**
```typescript
const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
```

**변경 후 프리셋:**
```typescript
const SPEED_PRESETS = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];
```

### 4.2 변경 이유

| 변경 전 | 변경 후 | 이유 |
|---------|---------|------|
| 0.75x | 0.8x | 더 직관적인 값, 20% 감속 |
| 1.25x | 1.2x | 더 직관적인 값, 20% 가속 |

### 4.3 슬라이더 유지

- 범위: 0.5x ~ 2.0x (변경 없음)
- 스텝: 0.05 (변경 없음)
- 사용자가 세밀한 속도 조절을 원할 경우 슬라이더 사용

---

## 5. 구현 계획

### 5.1 수정 대상 파일

#### 5.1.1 `/src/lib/hooks/use-audio-player.ts`

**변경 내용:**
- `loadAndPlaySegment` 함수에서 TTS API 호출 시 `speed` 파라미터 제거
- 캐시 키 생성 로직에서 속도 제외 확인

**변경 전 (Line 145-149):**
```typescript
const response = await generateSpeech({
  text: segment.text,
  voice: selectedVoice,
  speed: playbackSpeed,  // 제거 필요
});
```

**변경 후:**
```typescript
const response = await generateSpeech({
  text: segment.text,
  voice: selectedVoice,
  // speed 파라미터 제거 - 클라이언트 측 playbackRate만 사용
});
```

#### 4.1.2 `/src/lib/api/tts.ts`

**변경 내용:**
- `generateSpeech` 함수 인터페이스에서 `speed` 파라미터를 선택적으로 변경하거나 제거
- API 호출 시 speed를 전달하지 않도록 수정

#### 5.1.3 `/src/app/api/tts/route.ts` (선택적)

**변경 내용:**
- 기존 `speed` 파라미터 검증 로직 유지 (하위 호환성)
- 실제 OpenAI API 호출 시 speed를 항상 1.0으로 고정

**변경 전 (Line 67-72):**
```typescript
const response = await openai.audio.speech.create({
  model: "tts-1",
  voice: voice,
  input: text,
  speed,  // 사용자 설정 속도
  response_format: "mp3",
});
```

**변경 후:**
```typescript
const response = await openai.audio.speech.create({
  model: "tts-1",
  voice: voice,
  input: text,
  speed: 1.0,  // 항상 원본 속도로 생성
  response_format: "mp3",
});
```

#### 5.1.4 `/src/components/practice/playback-speed.tsx`

**변경 내용:**
- `SPEED_PRESETS` 배열 값 변경

**변경 전 (Line 14):**
```typescript
const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
```

**변경 후:**
```typescript
const SPEED_PRESETS = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];
```

### 5.2 캐싱 전략

**캐시 키:** 세그먼트 ID 기반 (변경 없음)

속도는 클라이언트 측 `playbackRate`로만 조절하므로, 동일 세그먼트는 속도와 관계없이 캐시 재사용 가능합니다.

**캐싱 이점:**
- 속도 변경 시 API 호출 불필요
- API 비용 절감
- 즉각적인 속도 전환

---

## 6. 의존성

### 6.1 내부 의존성

| SPEC ID | 의존성 유형 | 설명 |
|---------|------------|------|
| SPEC-TTS-001 | 수정 필요 | TTS API Route 속도 처리 로직 변경 |
| SPEC-PLAYER-001 | 영향 없음 | playbackRate 로직 이미 구현됨 |
| SPEC-SETTINGS-001 | UI 수정 | 프리셋 버튼 값 변경 |

### 6.2 외부 의존성

| 패키지 | 버전 | 영향 |
|--------|------|------|
| openai | 4.77.x | API 파라미터 변경 |
| next | 16.x | API Route 수정 |

---

## 7. 기술 스택

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 16.x | API Route |
| react | 19.x | 클라이언트 훅 |
| typescript | 5.7.x | 타입 안전성 |
| openai | 4.77.x | TTS API |
| vitest | 3.x | 단위 테스트 |

---

## 8. 위험 분석

### 8.1 위험 요소

| 위험 | 영향도 | 가능성 | 완화 전략 |
|------|--------|--------|----------|
| 캐시 무효화 필요 | 중간 | 낮음 | 세션 캐시이므로 자동 무효화됨 |
| 기존 테스트 실패 | 중간 | 높음 | 테스트 케이스 수정 계획에 포함 |
| 극단적 속도에서 품질 저하 | 낮음 | 낮음 | 0.5x ~ 2.0x 범위 제한으로 완화 |
| 프리셋 변경 혼란 | 낮음 | 낮음 | 기존 프리셋과 유사한 범위 유지 |

### 8.2 롤백 전략

문제 발생 시:
1. TTS API Route에서 `speed: 1.0` 대신 `speed` 파라미터 복원
2. 클라이언트에서 `playbackRate = 1.0` 고정
3. 프리셋 배열을 원래 값으로 복원
4. 원래 서버 측 속도 적용으로 복귀

---

## 9. 성능 요구사항

| 메트릭 | 목표값 | 측정 방법 |
|--------|--------|----------|
| 속도 변경 반응 시간 | < 50ms | playbackRate 변경 후 오디오 속도 변화 시간 |
| 캐시 히트율 | 100% (동일 세그먼트) | 속도 변경 시 API 호출 없음 확인 |
| API 호출 감소 | 속도 변경 시 0건 | 네트워크 모니터링 |

---

## 10. 참고 자료

- [MDN HTMLAudioElement.playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate)
- [OpenAI TTS API - Speed Parameter](https://platform.openai.com/docs/api-reference/audio/createSpeech)
- SPEC-TTS-001: TTS 오디오 재생
- SPEC-PLAYER-001: 플레이어 UI 개선 및 텍스트 하이라이트
