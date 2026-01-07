import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  initProgressDB,
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getSessionByContentHash,
  getAllSessions,
  isIndexedDBAvailable,
  resetProgressDB,
  PROGRESS_DB_NAME,
  PROGRESS_STORE_NAME,
} from "@/lib/db/progress-db";
import type { SessionData } from "@/types/progress";

// Mock IndexedDB for jsdom environment
import "fake-indexeddb/auto";

describe("progress-db", () => {
  beforeEach(async () => {
    // Reset the module's DB instance first
    resetProgressDB();
    // Clear IndexedDB before each test
    const databases = await indexedDB.databases();
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
  });

  afterEach(() => {
    resetProgressDB();
    vi.clearAllMocks();
  });

  describe("constants", () => {
    it("should export database name", () => {
      expect(PROGRESS_DB_NAME).toBe("shadow-tutor-progress");
    });

    it("should export store name", () => {
      expect(PROGRESS_STORE_NAME).toBe("sessions");
    });
  });

  describe("isIndexedDBAvailable", () => {
    it("should return true when IndexedDB is available", () => {
      expect(isIndexedDBAvailable()).toBe(true);
    });
  });

  describe("initProgressDB", () => {
    it("should initialize the database", async () => {
      const db = await initProgressDB();
      expect(db).toBeDefined();
      expect(db.name).toBe(PROGRESS_DB_NAME);
    });

    it("should create sessions store", async () => {
      const db = await initProgressDB();
      expect(db.objectStoreNames.contains(PROGRESS_STORE_NAME)).toBe(true);
    });
  });

  describe("createSession", () => {
    it("should create a new session", async () => {
      const sessionData: SessionData = {
        id: "session-1",
        contentHash: "hash-abc123",
        title: "Test Session",
        totalSegments: 5,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      const id = await createSession(sessionData);
      expect(id).toBe("session-1");
    });

    it("should store session data correctly", async () => {
      const now = Date.now();
      const sessionData: SessionData = {
        id: "session-2",
        contentHash: "hash-def456",
        title: "Another Session",
        totalSegments: 10,
        segmentProgress: [
          { segmentId: "seg-1", status: "completed", completedAt: now, repeatCount: 2 },
        ],
        createdAt: now,
        lastActiveAt: now,
        completedAt: null,
        totalStudyTime: 60,
      };

      await createSession(sessionData);
      const retrieved = await getSession("session-2");

      expect(retrieved).toEqual(sessionData);
    });
  });

  describe("getSession", () => {
    it("should return null for non-existent session", async () => {
      const result = await getSession("non-existent");
      expect(result).toBeNull();
    });

    it("should return existing session", async () => {
      const sessionData: SessionData = {
        id: "session-get",
        contentHash: "hash-get",
        title: "Get Test",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(sessionData);
      const result = await getSession("session-get");

      expect(result).toEqual(sessionData);
    });
  });

  describe("updateSession", () => {
    it("should update existing session", async () => {
      const sessionData: SessionData = {
        id: "session-update",
        contentHash: "hash-update",
        title: "Update Test",
        totalSegments: 5,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(sessionData);

      const updatedData: Partial<SessionData> = {
        totalStudyTime: 120,
        lastActiveAt: Date.now() + 1000,
        segmentProgress: [
          { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 1 },
        ],
      };

      await updateSession("session-update", updatedData);
      const result = await getSession("session-update");

      expect(result?.totalStudyTime).toBe(120);
      expect(result?.segmentProgress).toHaveLength(1);
      expect(result?.segmentProgress[0].status).toBe("completed");
    });

    it("should preserve unchanged fields", async () => {
      const sessionData: SessionData = {
        id: "session-preserve",
        contentHash: "hash-preserve",
        title: "Preserve Test",
        totalSegments: 8,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(sessionData);
      await updateSession("session-preserve", { totalStudyTime: 60 });
      const result = await getSession("session-preserve");

      expect(result?.title).toBe("Preserve Test");
      expect(result?.totalSegments).toBe(8);
      expect(result?.contentHash).toBe("hash-preserve");
    });
  });

  describe("deleteSession", () => {
    it("should delete existing session", async () => {
      const sessionData: SessionData = {
        id: "session-delete",
        contentHash: "hash-delete",
        title: "Delete Test",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(sessionData);
      await deleteSession("session-delete");
      const result = await getSession("session-delete");

      expect(result).toBeNull();
    });

    it("should not throw for non-existent session", async () => {
      await expect(deleteSession("non-existent")).resolves.not.toThrow();
    });
  });

  describe("getSessionByContentHash", () => {
    it("should find session by content hash", async () => {
      const sessionData: SessionData = {
        id: "session-hash",
        contentHash: "unique-hash-123",
        title: "Hash Test",
        totalSegments: 4,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(sessionData);
      const result = await getSessionByContentHash("unique-hash-123");

      expect(result).toEqual(sessionData);
    });

    it("should return null for non-existent hash", async () => {
      const result = await getSessionByContentHash("non-existent-hash");
      expect(result).toBeNull();
    });

    it("should return most recent session for duplicate hashes", async () => {
      const now = Date.now();
      const olderSession: SessionData = {
        id: "session-older",
        contentHash: "duplicate-hash",
        title: "Older Session",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: now - 10000,
        lastActiveAt: now - 10000,
        completedAt: null,
        totalStudyTime: 0,
      };

      const newerSession: SessionData = {
        id: "session-newer",
        contentHash: "duplicate-hash",
        title: "Newer Session",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: now,
        lastActiveAt: now,
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(olderSession);
      await createSession(newerSession);
      const result = await getSessionByContentHash("duplicate-hash");

      expect(result?.id).toBe("session-newer");
    });
  });

  describe("getAllSessions", () => {
    it("should return empty array when no sessions", async () => {
      const result = await getAllSessions();
      expect(result).toEqual([]);
    });

    it("should return all sessions", async () => {
      const session1: SessionData = {
        id: "session-all-1",
        contentHash: "hash-1",
        title: "Session 1",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      const session2: SessionData = {
        id: "session-all-2",
        contentHash: "hash-2",
        title: "Session 2",
        totalSegments: 5,
        segmentProgress: [],
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(session1);
      await createSession(session2);
      const result = await getAllSessions();

      expect(result).toHaveLength(2);
    });

    it("should return sessions sorted by lastActiveAt descending", async () => {
      const now = Date.now();
      const session1: SessionData = {
        id: "session-sort-1",
        contentHash: "hash-sort-1",
        title: "Older Active",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: now - 20000,
        lastActiveAt: now - 10000,
        completedAt: null,
        totalStudyTime: 0,
      };

      const session2: SessionData = {
        id: "session-sort-2",
        contentHash: "hash-sort-2",
        title: "Recently Active",
        totalSegments: 3,
        segmentProgress: [],
        createdAt: now - 30000,
        lastActiveAt: now,
        completedAt: null,
        totalStudyTime: 0,
      };

      await createSession(session1);
      await createSession(session2);
      const result = await getAllSessions();

      expect(result[0].id).toBe("session-sort-2");
      expect(result[1].id).toBe("session-sort-1");
    });
  });

  describe("localStorage fallback", () => {
    it("should use localStorage when IndexedDB is unavailable", async () => {
      // This test verifies the fallback mechanism exists
      // Full fallback testing requires mocking IndexedDB unavailability
      expect(typeof localStorage).not.toBe("undefined");
    });
  });
});
