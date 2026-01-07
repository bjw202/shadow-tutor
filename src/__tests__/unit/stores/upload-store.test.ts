import { describe, it, expect, beforeEach } from "vitest";
import { useUploadStore } from "@/stores/upload-store";
import type { TextSegment } from "@/types";

describe("upload-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useUploadStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useUploadStore.getState();

      expect(state.file).toBeNull();
      expect(state.content).toBe("");
      expect(state.segments).toEqual([]);
      expect(state.status).toBe("idle");
      expect(state.error).toBeNull();
      expect(state.progress).toBe(0);
      expect(state.parseMode).toBe("sentence");
    });
  });

  describe("setFile", () => {
    it("should update file", () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      useUploadStore.getState().setFile(mockFile);

      expect(useUploadStore.getState().file).toBe(mockFile);
    });

    it("should reset error when setting file", () => {
      useUploadStore.getState().setError("Previous error");
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });

      useUploadStore.getState().setFile(mockFile);

      expect(useUploadStore.getState().error).toBeNull();
    });

    it("should set file to null", () => {
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      useUploadStore.getState().setFile(mockFile);

      useUploadStore.getState().setFile(null);

      expect(useUploadStore.getState().file).toBeNull();
    });
  });

  describe("setContent", () => {
    it("should update content", () => {
      useUploadStore.getState().setContent("Hello, world!");

      expect(useUploadStore.getState().content).toBe("Hello, world!");
    });

    it("should handle empty content", () => {
      useUploadStore.getState().setContent("Some content");
      useUploadStore.getState().setContent("");

      expect(useUploadStore.getState().content).toBe("");
    });
  });

  describe("setSegments", () => {
    it("should update segments array", () => {
      const segments: TextSegment[] = [
        { id: "1", text: "Hello.", startPosition: 0, endPosition: 6 },
        { id: "2", text: "World.", startPosition: 7, endPosition: 13 },
      ];

      useUploadStore.getState().setSegments(segments);

      expect(useUploadStore.getState().segments).toEqual(segments);
    });

    it("should replace existing segments", () => {
      const oldSegments: TextSegment[] = [
        { id: "1", text: "Old.", startPosition: 0, endPosition: 4 },
      ];
      const newSegments: TextSegment[] = [
        { id: "2", text: "New.", startPosition: 0, endPosition: 4 },
      ];

      useUploadStore.getState().setSegments(oldSegments);
      useUploadStore.getState().setSegments(newSegments);

      expect(useUploadStore.getState().segments).toEqual(newSegments);
    });

    it("should handle empty segments array", () => {
      const segments: TextSegment[] = [
        { id: "1", text: "Test.", startPosition: 0, endPosition: 5 },
      ];
      useUploadStore.getState().setSegments(segments);

      useUploadStore.getState().setSegments([]);

      expect(useUploadStore.getState().segments).toEqual([]);
    });
  });

  describe("setStatus", () => {
    it("should update status to uploading", () => {
      useUploadStore.getState().setStatus("uploading");

      expect(useUploadStore.getState().status).toBe("uploading");
    });

    it("should update status to parsing", () => {
      useUploadStore.getState().setStatus("parsing");

      expect(useUploadStore.getState().status).toBe("parsing");
    });

    it("should update status to complete", () => {
      useUploadStore.getState().setStatus("complete");

      expect(useUploadStore.getState().status).toBe("complete");
    });

    it("should update status to error", () => {
      useUploadStore.getState().setStatus("error");

      expect(useUploadStore.getState().status).toBe("error");
    });

    it("should transition from any status to idle", () => {
      useUploadStore.getState().setStatus("complete");
      useUploadStore.getState().setStatus("idle");

      expect(useUploadStore.getState().status).toBe("idle");
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      useUploadStore.getState().setError("Something went wrong");

      expect(useUploadStore.getState().error).toBe("Something went wrong");
    });

    it("should clear error with null", () => {
      useUploadStore.getState().setError("An error");
      useUploadStore.getState().setError(null);

      expect(useUploadStore.getState().error).toBeNull();
    });
  });

  describe("setProgress", () => {
    it("should update progress", () => {
      useUploadStore.getState().setProgress(50);

      expect(useUploadStore.getState().progress).toBe(50);
    });

    it("should handle 0 progress", () => {
      useUploadStore.getState().setProgress(50);
      useUploadStore.getState().setProgress(0);

      expect(useUploadStore.getState().progress).toBe(0);
    });

    it("should handle 100 progress", () => {
      useUploadStore.getState().setProgress(100);

      expect(useUploadStore.getState().progress).toBe(100);
    });
  });

  describe("setParseMode", () => {
    it("should update parse mode to phrase", () => {
      useUploadStore.getState().setParseMode("phrase");

      expect(useUploadStore.getState().parseMode).toBe("phrase");
    });

    it("should update parse mode to paragraph", () => {
      useUploadStore.getState().setParseMode("paragraph");

      expect(useUploadStore.getState().parseMode).toBe("paragraph");
    });

    it("should update parse mode back to sentence", () => {
      useUploadStore.getState().setParseMode("paragraph");
      useUploadStore.getState().setParseMode("sentence");

      expect(useUploadStore.getState().parseMode).toBe("sentence");
    });
  });

  describe("reset", () => {
    it("should return to initial state", () => {
      // Set various values
      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      useUploadStore.getState().setFile(mockFile);
      useUploadStore.getState().setContent("Test content");
      useUploadStore.getState().setSegments([
        { id: "1", text: "Test.", startPosition: 0, endPosition: 5 },
      ]);
      useUploadStore.getState().setStatus("complete");
      useUploadStore.getState().setError("Some error");
      useUploadStore.getState().setProgress(100);
      useUploadStore.getState().setParseMode("paragraph");

      // Reset
      useUploadStore.getState().reset();

      // Verify all values are reset
      const state = useUploadStore.getState();
      expect(state.file).toBeNull();
      expect(state.content).toBe("");
      expect(state.segments).toEqual([]);
      expect(state.status).toBe("idle");
      expect(state.error).toBeNull();
      expect(state.progress).toBe(0);
      expect(state.parseMode).toBe("sentence");
    });
  });
});
