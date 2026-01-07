import { openDB, type IDBPDatabase } from "idb";
import type { SessionData } from "@/types/progress";

export const PROGRESS_DB_NAME = "shadow-tutor-progress";
export const PROGRESS_STORE_NAME = "sessions";
const PROGRESS_DB_VERSION = 1;

// localStorage fallback keys
const STORAGE_KEY_PREFIX = "shadow-tutor-session-";
const STORAGE_INDEX_KEY = "shadow-tutor-sessions-index";

type ProgressDB = IDBPDatabase<{
  sessions: {
    key: string;
    value: SessionData;
    indexes: {
      "by-content-hash": string;
      "by-last-active": number;
    };
  };
}>;

let dbInstance: ProgressDB | null = null;

/**
 * Reset the database instance (for testing purposes)
 */
export function resetProgressDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Check if IndexedDB is available in the current environment
 */
export function isIndexedDBAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!window.indexedDB) return false;
    // Test if IndexedDB actually works
    return true;
  } catch {
    return false;
  }
}

/**
 * Initialize and return the progress database
 */
export async function initProgressDB(): Promise<ProgressDB> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<{
    sessions: {
      key: string;
      value: SessionData;
      indexes: {
        "by-content-hash": string;
        "by-last-active": number;
      };
    };
  }>(PROGRESS_DB_NAME, PROGRESS_DB_VERSION, {
    upgrade(db) {
      // Create the sessions store if it doesn't exist
      if (!db.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
        const store = db.createObjectStore(PROGRESS_STORE_NAME, {
          keyPath: "id",
        });
        // Create index for finding sessions by content hash
        store.createIndex("by-content-hash", "contentHash", { unique: false });
        // Create index for sorting by last active time
        store.createIndex("by-last-active", "lastActiveAt", { unique: false });
      }
    },
  });

  return dbInstance;
}

/**
 * Get the database instance, initializing if necessary
 */
async function getDB(): Promise<ProgressDB> {
  if (!isIndexedDBAvailable()) {
    throw new Error("IndexedDB is not available");
  }
  return initProgressDB();
}

/**
 * Create a new session in the database
 */
export async function createSession(sessionData: SessionData): Promise<string> {
  if (!isIndexedDBAvailable()) {
    return createSessionFallback(sessionData);
  }

  const db = await getDB();
  await db.put(PROGRESS_STORE_NAME, sessionData);
  return sessionData.id;
}

/**
 * Get a session by ID
 */
export async function getSession(id: string): Promise<SessionData | null> {
  if (!isIndexedDBAvailable()) {
    return getSessionFallback(id);
  }

  const db = await getDB();
  const session = await db.get(PROGRESS_STORE_NAME, id);
  return session ?? null;
}

/**
 * Update an existing session with partial data
 */
export async function updateSession(
  id: string,
  updates: Partial<SessionData>
): Promise<void> {
  if (!isIndexedDBAvailable()) {
    return updateSessionFallback(id, updates);
  }

  const db = await getDB();
  const existing = await db.get(PROGRESS_STORE_NAME, id);

  if (!existing) {
    throw new Error(`Session with id ${id} not found`);
  }

  const updated: SessionData = {
    ...existing,
    ...updates,
    id, // Ensure ID cannot be changed
  };

  await db.put(PROGRESS_STORE_NAME, updated);
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) {
    return deleteSessionFallback(id);
  }

  const db = await getDB();
  await db.delete(PROGRESS_STORE_NAME, id);
}

/**
 * Find a session by content hash (returns most recent if multiple exist)
 */
export async function getSessionByContentHash(
  contentHash: string
): Promise<SessionData | null> {
  if (!isIndexedDBAvailable()) {
    return getSessionByContentHashFallback(contentHash);
  }

  const db = await getDB();
  const index = db.transaction(PROGRESS_STORE_NAME).store.index("by-content-hash");
  const sessions: SessionData[] = [];

  let cursor = await index.openCursor(IDBKeyRange.only(contentHash));
  while (cursor) {
    sessions.push(cursor.value);
    cursor = await cursor.continue();
  }

  if (sessions.length === 0) {
    return null;
  }

  // Return the most recently active session
  sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  return sessions[0];
}

/**
 * Get all sessions, sorted by last active time (most recent first)
 */
export async function getAllSessions(): Promise<SessionData[]> {
  if (!isIndexedDBAvailable()) {
    return getAllSessionsFallback();
  }

  const db = await getDB();
  const sessions = await db.getAll(PROGRESS_STORE_NAME);

  // Sort by lastActiveAt descending
  sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);

  return sessions;
}

// ============ localStorage Fallback Functions ============

function getSessionIndex(): string[] {
  try {
    const index = localStorage.getItem(STORAGE_INDEX_KEY);
    return index ? JSON.parse(index) : [];
  } catch {
    return [];
  }
}

function setSessionIndex(ids: string[]): void {
  localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(ids));
}

function createSessionFallback(sessionData: SessionData): string {
  localStorage.setItem(
    STORAGE_KEY_PREFIX + sessionData.id,
    JSON.stringify(sessionData)
  );
  const index = getSessionIndex();
  if (!index.includes(sessionData.id)) {
    index.push(sessionData.id);
    setSessionIndex(index);
  }
  return sessionData.id;
}

function getSessionFallback(id: string): SessionData | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + id);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function updateSessionFallback(
  id: string,
  updates: Partial<SessionData>
): void {
  const existing = getSessionFallback(id);
  if (!existing) {
    throw new Error(`Session with id ${id} not found`);
  }
  const updated = { ...existing, ...updates, id };
  localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(updated));
}

function deleteSessionFallback(id: string): void {
  localStorage.removeItem(STORAGE_KEY_PREFIX + id);
  const index = getSessionIndex().filter((i) => i !== id);
  setSessionIndex(index);
}

function getSessionByContentHashFallback(
  contentHash: string
): SessionData | null {
  const sessions = getAllSessionsFallback();
  const matching = sessions.filter((s) => s.contentHash === contentHash);
  if (matching.length === 0) return null;
  matching.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  return matching[0];
}

function getAllSessionsFallback(): SessionData[] {
  const index = getSessionIndex();
  const sessions: SessionData[] = [];

  for (const id of index) {
    const session = getSessionFallback(id);
    if (session) {
      sessions.push(session);
    }
  }

  sessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  return sessions;
}
