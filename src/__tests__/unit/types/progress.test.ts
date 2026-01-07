import { describe, it, expect } from "vitest";
import type {
  SegmentStatus,
  SegmentProgress,
  SessionData,
  SessionListItem,
} from "@/types/progress";

describe("progress types", () => {
  describe("SegmentStatus", () => {
    it("should define valid segment statuses", () => {
      const notStarted: SegmentStatus = "not_started";
      const inProgress: SegmentStatus = "in_progress";
      const completed: SegmentStatus = "completed";

      expect(notStarted).toBe("not_started");
      expect(inProgress).toBe("in_progress");
      expect(completed).toBe("completed");
    });
  });

  describe("SegmentProgress", () => {
    it("should have required properties", () => {
      const progress: SegmentProgress = {
        segmentId: "seg-1",
        status: "not_started",
        completedAt: null,
        repeatCount: 0,
      };

      expect(progress.segmentId).toBe("seg-1");
      expect(progress.status).toBe("not_started");
      expect(progress.completedAt).toBeNull();
      expect(progress.repeatCount).toBe(0);
    });

    it("should allow completed status with completedAt timestamp", () => {
      const now = Date.now();
      const progress: SegmentProgress = {
        segmentId: "seg-1",
        status: "completed",
        completedAt: now,
        repeatCount: 3,
      };

      expect(progress.status).toBe("completed");
      expect(progress.completedAt).toBe(now);
      expect(progress.repeatCount).toBe(3);
    });
  });

  describe("SessionData", () => {
    it("should have required properties", () => {
      const session: SessionData = {
        id: "session-1",
        contentHash: "hash-abc123",
        title: "Test Session",
        totalSegments: 10,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      expect(session.id).toBe("session-1");
      expect(session.contentHash).toBe("hash-abc123");
      expect(session.title).toBe("Test Session");
      expect(session.totalSegments).toBe(10);
      expect(session.segmentProgress).toEqual([]);
      expect(session.completedAt).toBeNull();
      expect(session.totalStudyTime).toBe(0);
    });

    it("should support segment progress array", () => {
      const session: SessionData = {
        id: "session-1",
        contentHash: "hash-abc123",
        title: "Test Session",
        totalSegments: 2,
        segmentProgress: [
          { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 2 },
          { segmentId: "seg-2", status: "in_progress", completedAt: null, repeatCount: 1 },
        ],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 120,
      };

      expect(session.segmentProgress).toHaveLength(2);
      expect(session.segmentProgress[0].status).toBe("completed");
      expect(session.segmentProgress[1].status).toBe("in_progress");
    });

    it("should support lastSegmentIndex for resume functionality", () => {
      const session: SessionData = {
        id: "session-1",
        contentHash: "hash-abc123",
        title: "Test Session",
        totalSegments: 10,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
        lastSegmentIndex: 5,
      };

      expect(session.lastSegmentIndex).toBe(5);
    });
  });

  describe("SessionListItem", () => {
    it("should have summarized session info", () => {
      const item: SessionListItem = {
        id: "session-1",
        title: "Test Session",
        completionRate: 0.75,
        totalSegments: 10,
        completedSegments: 7,
        lastActiveAt: Date.now(),
        totalStudyTime: 300,
      };

      expect(item.id).toBe("session-1");
      expect(item.title).toBe("Test Session");
      expect(item.completionRate).toBe(0.75);
      expect(item.totalSegments).toBe(10);
      expect(item.completedSegments).toBe(7);
      expect(item.totalStudyTime).toBe(300);
    });
  });
});
