import { describe, it, expect } from "vitest";
import {
  VOICES,
  DEFAULT_VOICE,
  DEFAULT_SPEED,
  MIN_SPEED,
  MAX_SPEED,
  DEFAULT_VOLUME,
  MAX_TEXT_LENGTH,
} from "@/lib/constants/voices";
import type { VoiceInfo } from "@/lib/constants/voices";
import type { VoiceOption } from "@/types/audio";

describe("Voice Constants", () => {
  describe("VOICES", () => {
    it("should contain all six OpenAI TTS voices", () => {
      expect(VOICES).toHaveLength(6);
    });

    it("should have alloy voice with correct info", () => {
      const alloy = VOICES.find((v) => v.id === "alloy");
      expect(alloy).toBeDefined();
      expect(alloy?.name).toBe("Alloy");
      expect(alloy?.description).toBe("Neutral, balanced");
    });

    it("should have echo voice with correct info", () => {
      const echo = VOICES.find((v) => v.id === "echo");
      expect(echo).toBeDefined();
      expect(echo?.name).toBe("Echo");
      expect(echo?.description).toBe("Warm, conversational");
    });

    it("should have fable voice with correct info", () => {
      const fable = VOICES.find((v) => v.id === "fable");
      expect(fable).toBeDefined();
      expect(fable?.name).toBe("Fable");
      expect(fable?.description).toBe("Expressive, narrative");
    });

    it("should have onyx voice with correct info", () => {
      const onyx = VOICES.find((v) => v.id === "onyx");
      expect(onyx).toBeDefined();
      expect(onyx?.name).toBe("Onyx");
      expect(onyx?.description).toBe("Deep, authoritative");
    });

    it("should have nova voice with correct info", () => {
      const nova = VOICES.find((v) => v.id === "nova");
      expect(nova).toBeDefined();
      expect(nova?.name).toBe("Nova");
      expect(nova?.description).toBe("Friendly, upbeat");
    });

    it("should have shimmer voice with correct info", () => {
      const shimmer = VOICES.find((v) => v.id === "shimmer");
      expect(shimmer).toBeDefined();
      expect(shimmer?.name).toBe("Shimmer");
      expect(shimmer?.description).toBe("Clear, professional");
    });

    it("should have unique voice IDs", () => {
      const ids = VOICES.map((v) => v.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have VoiceInfo structure for all voices", () => {
      VOICES.forEach((voice: VoiceInfo) => {
        expect(voice).toHaveProperty("id");
        expect(voice).toHaveProperty("name");
        expect(voice).toHaveProperty("description");
        expect(typeof voice.id).toBe("string");
        expect(typeof voice.name).toBe("string");
        expect(typeof voice.description).toBe("string");
      });
    });
  });

  describe("DEFAULT_VOICE", () => {
    it("should be nova", () => {
      expect(DEFAULT_VOICE).toBe("nova");
    });

    it("should be a valid VoiceOption", () => {
      const validVoices: VoiceOption[] = [
        "alloy",
        "echo",
        "fable",
        "onyx",
        "nova",
        "shimmer",
      ];
      expect(validVoices).toContain(DEFAULT_VOICE);
    });

    it("should exist in VOICES array", () => {
      const defaultVoiceInfo = VOICES.find((v) => v.id === DEFAULT_VOICE);
      expect(defaultVoiceInfo).toBeDefined();
    });
  });

  describe("Speed Constants", () => {
    it("should have DEFAULT_SPEED of 1.0", () => {
      expect(DEFAULT_SPEED).toBe(1.0);
    });

    it("should have MIN_SPEED of 0.5", () => {
      expect(MIN_SPEED).toBe(0.5);
    });

    it("should have MAX_SPEED of 2.0", () => {
      expect(MAX_SPEED).toBe(2.0);
    });

    it("should have DEFAULT_SPEED within valid range", () => {
      expect(DEFAULT_SPEED).toBeGreaterThanOrEqual(MIN_SPEED);
      expect(DEFAULT_SPEED).toBeLessThanOrEqual(MAX_SPEED);
    });

    it("should have MIN_SPEED less than MAX_SPEED", () => {
      expect(MIN_SPEED).toBeLessThan(MAX_SPEED);
    });
  });

  describe("Volume Constants", () => {
    it("should have DEFAULT_VOLUME of 1.0", () => {
      expect(DEFAULT_VOLUME).toBe(1.0);
    });

    it("should have DEFAULT_VOLUME within valid range (0.0 to 1.0)", () => {
      expect(DEFAULT_VOLUME).toBeGreaterThanOrEqual(0.0);
      expect(DEFAULT_VOLUME).toBeLessThanOrEqual(1.0);
    });
  });

  describe("Text Length Constants", () => {
    it("should have MAX_TEXT_LENGTH of 1000", () => {
      expect(MAX_TEXT_LENGTH).toBe(1000);
    });

    it("should have positive MAX_TEXT_LENGTH", () => {
      expect(MAX_TEXT_LENGTH).toBeGreaterThan(0);
    });
  });
});
