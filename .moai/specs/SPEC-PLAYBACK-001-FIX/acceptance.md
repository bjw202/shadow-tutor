---
id: SPEC-PLAYBACK-001-FIX
type: acceptance-criteria
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

# SPEC-PLAYBACK-001-FIX 인수 조건

## 1. 버그 수정 테스트 시나리오

### 시나리오 1: 기본 재생 속도 검증 (1.0x)

```gherkin
Feature: 기본 재생 속도에서 정상 동작
  사용자가 기본 재생 속도(1.0x)로 오디오를 재생할 때
  실제 재생 속도가 정확히 1.0배여야 한다

  Scenario: 기본 속도로 세그먼트 재생
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "1.0x"로 설정되어 있다
    And 텍스트 세그먼트가 로드되어 있다
    When 사용자가 재생 버튼을 클릭한다
    Then TTS API가 speed=1.0으로 호출되어야 한다
    And HTMLAudioElement의 playbackRate가 1.0이어야 한다
    And 오디오가 원본 속도로 재생되어야 한다
```

### 시나리오 2: 빠른 재생 속도 검증 (1.5x)

```gherkin
Feature: 빠른 재생 속도에서 이중 적용 버그 수정
  사용자가 1.5배 속도로 오디오를 재생할 때
  실제 재생 속도가 정확히 1.5배여야 한다 (2.25배가 아님)

  Scenario: 1.5배 속도로 세그먼트 재생
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "1.5x"로 설정되어 있다
    And 텍스트 세그먼트가 로드되어 있다
    When 사용자가 재생 버튼을 클릭한다
    Then TTS API가 speed=1.0으로 호출되어야 한다 (1.5가 아님)
    And HTMLAudioElement의 playbackRate가 1.5여야 한다
    And 오디오가 정확히 1.5배 속도로 재생되어야 한다 (2.25배가 아님)
```

### 시나리오 3: 느린 재생 속도 검증 (0.75x)

```gherkin
Feature: 느린 재생 속도에서 정상 동작
  사용자가 0.75배 속도로 오디오를 재생할 때
  실제 재생 속도가 정확히 0.75배여야 한다

  Scenario: 0.75배 속도로 세그먼트 재생
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "0.75x"로 설정되어 있다
    And 텍스트 세그먼트가 로드되어 있다
    When 사용자가 재생 버튼을 클릭한다
    Then TTS API가 speed=1.0으로 호출되어야 한다
    And HTMLAudioElement의 playbackRate가 0.75여야 한다
    And 오디오가 정확히 0.75배 속도로 재생되어야 한다
```

### 시나리오 4: 재생 중 속도 변경

```gherkin
Feature: 재생 중 속도 변경 시 즉시 반영
  사용자가 오디오 재생 중에 속도를 변경할 때
  새 TTS를 생성하지 않고 즉시 속도가 변경되어야 한다

  Scenario: 재생 중 1.0x에서 1.5x로 속도 변경
    Given 사용자가 세그먼트를 1.0x 속도로 재생 중이다
    When 사용자가 재생 속도를 "1.5x"로 변경한다
    Then TTS API가 다시 호출되지 않아야 한다
    And HTMLAudioElement의 playbackRate가 1.5로 변경되어야 한다
    And 오디오가 즉시 1.5배 속도로 재생되어야 한다
    And 속도 변경이 50ms 이내에 반영되어야 한다
```

### 시나리오 5: 캐시된 오디오 재사용

```gherkin
Feature: 속도 변경 시 캐시 재사용
  동일한 세그먼트를 다른 속도로 재생할 때
  캐시된 오디오를 재사용해야 한다

  Scenario: 같은 세그먼트를 다른 속도로 재생
    Given 사용자가 세그먼트를 1.0x 속도로 재생 완료했다
    And 해당 세그먼트의 오디오가 캐시되어 있다
    When 사용자가 재생 속도를 "2.0x"로 변경한다
    And 동일한 세그먼트를 다시 재생한다
    Then TTS API가 호출되지 않아야 한다
    And 캐시된 오디오가 사용되어야 한다
    And HTMLAudioElement의 playbackRate가 2.0이어야 한다
```

### 시나리오 6: 최대 속도 검증 (2.0x)

```gherkin
Feature: 최대 재생 속도에서 정상 동작
  사용자가 최대 속도(2.0x)로 오디오를 재생할 때
  실제 재생 속도가 정확히 2.0배여야 한다 (4.0배가 아님)

  Scenario: 2.0배 속도로 세그먼트 재생
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "2.0x"로 설정되어 있다
    When 사용자가 재생 버튼을 클릭한다
    Then TTS API가 speed=1.0으로 호출되어야 한다
    And HTMLAudioElement의 playbackRate가 2.0이어야 한다
    And 오디오가 정확히 2.0배 속도로 재생되어야 한다 (4.0배가 아님)
```

