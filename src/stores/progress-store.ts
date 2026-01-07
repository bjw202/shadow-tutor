import { create } from "zustand";
import type { SessionData, SegmentProgress, SegmentStatus } from "@/types/progress";
import {
  createSession as dbCreateSession,
  getSession as dbGetSession,
  updateSession as dbUpdateSession,
  getSessionByContentHash,
} from "@/lib/db/progress-db";

interface InitSessionParams {
  contentHash: string;
  title: string;
  totalSegments: number;
  segmentIds: string[];
}

interface ProgressState {
  currentSession: SessionData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

interface ProgressActions {
  initSession: (params: InitSessionParams) => Promise<void>;
  loadExistingSession: (sessionId: string) => Promise<void>;
  updateSegmentStatus: (segmentId: string, status: SegmentStatus) => Promise<void>;
  completeSegment: (segmentId: string) => Promise<void>;
  updateStudyTime: (additionalSeconds: number) => Promise<void>;
  setLastSegmentIndex: (index: number) => Promise<void>;
  clearSession: () => void;
  getCompletionRate: () => number;
  getCurrentSegmentProgress: (segmentId: string) => SegmentProgress | null;
}

type ProgressStore = ProgressState & ProgressActions;

export const useProgressStore = create<ProgressStore>((set, get) => ({
  currentSession: null,
  isLoading: false,
  isSaving: false,
  error: null,

  initSession: async (params: InitSessionParams) => {
    set({ isLoading: true, error: null });

    try {
      // Check if session already exists for this content
      const existingSession = await getSessionByContentHash(params.contentHash);

      if (existingSession && !existingSession.completedAt) {
        // Resume existing incomplete session
        set({ currentSession: existingSession, isLoading: false });
        return;
      }

      // Create new session
      const now = Date.now();
      const segmentProgress: SegmentProgress[] = params.segmentIds.map((segmentId) => ({
        segmentId,
        status: "not_started" as SegmentStatus,
        completedAt: null,
        repeatCount: 0,
      }));

      const newSession: SessionData = {
        id: crypto.randomUUID(),
        contentHash: params.contentHash,
        title: params.title,
        totalSegments: params.totalSegments,
        segmentProgress,
        createdAt: now,
        lastActiveAt: now,
        completedAt: null,
        totalStudyTime: 0,
      };

      await dbCreateSession(newSession);
      set({ currentSession: newSession, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to initialize session",
        isLoading: false,
      });
    }
  },

  loadExistingSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      const session = await dbGetSession(sessionId);

      if (!session) {
        set({ error: "Session not found", isLoading: false });
        return;
      }

      set({ currentSession: session, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load session",
        isLoading: false,
      });
    }
  },

  updateSegmentStatus: async (segmentId: string, status: SegmentStatus) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const now = Date.now();
    const updatedProgress = currentSession.segmentProgress.map((progress) => {
      if (progress.segmentId === segmentId) {
        return {
          ...progress,
          status,
          completedAt: status === "completed" ? now : progress.completedAt,
        };
      }
      return progress;
    });

    const updatedSession: SessionData = {
      ...currentSession,
      segmentProgress: updatedProgress,
      lastActiveAt: now,
    };

    set({ currentSession: updatedSession, isSaving: true });

    try {
      await dbUpdateSession(currentSession.id, {
        segmentProgress: updatedProgress,
        lastActiveAt: now,
      });
    } catch {
      // Revert on error
      set({ currentSession, error: "Failed to save progress" });
    } finally {
      set({ isSaving: false });
    }
  },

  completeSegment: async (segmentId: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const now = Date.now();
    const updatedProgress = currentSession.segmentProgress.map((progress) => {
      if (progress.segmentId === segmentId) {
        return {
          ...progress,
          status: "completed" as SegmentStatus,
          completedAt: now,
          repeatCount: progress.repeatCount + 1,
        };
      }
      return progress;
    });

    // Check if all segments are completed
    const allCompleted = updatedProgress.every((p) => p.status === "completed");

    const updatedSession: SessionData = {
      ...currentSession,
      segmentProgress: updatedProgress,
      lastActiveAt: now,
      completedAt: allCompleted ? now : null,
    };

    set({ currentSession: updatedSession, isSaving: true });

    try {
      await dbUpdateSession(currentSession.id, {
        segmentProgress: updatedProgress,
        lastActiveAt: now,
        completedAt: allCompleted ? now : null,
      });
    } catch {
      set({ currentSession, error: "Failed to save progress" });
    } finally {
      set({ isSaving: false });
    }
  },

  updateStudyTime: async (additionalSeconds: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const newTotalTime = currentSession.totalStudyTime + additionalSeconds;
    const now = Date.now();

    const updatedSession: SessionData = {
      ...currentSession,
      totalStudyTime: newTotalTime,
      lastActiveAt: now,
    };

    set({ currentSession: updatedSession });

    try {
      await dbUpdateSession(currentSession.id, {
        totalStudyTime: newTotalTime,
        lastActiveAt: now,
      });
    } catch {
      // Silent fail for study time updates
    }
  },

  setLastSegmentIndex: async (index: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const now = Date.now();
    const updatedSession: SessionData = {
      ...currentSession,
      lastSegmentIndex: index,
      lastActiveAt: now,
    };

    set({ currentSession: updatedSession });

    try {
      await dbUpdateSession(currentSession.id, {
        lastSegmentIndex: index,
        lastActiveAt: now,
      });
    } catch {
      // Silent fail for index updates
    }
  },

  clearSession: () => {
    set({ currentSession: null, error: null });
  },

  getCompletionRate: () => {
    const { currentSession } = get();
    if (!currentSession || currentSession.totalSegments === 0) return 0;

    const completedCount = currentSession.segmentProgress.filter(
      (p) => p.status === "completed"
    ).length;

    return completedCount / currentSession.totalSegments;
  },

  getCurrentSegmentProgress: (segmentId: string) => {
    const { currentSession } = get();
    if (!currentSession) return null;

    return (
      currentSession.segmentProgress.find((p) => p.segmentId === segmentId) ?? null
    );
  },
}));
