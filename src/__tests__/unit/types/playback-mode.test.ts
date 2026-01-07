import { describe, it, expect } from "vitest";
import type {
  PlaybackMode,
  ShadowingSettings,
} from "@/types/practice";
import {
  DEFAULT_SHADOWING_SETTINGS,
  isValidPauseDuration,
  isValidRepeatCount,
} from "@/lib/constants/shadowing";

describe("PlaybackMode type", () => {
  it("should accept 'continuous' as a valid mode", () => {
    const mode: PlaybackMode = "continuous";
    expect(mode).toBe("continuous");
  });

  it("should accept 'shadowing' as a valid mode", () => {
    const mode: PlaybackMode = "shadowing";
    expect(mode).toBe("shadowing");
  });
});

describe("ShadowingSettings interface", () => {
  it("should have pauseDuration as a number", () => {
    const settings: ShadowingSettings = {
      pauseDuration: 5,
      repeatCount: 1,
      autoAdvance: true,
    };
    expect(settings.pauseDuration).toBe(5);
  });

  it("should have repeatCount as a number", () => {
    const settings: ShadowingSettings = {
      pauseDuration: 5,
      repeatCount: 3,
      autoAdvance: true,
    };
    expect(settings.repeatCount).toBe(3);
  });

  it("should have autoAdvance as a boolean", () => {
    const settings: ShadowingSettings = {
      pauseDuration: 5,
      repeatCount: 1,
      autoAdvance: false,
    };
    expect(settings.autoAdvance).toBe(false);
  });

  it("should have valid default settings", () => {
    expect(DEFAULT_SHADOWING_SETTINGS.pauseDuration).toBe(5);
    expect(DEFAULT_SHADOWING_SETTINGS.repeatCount).toBe(1);
    expect(DEFAULT_SHADOWING_SETTINGS.autoAdvance).toBe(true);
  });
});

describe("isValidPauseDuration", () => {
  it("should return true for valid pause durations (1-30)", () => {
    expect(isValidPauseDuration(1)).toBe(true);
    expect(isValidPauseDuration(5)).toBe(true);
    expect(isValidPauseDuration(15)).toBe(true);
    expect(isValidPauseDuration(30)).toBe(true);
  });

  it("should return false for pause durations below 1", () => {
    expect(isValidPauseDuration(0)).toBe(false);
    expect(isValidPauseDuration(-1)).toBe(false);
  });

  it("should return false for pause durations above 30", () => {
    expect(isValidPauseDuration(31)).toBe(false);
    expect(isValidPauseDuration(100)).toBe(false);
  });
});

describe("isValidRepeatCount", () => {
  it("should return true for valid repeat counts (1-10)", () => {
    expect(isValidRepeatCount(1)).toBe(true);
    expect(isValidRepeatCount(5)).toBe(true);
    expect(isValidRepeatCount(10)).toBe(true);
  });

  it("should return false for repeat counts below 1", () => {
    expect(isValidRepeatCount(0)).toBe(false);
    expect(isValidRepeatCount(-1)).toBe(false);
  });

  it("should return false for repeat counts above 10", () => {
    expect(isValidRepeatCount(11)).toBe(false);
    expect(isValidRepeatCount(100)).toBe(false);
  });
});