---

## 2. UI Enhancement 테스트 시나리오

### 시나리오 7: 프리셋 버튼 변경 검증

```gherkin
Feature: 새로운 프리셋 버튼 값 적용
  사용자가 속도 프리셋 버튼을 사용할 때
  새로운 프리셋 값 [0.5, 0.8, 1, 1.2, 1.5, 2]가 표시되어야 한다

  Scenario: 프리셋 버튼 렌더링 확인
    Given 사용자가 연습 페이지에 있다
    When 사용자가 속도 설정 섹션을 본다
    Then 6개의 프리셋 버튼이 표시되어야 한다
    And 버튼 레이블이 "0.5x", "0.8x", "1x", "1.2x", "1.5x", "2x"이어야 한다
```

### 시나리오 8: 새 프리셋 값 적용 검증 (0.8x)

```gherkin
Feature: 0.8x 프리셋 버튼 동작
  사용자가 0.8x 프리셋 버튼을 클릭할 때
  재생 속도가 0.8배로 설정되어야 한다

  Scenario: 0.8x 프리셋 버튼 클릭
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "1.0x"로 설정되어 있다
    When 사용자가 "0.8x" 프리셋 버튼을 클릭한다
    Then 재생 속도가 0.8로 설정되어야 한다
    And 속도 표시가 "0.80x"로 변경되어야 한다
    And "0.8x" 버튼이 활성화 상태로 표시되어야 한다
```

### 시나리오 9: 새 프리셋 값 적용 검증 (1.2x)

```gherkin
Feature: 1.2x 프리셋 버튼 동작
  사용자가 1.2x 프리셋 버튼을 클릭할 때
  재생 속도가 1.2배로 설정되어야 한다

  Scenario: 1.2x 프리셋 버튼 클릭
    Given 사용자가 연습 페이지에 있다
    And 재생 속도가 "1.0x"로 설정되어 있다
    When 사용자가 "1.2x" 프리셋 버튼을 클릭한다
    Then 재생 속도가 1.2로 설정되어야 한다
    And 속도 표시가 "1.20x"로 변경되어야 한다
    And "1.2x" 버튼이 활성화 상태로 표시되어야 한다
```

### 시나리오 10: 슬라이더 기능 유지 검증

```gherkin
Feature: 슬라이더 세밀 조절 기능 유지
  사용자가 슬라이더로 세밀한 속도 조절을 할 때
  기존 범위(0.5~2.0, step 0.05)가 유지되어야 한다

  Scenario: 슬라이더로 1.35x 속도 설정
    Given 사용자가 연습 페이지에 있다
    When 사용자가 슬라이더를 드래그하여 1.35로 설정한다
    Then 재생 속도가 1.35로 설정되어야 한다
    And 속도 표시가 "1.35x"로 변경되어야 한다
    And 어떤 프리셋 버튼도 활성화 상태가 아니어야 한다
```

---

## 3. 품질 게이트 기준

### 3.1 코드 품질

| 기준 | 목표값 | 검증 방법 |
|------|--------|----------|
| 테스트 커버리지 | >= 85% | Vitest coverage |
| TypeScript 타입 오류 | 0 | `npm run type-check` |
| ESLint 오류 | 0 | `npm run lint` |
| 빌드 성공 | Pass | `npm run build` |

### 3.2 성능 기준

| 기준 | 목표값 | 검증 방법 |
|------|--------|----------|
| 속도 변경 반응 시간 | < 50ms | 브라우저 Performance API |
| 메모리 증가량 | 0% (변경 없음) | 브라우저 DevTools |
| API 호출 감소 | 속도 변경 시 0건 | Network 탭 모니터링 |

### 3.3 회귀 테스트

| 기능 | 테스트 항목 | 검증 방법 |
|------|------------|----------|
| 재생 컨트롤 | 재생/일시정지/정지 | E2E 테스트 |
| 세그먼트 이동 | 이전/다음 버튼 | E2E 테스트 |
| 음성 변경 | 다른 음성으로 변경 | E2E 테스트 |
| 볼륨 조절 | 볼륨 슬라이더 | E2E 테스트 |
| 프리셋 버튼 | 모든 프리셋 값 동작 | E2E 테스트 |

---

## 4. Definition of Done (완료 정의)

### 4.1 필수 항목

- [ ] 모든 EARS 요구사항 (UR, ED, SD, UB, OP) 충족
- [ ] 모든 Gherkin 시나리오 테스트 통과 (시나리오 1-10)
- [ ] 단위 테스트 커버리지 85% 이상
- [ ] TypeScript 타입 체크 통과
- [ ] ESLint 검사 통과
- [ ] 빌드 성공
- [ ] PR 코드 리뷰 완료 (해당되는 경우)

### 4.2 검증 체크리스트

