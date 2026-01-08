import { describe, it, expect } from "vitest";
import type {
  PlaybackState,
  VoiceOption,
  TTSRequest,
  TTSResponse,
  TTSErrorResponse,
  TTSErrorCode,
} from "@/types/audio";

describe("Audio Types", () => {
  describe("PlaybackState", () => {
    it("should allow valid playback states", () => {
      const states: PlaybackState[] = [
        "idle",
        "loading",
        "playing",
        "paused",
        "stopped",
      ];
      expect(states).toHaveLength(5);
      expect(states).toContain("idle");
      expect(states).toContain("loading");
      expect(states).toContain("playing");
      expect(states).toContain("paused");
      expect(states).toContain("stopped");
    }); 
  });

  describe("VoiceOption", () => {
    it("should allow valid OpenAI TTS voice options", () => {
      const voices: VoiceOption[] = [
        "alloy",
        "echo",
        "fable",
        "onyx",
        "nova",
        "shimmer",
      ];
      expect(voices).toHaveLength(6);
      expect(voices).toContain("alloy");
      expect(voices).toContain("echo");
      expect(voices).toContain("fable");
      expect(voices).toContain("onyx");
      expect(voices).toContain("nova");
      expect(voices).toContain("shimmer");
    });
  });

  describe("TTSRequest", () => {
    it("should create valid TTS request with required fields", () => {
      const request: TTSRequest = {
        text: "Hello world",
        voice: "nova",
      };
      expect(request.text).toBe("Hello world");
      expect(request.voice).toBe("nova");
      expect(request.speed).toBeUndefined();
    });

    it("should create valid TTS request with optional speed", () => {
      const request: TTSRequest = {
        text: "Hello world",
        voice: "alloy",
        speed: 1.5,
      };
      expect(request.text).toBe("Hello world");
      expect(request.voice).toBe("alloy");
      expect(request.speed).toBe(1.5);
    });
  });

  describe("TTSResponse", () => {
    it("should create valid TTS response with required fields", () => {
      const response: TTSResponse = {
        audioData: "base64encodeddata",
        contentType: "audio/mpeg",
      };
      expect(response.audioData).toBe("base64encodeddata");
      expect(response.contentType).toBe("audio/mpeg");
      expect(response.duration).toBeUndefined();
    });

    it("should create valid TTS response with optional duration", () => {
      const response: TTSResponse = {
        audioData: "base64encodeddata",
        contentType: "audio/mpeg",
        duration: 2.5,
      };
      expect(response.audioData).toBe("base64encodeddata");
      expect(response.contentType).toBe("audio/mpeg");
      expect(response.duration).toBe(2.5);
    });
  });

  describe("TTSErrorResponse", () => {
    it("should create valid error response with INVALID_INPUT code", () => {
      const error: TTSErrorResponse = {
        error: "Text is empty",
        code: "INVALID_INPUT",
      };
      expect(error.error).toBe("Text is empty");
      expect(error.code).toBe("INVALID_INPUT");
    });

    it("should create valid error response with TEXT_TOO_LONG code", () => {
      const error: TTSErrorResponse = {
        error: "Text exceeds maximum length",
        code: "TEXT_TOO_LONG",
      };
      expect(error.error).toBe("Text exceeds maximum length");
      expect(error.code).toBe("TEXT_TOO_LONG");
    });

    it("should create valid error response with API_ERROR code", () => {
      const error: TTSErrorResponse = {
        error: "OpenAI API error",
        code: "API_ERROR",
      };
      expect(error.error).toBe("OpenAI API error");
      expect(error.code).toBe("API_ERROR");
    });

    it("should create valid error response with RATE_LIMITED code", () => {
      const error: TTSErrorResponse = {
        error: "Rate limit exceeded",
        code: "RATE_LIMITED",
      };
      expect(error.error).toBe("Rate limit exceeded");
      expect(error.code).toBe("RATE_LIMITED");
    });
  });

  describe("TTSErrorCode", () => {
    it("should allow valid error codes", () => {
      const codes: TTSErrorCode[] = [
        "INVALID_INPUT",
        "TEXT_TOO_LONG",
        "API_ERROR",
        "RATE_LIMITED",
      ];
      expect(codes).toHaveLength(4);
      expect(codes).toContain("INVALID_INPUT");
      expect(codes).toContain("TEXT_TOO_LONG");
      expect(codes).toContain("API_ERROR");
      expect(codes).toContain("RATE_LIMITED");
    });
  });
});
