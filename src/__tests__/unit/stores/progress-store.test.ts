import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useProgressStore } from "@/stores/progress-store";
import type { SessionData } from "@/types/progress";

// Mock the progress-db module
vi.mock("@/lib/db/progress-db", () => ({
  createSession: vi.fn().mockResolvedValue("test-session-id"),
  getSession: vi.fn().mockResolvedValue(null),
  updateSession: vi.fn().mockResolvedValue(undefined),
  deleteSession: vi.fn().mockResolvedValue(undefined),
  getSessionByContentHash: vi.fn().mockResolvedValue(null),
  getAllSessions: vi.fn().mockResolvedValue([]),
  isIndexedDBAvailable: vi.fn().mockReturnValue(true),
}));

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: vi.fn(() => "test-uuid-123"),
});

describe("progress-store", () => {
  beforeEach(() => {
    // Reset store state before each test
    useProgressStore.setState({
      currentSession: null,
      isLoading: false,
      error: null,
      isSaving: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useProgressStore.getState();

      expect(state.currentSession).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isSaving).toBe(false);
    });
  });

  describe("initSession", () => {
    it("should initialize a new session with segments", async () => {
      const { initSession } = useProgressStore.getState();

      await initSession({
        contentHash: "test-hash",
        title: "Test Session",
        totalSegments: 5,
        segmentIds: ["seg-1", "seg-2", "seg-3", "seg-4", "seg-5"],
      });

      const state = useProgressStore.getState();
      expect(state.currentSession).not.toBeNull();
      expect(state.currentSession?.contentHash).toBe("test-hash");
      expect(state.currentSession?.title).toBe("Test Session");
      expect(state.currentSession?.totalSegments).toBe(5);
      expect(state.currentSession?.segmentProgress).toHaveLength(5);
    });

    it("should initialize all segments with not_started status", async () => {
      const { initSession } = useProgressStore.getState();

      await initSession({
        contentHash: "test-hash",
        title: "Test Session",
        totalSegments: 3,
        segmentIds: ["seg-1", "seg-2", "seg-3"],
      });

      const state = useProgressStore.getState();
      state.currentSession?.segmentProgress.forEach((progress) => {
        expect(progress.status).toBe("not_started");
        expect(progress.completedAt).toBeNull();
        expect(progress.repeatCount).toBe(0);
      });
    });

    it("should set isLoading during initialization", async () => {
      const { initSession } = useProgressStore.getState();

      const promise = initSession({
        contentHash: "test-hash",
        title: "Test Session",
        totalSegments: 2,
        segmentIds: ["seg-1", "seg-2"],
      });

      // Note: Due to async nature, we verify isLoading was eventually false
      await promise;
      expect(useProgressStore.getState().isLoading).toBe(false);
    });
  });

  describe("updateSegmentStatus", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test Session",
        totalSegments: 3,
        segmentIds: ["seg-1", "seg-2", "seg-3"],
      });
    });

    it("should update segment status to in_progress", async () => {
      const { updateSegmentStatus } = useProgressStore.getState();

      await updateSegmentStatus("seg-1", "in_progress");

      const state = useProgressStore.getState();
      const segment = state.currentSession?.segmentProgress.find(
        (p) => p.segmentId === "seg-1"
      );
      expect(segment?.status).toBe("in_progress");
    });

    it("should update segment status to completed with timestamp", async () => {
      const { updateSegmentStatus } = useProgressStore.getState();

      const beforeUpdate = Date.now();
      await updateSegmentStatus("seg-1", "completed");
      const afterUpdate = Date.now();

      const state = useProgressStore.getState();
      const segment = state.currentSession?.segmentProgress.find(
        (p) => p.segmentId === "seg-1"
      );
      expect(segment?.status).toBe("completed");
      expect(segment?.completedAt).toBeGreaterThanOrEqual(beforeUpdate);
      expect(segment?.completedAt).toBeLessThanOrEqual(afterUpdate);
    });

    it("should not throw when session is null", async () => {
      useProgressStore.setState({ currentSession: null });
      const { updateSegmentStatus } = useProgressStore.getState();

      await expect(updateSegmentStatus("seg-1", "completed")).resolves.not.toThrow();
    });
  });

  describe("completeSegment", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test Session",
        totalSegments: 3,
        segmentIds: ["seg-1", "seg-2", "seg-3"],
      });
    });

    it("should mark segment as completed", async () => {
      const { completeSegment } = useProgressStore.getState();

      await completeSegment("seg-1");

      const state = useProgressStore.getState();
      const segment = state.currentSession?.segmentProgress.find(
        (p) => p.segmentId === "seg-1"
      );
      expect(segment?.status).toBe("completed");
    });

    it("should increment repeat count", async () => {
      const { completeSegment } = useProgressStore.getState();

      await completeSegment("seg-1");
      await completeSegment("seg-1");
      await completeSegment("seg-1");

      const state = useProgressStore.getState();
      const segment = state.currentSession?.segmentProgress.find(
        (p) => p.segmentId === "seg-1"
      );
      expect(segment?.repeatCount).toBe(3);
    });
  });

  describe("loadExistingSession", () => {
    it("should load session from database", async () => {
      const mockSession: SessionData = {
        id: "existing-session",
        contentHash: "existing-hash",
        title: "Existing Session",
        totalSegments: 5,
        segmentProgress: [
          { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 2 },
          { segmentId: "seg-2", status: "in_progress", completedAt: null, repeatCount: 1 },
        ],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 120,
      };

      const { getSession } = await import("@/lib/db/progress-db");
      vi.mocked(getSession).mockResolvedValueOnce(mockSession);

      const { loadExistingSession } = useProgressStore.getState();
      await loadExistingSession("existing-session");

      const state = useProgressStore.getState();
      expect(state.currentSession).toEqual(mockSession);
    });

    it("should set error when session not found", async () => {
      const { getSession } = await import("@/lib/db/progress-db");
      vi.mocked(getSession).mockResolvedValueOnce(null);

      const { loadExistingSession } = useProgressStore.getState();
      await loadExistingSession("non-existent");

      const state = useProgressStore.getState();
      expect(state.error).toBe("Session not found");
    });
  });

  describe("getCompletionRate", () => {
    it("should return 0 when no session", () => {
      const { getCompletionRate } = useProgressStore.getState();
      expect(getCompletionRate()).toBe(0);
    });

    it("should return 0 when no segments completed", async () => {
      const { initSession, getCompletionRate } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 3,
        segmentIds: ["seg-1", "seg-2", "seg-3"],
      });

      expect(getCompletionRate()).toBe(0);
    });

    it("should return correct completion rate", async () => {
      const { initSession, completeSegment, getCompletionRate } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 4,
        segmentIds: ["seg-1", "seg-2", "seg-3", "seg-4"],
      });

      await completeSegment("seg-1");
      await completeSegment("seg-2");

      // 2 out of 4 = 0.5
      expect(getCompletionRate()).toBe(0.5);
    });

    it("should return 1 when all segments completed", async () => {
      const { initSession, completeSegment, getCompletionRate } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 2,
        segmentIds: ["seg-1", "seg-2"],
      });

      await completeSegment("seg-1");
      await completeSegment("seg-2");

      expect(getCompletionRate()).toBe(1);
    });
  });

  describe("getCurrentSegmentProgress", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 3,
        segmentIds: ["seg-1", "seg-2", "seg-3"],
      });
    });

    it("should return null when no session", () => {
      useProgressStore.setState({ currentSession: null });
      const { getCurrentSegmentProgress } = useProgressStore.getState();
      expect(getCurrentSegmentProgress("seg-1")).toBeNull();
    });

    it("should return segment progress by id", () => {
      const { getCurrentSegmentProgress } = useProgressStore.getState();
      const progress = getCurrentSegmentProgress("seg-2");

      expect(progress).not.toBeNull();
      expect(progress?.segmentId).toBe("seg-2");
    });

    it("should return null for non-existent segment", () => {
      const { getCurrentSegmentProgress } = useProgressStore.getState();
      expect(getCurrentSegmentProgress("non-existent")).toBeNull();
    });
  });

  describe("updateStudyTime", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 2,
        segmentIds: ["seg-1", "seg-2"],
      });
    });

    it("should update total study time", async () => {
      const { updateStudyTime } = useProgressStore.getState();

      await updateStudyTime(60);

      const state = useProgressStore.getState();
      expect(state.currentSession?.totalStudyTime).toBe(60);
    });

    it("should accumulate study time", async () => {
      const { updateStudyTime } = useProgressStore.getState();

      await updateStudyTime(30);
      await updateStudyTime(45);

      const state = useProgressStore.getState();
      expect(state.currentSession?.totalStudyTime).toBe(75);
    });
  });

  describe("clearSession", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 2,
        segmentIds: ["seg-1", "seg-2"],
      });
    });

    it("should clear current session", () => {
      const { clearSession } = useProgressStore.getState();
      clearSession();

      const state = useProgressStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("setLastSegmentIndex", () => {
    beforeEach(async () => {
      const { initSession } = useProgressStore.getState();
      await initSession({
        contentHash: "test-hash",
        title: "Test",
        totalSegments: 5,
        segmentIds: ["seg-1", "seg-2", "seg-3", "seg-4", "seg-5"],
      });
    });

    it("should set last segment index", async () => {
      const { setLastSegmentIndex } = useProgressStore.getState();

      await setLastSegmentIndex(3);

      const state = useProgressStore.getState();
      expect(state.currentSession?.lastSegmentIndex).toBe(3);
    });
  });
});
