import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock OpenAI module with hoisted mock
vi.mock("openai", () => {
  const mockSpeechCreateFn = vi.fn();
  return {
    default: class MockOpenAI {
      audio = {
        speech: {
          create: mockSpeechCreateFn,
        },
      };
      static APIError = class APIError extends Error {
        status: number;
        constructor(message: string, status: number) {
          super(message);
          this.status = status;
        }
      };
    },
  };
});

// We need to get reference to the mocked function after import
let POST: typeof import("@/app/api/tts/route").POST;
let openaiMock: { audio: { speech: { create: ReturnType<typeof vi.fn> } } };

describe("TTS API Route - SPEC-PLAYBACK-001-FIX", () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Dynamic import to get fresh module with mocks
    const routeModule = await import("@/app/api/tts/route");
    POST = routeModule.POST;

    // Get the OpenAI mock instance
    const OpenAI = (await import("openai")).default;
    openaiMock = new (OpenAI as unknown as new () => typeof openaiMock)();

    // Default mock response
    openaiMock.audio.speech.create.mockResolvedValue({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("UR-001: TTS API speed parameter must always be 1.0", () => {
    it("should call OpenAI API with speed=1.0 when user requests speed=1.5", async () => {
      const request = new NextRequest("http://localhost:3000/api/tts", {
        method: "POST",
        body: JSON.stringify({
          text: "Hello world",
          voice: "nova",
          speed: 1.5, // User requests 1.5x speed
        }),
      });

      await POST(request);

      expect(openaiMock.audio.speech.create).toHaveBeenCalledWith(
        expect.objectContaining({
          speed: 1.0, // Should always be 1.0
        })
      );
    });

    it("should call OpenAI API with speed=1.0 when user requests speed=0.5", async () => {
      const request = new NextRequest("http://localhost:3000/api/tts", {
        method: "POST",
        body: JSON.stringify({
          text: "Hello world",
          voice: "nova",
          speed: 0.5, // User requests 0.5x speed
        }),
      });

      await POST(request);

      expect(openaiMock.audio.speech.create).toHaveBeenCalledWith(
        expect.objectContaining({
          speed: 1.0, // Should always be 1.0
        })
      );
    });

    it("should call OpenAI API with speed=1.0 when user requests speed=2.0", async () => {
      const request = new NextRequest("http://localhost:3000/api/tts", {
        method: "POST",
        body: JSON.stringify({
          text: "Hello world",
          voice: "nova",
          speed: 2.0, // User requests 2.0x speed
        }),
      });

      await POST(request);

      expect(openaiMock.audio.speech.create).toHaveBeenCalledWith(
        expect.objectContaining({
          speed: 1.0, // Should always be 1.0
        })
      );
    });

    it("should call OpenAI API with speed=1.0 when no speed is provided", async () => {
      const request = new NextRequest("http://localhost:3000/api/tts", {
        method: "POST",
        body: JSON.stringify({
          text: "Hello world",
          voice: "nova",
          // No speed provided
        }),
      });

      await POST(request);

      expect(openaiMock.audio.speech.create).toHaveBeenCalledWith(
        expect.objectContaining({
          speed: 1.0, // Should always be 1.0
        })
      );
    });
  });

  describe("ED-003: TTS API call must have speed=1.0", () => {
    it("should ignore any speed value and always use 1.0", async () => {
      const testSpeeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];

      for (const userSpeed of testSpeeds) {
        vi.clearAllMocks();
        openaiMock.audio.speech.create.mockResolvedValue({
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        });

        const request = new NextRequest("http://localhost:3000/api/tts", {
          method: "POST",
          body: JSON.stringify({
            text: "Test",
            voice: "nova",
            speed: userSpeed,
          }),
        });

        await POST(request);

        expect(openaiMock.audio.speech.create).toHaveBeenCalledWith(
          expect.objectContaining({
            speed: 1.0,
          })
        );
      }
    });
  });

  describe("UB-002: System must not pass user speed to TTS API", () => {
    it("should not use user-provided speed value in API call", async () => {
      const request = new NextRequest("http://localhost:3000/api/tts", {
        method: "POST",
        body: JSON.stringify({
          text: "Hello world",
          voice: "nova",
          speed: 1.75, // User provides custom speed
        }),
      });

      await POST(request);

      // Verify the speed parameter is 1.0, not 1.75
      expect(openaiMock.audio.speech.create).toHaveBeenCalledTimes(1);
      const callArgs = openaiMock.audio.speech.create.mock.calls[0][0];
      expect(callArgs.speed).toBe(1.0);
      expect(callArgs.speed).not.toBe(1.75);
    });
  });
});
