import { describe, it, expect } from "vitest";
import { parseText, generateSegmentId } from "@/lib/utils/text-parser";

describe("text-parser", () => {
  describe("generateSegmentId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateSegmentId();
      const id2 = generateSegmentId();
      expect(id1).not.toBe(id2);
    });

    it("should generate non-empty string IDs", () => {
      const id = generateSegmentId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe("parseText", () => {
    describe("common behavior", () => {
      it("should return empty array for empty string", () => {
        const result = parseText("", "sentence");
        expect(result).toEqual([]);
      });

      it("should return empty array for whitespace-only string", () => {
        const result = parseText("   ", "sentence");
        expect(result).toEqual([]);
      });

      it("should generate unique IDs for each segment", () => {
        const result = parseText("Hello. World.", "sentence");
        const ids = result.map((s) => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      });

      it("should calculate correct start and end positions", () => {
        const content = "Hello. World.";
        const result = parseText(content, "sentence");

        result.forEach((segment) => {
          const extractedText = content.slice(
            segment.startPosition,
            segment.endPosition
          );
          expect(extractedText.trim()).toBe(segment.text);
        });
      });
    });

    describe("sentence mode", () => {
      it("should return one segment for single sentence", () => {
        const result = parseText("Hello world", "sentence");
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("Hello world");
      });

      it("should split by period", () => {
        const result = parseText("Hello. World.", "sentence");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("Hello.");
        expect(result[1].text).toBe("World.");
      });

      it("should split by exclamation mark", () => {
        const result = parseText("Hello! How are you!", "sentence");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("Hello!");
        expect(result[1].text).toBe("How are you!");
      });

      it("should split by question mark", () => {
        const result = parseText("How are you? I am fine.", "sentence");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("How are you?");
        expect(result[1].text).toBe("I am fine.");
      });

      it("should handle mixed sentence terminators", () => {
        const result = parseText("Hello! How are you? I am fine.", "sentence");
        expect(result).toHaveLength(3);
      });

      it("should trim whitespace from segments", () => {
        const result = parseText("  Hello.   World.  ", "sentence");
        expect(result[0].text).toBe("Hello.");
        expect(result[1].text).toBe("World.");
      });
    });

    describe("phrase mode", () => {
      it("should split by comma", () => {
        const result = parseText("Hello, world", "phrase");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("Hello,");
        expect(result[1].text).toBe("world");
      });

      it("should split by semicolon", () => {
        const result = parseText("Hello; world", "phrase");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("Hello;");
        expect(result[1].text).toBe("world");
      });

      it("should split by colon", () => {
        const result = parseText("Note: important", "phrase");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("Note:");
        expect(result[1].text).toBe("important");
      });

      it("should also split by sentence terminators", () => {
        const result = parseText("Hello, world. Goodbye!", "phrase");
        expect(result).toHaveLength(3);
        expect(result[0].text).toBe("Hello,");
        expect(result[1].text).toBe("world.");
        expect(result[2].text).toBe("Goodbye!");
      });
    });

    describe("paragraph mode", () => {
      it("should split by double newlines", () => {
        const result = parseText("First paragraph.\n\nSecond paragraph.", "paragraph");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("First paragraph.");
        expect(result[1].text).toBe("Second paragraph.");
      });

      it("should handle multiple double newlines", () => {
        const result = parseText("Para 1.\n\nPara 2.\n\nPara 3.", "paragraph");
        expect(result).toHaveLength(3);
      });

      it("should not split by single newline", () => {
        const result = parseText("Line 1.\nLine 2.", "paragraph");
        expect(result).toHaveLength(1);
        expect(result[0].text).toBe("Line 1.\nLine 2.");
      });

      it("should handle Windows-style line endings", () => {
        const result = parseText("Para 1.\r\n\r\nPara 2.", "paragraph");
        expect(result).toHaveLength(2);
      });
    });

    describe("unicode support", () => {
      it("should handle Korean text", () => {
        const result = parseText("안녕하세요. 반갑습니다.", "sentence");
        expect(result).toHaveLength(2);
        expect(result[0].text).toBe("안녕하세요.");
        expect(result[1].text).toBe("반갑습니다.");
      });

      it("should handle Japanese text", () => {
        const result = parseText("こんにちは。元気ですか。", "sentence");
        expect(result).toHaveLength(2);
      });

      it("should handle mixed language text", () => {
        const result = parseText("Hello 안녕. World 세계.", "sentence");
        expect(result).toHaveLength(2);
      });

      it("should handle emoji", () => {
        const result = parseText("Hello! Nice to meet you!", "sentence");
        expect(result).toHaveLength(2);
      });
    });
  });
});
