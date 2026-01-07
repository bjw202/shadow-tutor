import { describe, it, expect } from "vitest";
import { formatTime } from "@/lib/utils/format-time";

describe("formatTime", () => {
  describe("normal cases", () => {
    it("should format 0 seconds as 0:00", () => {
      expect(formatTime(0)).toBe("0:00");
    });

    it("should format seconds under a minute", () => {
      expect(formatTime(30)).toBe("0:30");
      expect(formatTime(59)).toBe("0:59");
    });

    it("should format exactly one minute", () => {
      expect(formatTime(60)).toBe("1:00");
    });

    it("should format minutes with seconds", () => {
      expect(formatTime(65)).toBe("1:05");
      expect(formatTime(90)).toBe("1:30");
      expect(formatTime(125)).toBe("2:05");
    });

    it("should format multiple minutes correctly", () => {
      expect(formatTime(300)).toBe("5:00");
      expect(formatTime(599)).toBe("9:59");
    });

    it("should format over 10 minutes", () => {
      expect(formatTime(600)).toBe("10:00");
      expect(formatTime(754)).toBe("12:34");
    });

    it("should pad seconds with leading zero when less than 10", () => {
      expect(formatTime(1)).toBe("0:01");
      expect(formatTime(9)).toBe("0:09");
      expect(formatTime(61)).toBe("1:01");
    });
  });

  describe("decimal seconds", () => {
    it("should floor decimal seconds", () => {
      expect(formatTime(30.5)).toBe("0:30");
      expect(formatTime(59.9)).toBe("0:59");
      expect(formatTime(65.7)).toBe("1:05");
    });
  });

  describe("edge cases", () => {
    it("should handle NaN by returning 0:00", () => {
      expect(formatTime(NaN)).toBe("0:00");
    });

    it("should handle Infinity by returning 0:00", () => {
      expect(formatTime(Infinity)).toBe("0:00");
      expect(formatTime(-Infinity)).toBe("0:00");
    });

    it("should handle negative values by returning 0:00", () => {
      expect(formatTime(-1)).toBe("0:00");
      expect(formatTime(-100)).toBe("0:00");
    });

    it("should handle very large values", () => {
      // 1 hour = 3600 seconds
      expect(formatTime(3600)).toBe("60:00");
      expect(formatTime(3661)).toBe("61:01");
    });
  });
});