#### 버그 수정 검증
- [ ] 1.0x 설정 -> 실제 1.0x 재생
- [ ] 1.1x 설정 -> 실제 1.1x 재생 (이전: ~1.21x)
- [ ] 1.5x 설정 -> 실제 1.5x 재생 (이전: ~2.25x)
- [ ] 2.0x 설정 -> 실제 2.0x 재생 (이전: ~4.0x)
- [ ] 0.5x 설정 -> 실제 0.5x 재생 (이전: ~0.25x)

#### UI Enhancement 검증
- [ ] 프리셋 버튼 6개 렌더링 (0.5, 0.8, 1, 1.2, 1.5, 2)
- [ ] 0.8x 프리셋 버튼 동작 확인
- [ ] 1.2x 프리셋 버튼 동작 확인
- [ ] 슬라이더 범위 유지 (0.5~2.0, step 0.05)

#### 기술 검증
- [ ] TTS API 호출 시 speed 파라미터 미전달 (또는 무시)
- [ ] 클라이언트 playbackRate가 사용자 설정과 일치
- [ ] 속도 변경 시 API 재호출 없음
- [ ] 캐시 히트 정상 동작

#### 회귀 검증
- [ ] 기존 재생 기능 정상 동작
- [ ] 세그먼트 이동 정상 동작
- [ ] 음성 변경 정상 동작
- [ ] 볼륨 조절 정상 동작
- [ ] 쉐도잉 모드 정상 동작 (해당 시)

---

## 5. 테스트 코드 예시

### 5.1 TTS API Route 테스트

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/tts/route";
import OpenAI from "openai";

vi.mock("openai");

describe("POST /api/tts - Speed Parameter Fix", () => {
  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (OpenAI as any).mockImplementation(() => ({
      audio: {
        speech: {
          create: mockCreate.mockResolvedValue({
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(100)),
          }),
        },
      },
    }));
  });

  it("should always call OpenAI with speed=1.0 regardless of request speed", async () => {
    const requestBody = {
      text: "Hello world",
      voice: "nova",
      speed: 1.5, // 사용자가 1.5x 요청
    };

    const request = new Request("http://localhost/api/tts", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    await POST(request);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        speed: 1.0, // 항상 1.0으로 호출되어야 함
      })
    );
  });

  it("should not pass user-requested speed to OpenAI API", async () => {
    const requestBody = {
      text: "Test text",
      voice: "alloy",
      speed: 2.0,
    };

    const request = new Request("http://localhost/api/tts", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    await POST(request);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.speed).toBe(1.0);
    expect(callArgs.speed).not.toBe(2.0);
  });
});
```

### 5.2 useAudioPlayer 훅 테스트

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";
import * as ttsModule from "@/lib/api/tts";

vi.mock("@/lib/api/tts");

describe("useAudioPlayer - Speed Fix", () => {
  const mockGenerateSpeech = vi.spyOn(ttsModule, "generateSpeech");

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateSpeech.mockResolvedValue({
      audioData: "base64audio",
      contentType: "audio/mpeg",
    });
  });

  it("should not include speed parameter in generateSpeech call", async () => {
    const { result } = renderHook(() => useAudioPlayer());

    // 세그먼트 설정 및 재생 트리거
    await act(async () => {
      await result.current.play();
    });

    // generateSpeech가 speed 없이 호출되었는지 확인
    expect(mockGenerateSpeech).toHaveBeenCalledWith(
      expect.not.objectContaining({
        speed: expect.any(Number),
      })
    );
  });

  it("should apply speed only via audio.playbackRate", async () => {
    // playbackRate가 올바르게 설정되는지 확인
    const mockAudio = {
      playbackRate: 1.0,
      play: vi.fn(),
      pause: vi.fn(),
    };

    // ... 테스트 구현
  });

  it("should reuse cache when speed changes", async () => {
    const { result } = renderHook(() => useAudioPlayer());

    // 첫 번째 재생
    await act(async () => {
      await result.current.play();
    });

    expect(mockGenerateSpeech).toHaveBeenCalledTimes(1);

    // 속도 변경
    act(() => {
      result.current.setPlaybackRate(1.5);
    });

    // 같은 세그먼트 재생
    await act(async () => {
      await result.current.play();
    });

    // API가 다시 호출되지 않아야 함
    expect(mockGenerateSpeech).toHaveBeenCalledTimes(1);
  });
});
```

### 5.3 PlaybackSpeed 컴포넌트 테스트

