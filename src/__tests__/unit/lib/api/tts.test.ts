import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateSpeech, base64ToAudioUrl } from "@/lib/api/tts";
import type { TTSRequest, TTSResponse, TTSErrorResponse } from "@/types/audio";

describe("tts client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("generateSpeech", () => {
    it("should successfully generate speech", async () => {
      const mockResponse: TTSResponse = {
        audioData: "base64-encoded-audio-data",
        contentType: "audio/mpeg",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: TTSRequest = {
        text: "Hello world",
        voice: "nova",
        speed: 1.0,
      };

      const result = await generateSpeech(request);

      expect(fetch).toHaveBeenCalledWith("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should include duration in response when provided", async () => {
      const mockResponse: TTSResponse = {
        audioData: "base64-encoded-audio-data",
        contentType: "audio/mpeg",
        duration: 2.5,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: TTSRequest = {
        text: "Hello world",
        voice: "alloy",
      };

      const result = await generateSpeech(request);

      expect(result.duration).toBe(2.5);
    });

    it("should throw error on API failure", async () => {
      const errorResponse: TTSErrorResponse = {
        error: "Text is required",
        code: "INVALID_INPUT",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const request: TTSRequest = {
        text: "",
        voice: "nova",
      };

      await expect(generateSpeech(request)).rejects.toThrow("Text is required");
    });

    it("should throw error on rate limit", async () => {
      const errorResponse: TTSErrorResponse = {
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const request: TTSRequest = {
        text: "Hello",
        voice: "nova",
      };

      await expect(generateSpeech(request)).rejects.toThrow(
        "Rate limit exceeded"
      );
    });

    it("should throw error when text too long", async () => {
      const errorResponse: TTSErrorResponse = {
        error: "Text exceeds maximum length of 1000 characters",
        code: "TEXT_TOO_LONG",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const request: TTSRequest = {
        text: "a".repeat(1001),
        voice: "nova",
      };

      await expect(generateSpeech(request)).rejects.toThrow(
        "Text exceeds maximum length"
      );
    });

    it("should handle API error", async () => {
      const errorResponse: TTSErrorResponse = {
        error: "Failed to generate speech",
        code: "API_ERROR",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve(errorResponse),
      });

      const request: TTSRequest = {
        text: "Hello",
        voice: "nova",
      };

      await expect(generateSpeech(request)).rejects.toThrow(
        "Failed to generate speech"
      );
    });

    it("should send request with all voice options", async () => {
      const voices = [
        "alloy",
        "echo",
        "fable",
        "onyx",
        "nova",
        "shimmer",
      ] as const;

      for (const voice of voices) {
        const mockResponse: TTSResponse = {
          audioData: "audio-data",
          contentType: "audio/mpeg",
        };

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const request: TTSRequest = {
          text: "Test",
          voice,
        };

        await generateSpeech(request);

        expect(fetch).toHaveBeenCalledWith("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
      }
    });

    it("should send request with custom speed", async () => {
      const mockResponse: TTSResponse = {
        audioData: "audio-data",
        contentType: "audio/mpeg",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request: TTSRequest = {
        text: "Test",
        voice: "nova",
        speed: 1.5,
      };

      await generateSpeech(request);

      expect(fetch).toHaveBeenCalledWith("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
    });
  });

  describe("base64ToAudioUrl", () => {
    it("should create data URL with default content type", () => {
      const base64 = "SGVsbG8gV29ybGQ=";
      const result = base64ToAudioUrl(base64);

      expect(result).toBe("data:audio/mpeg;base64,SGVsbG8gV29ybGQ=");
    });

    it("should create data URL with custom content type", () => {
      const base64 = "SGVsbG8gV29ybGQ=";
      const result = base64ToAudioUrl(base64, "audio/wav");

      expect(result).toBe("data:audio/wav;base64,SGVsbG8gV29ybGQ=");
    });

    it("should handle empty base64 string", () => {
      const result = base64ToAudioUrl("");

      expect(result).toBe("data:audio/mpeg;base64,");
    });

    it("should handle various audio content types", () => {
      const base64 = "test";

      expect(base64ToAudioUrl(base64, "audio/ogg")).toBe(
        "data:audio/ogg;base64,test"
      );
      expect(base64ToAudioUrl(base64, "audio/webm")).toBe(
        "data:audio/webm;base64,test"
      );
      expect(base64ToAudioUrl(base64, "audio/mp4")).toBe(
        "data:audio/mp4;base64,test"
      );
    });
  });
});
