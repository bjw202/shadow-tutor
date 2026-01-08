import { describe, it, expect } from "vitest";
import type {
  InputMethod,
  TextInputState,
  UploadState,
} from "@/types/upload";

describe("Upload Types", () => {
  describe("InputMethod", () => {
    it("should allow 'file' as valid input method", () => {
      const method: InputMethod = "file";
      expect(method).toBe("file");
    });

    it("should allow 'text' as valid input method", () => {
      const method: InputMethod = "text";
      expect(method).toBe("text");
    });

    it("should have exactly two valid values", () => {
      const methods: InputMethod[] = ["file", "text"];
      expect(methods).toHaveLength(2);
      expect(methods).toContain("file");
      expect(methods).toContain("text");
    });
  });

  describe("TextInputState", () => {
    it("should create valid text input state with default values", () => {
      const state: TextInputState = {
        text: "",
        charCount: 0,
        isValid: false,
        validationError: null,
      };
      expect(state.text).toBe("");
      expect(state.charCount).toBe(0);
      expect(state.isValid).toBe(false);
      expect(state.validationError).toBeNull();
    });

    it("should create valid text input state with content", () => {
      const state: TextInputState = {
        text: "Hello, world!",
        charCount: 13,
        isValid: true,
        validationError: null,
      };
      expect(state.text).toBe("Hello, world!");
      expect(state.charCount).toBe(13);
      expect(state.isValid).toBe(true);
      expect(state.validationError).toBeNull();
    });

    it("should create text input state with validation error", () => {
      const state: TextInputState = {
        text: "",
        charCount: 0,
        isValid: false,
        validationError: "Please enter text to practice",
      };
      expect(state.validationError).toBe("Please enter text to practice");
    });

    it("should handle maximum character count", () => {
      const maxText = "a".repeat(10000);
      const state: TextInputState = {
        text: maxText,
        charCount: 10000,
        isValid: true,
        validationError: null,
      };
      expect(state.charCount).toBe(10000);
      expect(state.isValid).toBe(true);
    });

    it("should handle over-limit character count", () => {
      const state: TextInputState = {
        text: "a".repeat(10001),
        charCount: 10001,
        isValid: false,
        validationError: "Maximum 10,000 characters allowed",
      };
      expect(state.charCount).toBe(10001);
      expect(state.isValid).toBe(false);
      expect(state.validationError).toBe("Maximum 10,000 characters allowed");
    });

    it("should handle multilingual text (Korean)", () => {
      const koreanText = "안녕하세요. 오늘 날씨가 좋습니다.";
      const state: TextInputState = {
        text: koreanText,
        charCount: koreanText.length,
        isValid: true,
        validationError: null,
      };
      expect(state.text).toBe(koreanText);
      expect(state.charCount).toBe(19);
      expect(state.isValid).toBe(true);
    });

    it("should handle multilingual text (Chinese)", () => {
      const chineseText = "你好世界！今天天气很好。";
      const state: TextInputState = {
        text: chineseText,
        charCount: chineseText.length,
        isValid: true,
        validationError: null,
      };
      expect(state.text).toBe(chineseText);
      expect(state.charCount).toBe(12);
      expect(state.isValid).toBe(true);
    });

    it("should handle multilingual text (Japanese)", () => {
      const japaneseText = "こんにちは世界！今日はいい天気です。";
      const state: TextInputState = {
        text: japaneseText,
        charCount: japaneseText.length,
        isValid: true,
        validationError: null,
      };
      expect(state.text).toBe(japaneseText);
      expect(state.charCount).toBe(18);
      expect(state.isValid).toBe(true);
    });

    it("should handle emoji characters", () => {
      const emojiText = "Hello! Great job today.";
      const state: TextInputState = {
        text: emojiText,
        charCount: emojiText.length,
        isValid: true,
        validationError: null,
      };
      expect(state.text).toBe(emojiText);
      expect(state.isValid).toBe(true);
    });
  });

  describe("UploadState with InputMethod", () => {
    it("should have inputMethod field with default file value", () => {
      const state: Partial<UploadState> = {
        inputMethod: "file",
      };
      expect(state.inputMethod).toBe("file");
    });

    it("should have inputMethod field with text value", () => {
      const state: Partial<UploadState> = {
        inputMethod: "text",
      };
      expect(state.inputMethod).toBe("text");
    });

    it("should have textInput field", () => {
      const state: Partial<UploadState> = {
        textInput: {
          text: "Practice text",
          charCount: 13,
          isValid: true,
          validationError: null,
        },
      };
      expect(state.textInput?.text).toBe("Practice text");
      expect(state.textInput?.charCount).toBe(13);
      expect(state.textInput?.isValid).toBe(true);
    });

    it("should combine file and text input states", () => {
      const state: Partial<UploadState> = {
        file: null,
        content: "",
        inputMethod: "text",
        textInput: {
          text: "My practice text",
          charCount: 16,
          isValid: true,
          validationError: null,
        },
      };
      expect(state.inputMethod).toBe("text");
      expect(state.textInput?.text).toBe("My practice text");
      expect(state.file).toBeNull();
    });
  });
});