```typescript
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlaybackSpeed } from "@/components/practice/playback-speed";

describe("PlaybackSpeed - Preset Buttons", () => {
  it("should render all 6 preset buttons with new values", () => {
    render(<PlaybackSpeed value={1.0} onChange={() => {}} />);

    const expectedPresets = ["0.5", "0.8", "1", "1.2", "1.5", "2"];

    expectedPresets.forEach((preset) => {
      expect(screen.getByRole("button", { name: `${preset}x` })).toBeInTheDocument();
    });
  });

  it("should call onChange with 0.8 when 0.8x button is clicked", () => {
    const onChange = vi.fn();
    render(<PlaybackSpeed value={1.0} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "0.8x" }));

    expect(onChange).toHaveBeenCalledWith(0.8);
  });

  it("should call onChange with 1.2 when 1.2x button is clicked", () => {
    const onChange = vi.fn();
    render(<PlaybackSpeed value={1.0} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "1.2x" }));

    expect(onChange).toHaveBeenCalledWith(1.2);
  });

  it("should highlight active preset button", () => {
    render(<PlaybackSpeed value={0.8} onChange={() => {}} />);

    const button = screen.getByRole("button", { name: "0.8x" });
    // Check for active/default variant class
    expect(button).toHaveClass("bg-primary"); // or appropriate active class
  });
});
```

### 5.4 통합 테스트 (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Playback Speed Fix", () => {
  test("should play at exactly 1.5x when set to 1.5x", async ({ page }) => {
    await page.goto("/practice/test-session");

    // 속도를 1.5x로 설정
    await page.getByRole("slider", { name: /speed/i }).fill("1.5");

    // 재생 버튼 클릭
    await page.getByRole("button", { name: /play/i }).click();

    // playbackRate 확인
    const playbackRate = await page.evaluate(() => {
      const audio = document.querySelector("audio");
      return audio?.playbackRate;
    });

    expect(playbackRate).toBe(1.5);
  });

  test("should not make API call when changing speed during playback", async ({
    page,
  }) => {
    await page.goto("/practice/test-session");

    // 네트워크 요청 추적
    const ttsRequests: any[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/tts")) {
        ttsRequests.push(request);
      }
    });

    // 재생 시작
    await page.getByRole("button", { name: /play/i }).click();
    await page.waitForTimeout(500);

    const initialRequestCount = ttsRequests.length;

    // 속도 변경
    await page.getByRole("slider", { name: /speed/i }).fill("1.5");

    // 추가 API 호출이 없어야 함
    expect(ttsRequests.length).toBe(initialRequestCount);
  });
});
```

  test("should display new preset buttons", async ({ page }) => {
    await page.goto("/practice/test-session");

    // Verify new preset values
    await expect(page.getByRole("button", { name: "0.8x" })).toBeVisible();
    await expect(page.getByRole("button", { name: "1.2x" })).toBeVisible();

    // Old values should not exist
    await expect(page.getByRole("button", { name: "0.75x" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "1.25x" })).not.toBeVisible();
  });
});
```

---

## 6. 수동 검증 절차

### 6.1 속도 버그 수정 검증 방법

1. 브라우저 개발자 도구 콘솔에서 실행:
```javascript
// 현재 재생 속도 확인
const audio = document.querySelector('audio') ||
  document.querySelectorAll('audio')[0];
console.log('Current playbackRate:', audio?.playbackRate);
```

2. 네트워크 탭에서 TTS API 요청 확인:
   - Request Payload에서 `speed` 파라미터가 없거나 무시되는지 확인
   - 속도 변경 시 새 API 요청이 발생하지 않는지 확인

### 6.2 프리셋 버튼 검증 방법

1. 연습 페이지에서 속도 설정 섹션 확인:
   - 6개의 버튼이 표시되는지 확인: 0.5x, 0.8x, 1x, 1.2x, 1.5x, 2x
   - 0.75x, 1.25x 버튼이 없는지 확인

2. 각 프리셋 버튼 클릭 시:
   - 해당 속도가 적용되는지 확인 (속도 표시 값 확인)
   - 클릭한 버튼이 활성화 상태로 표시되는지 확인

3. 슬라이더 동작 확인:
   - 슬라이더로 1.35x 등 프리셋에 없는 값 설정 가능한지 확인
   - 프리셋에 없는 값 설정 시 어떤 버튼도 활성화되지 않는지 확인

### 6.3 체감 속도 검증

| 설정 속도 | 예상 체감 | 실제 체감 (버그 수정 전) | 실제 체감 (버그 수정 후) |
|-----------|----------|------------------------|------------------------|
| 0.5x | 매우 느림 | 극도로 느림 (~0.25x) | 매우 느림 (0.5x) |
| 0.75x | 느림 | 상당히 느림 (~0.56x) | 느림 (0.75x) |
| 1.0x | 보통 | 보통 | 보통 |
| 1.1x | 약간 빠름 | 눈에 띄게 빠름 (~1.21x) | 약간 빠름 (1.1x) |
| 1.5x | 빠름 | 매우 빠름 (~2.25x) | 빠름 (1.5x) |
| 2.0x | 매우 빠름 | 극도로 빠름 (~4.0x) | 매우 빠름 (2.0x) |
