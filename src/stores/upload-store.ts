import { create } from "zustand";
import type {
  TextSegment,
  ParseMode,
  UploadStatus,
  UploadState,
} from "@/types";

/**
 * Initial state for the upload store
 */
const initialState: Omit<
  UploadState,
  | "setFile"
  | "setContent"
  | "setSegments"
  | "setStatus"
  | "setError"
  | "setProgress"
  | "setParseMode"
  | "reset"
> = {
  file: null,
  content: "",
  segments: [],
  status: "idle",
  error: null,
  progress: 0,
  parseMode: "sentence",
};

/**
 * Upload store actions interface
 */
interface UploadActions {
  setFile: (file: File | null) => void;
  setContent: (content: string) => void;
  setSegments: (segments: TextSegment[]) => void;
  setStatus: (status: UploadStatus) => void;
  setError: (error: string | null) => void;
  setProgress: (progress: number) => void;
  setParseMode: (mode: ParseMode) => void;
  reset: () => void;
}

/**
 * Combined store type
 */
type UploadStore = UploadState & UploadActions;

/**
 * Upload store for managing file upload and text parsing state
 */
export const useUploadStore = create<UploadStore>((set) => ({
  ...initialState,

  setFile: (file) =>
    set({
      file,
      error: null, // Reset error when setting file
    }),

  setContent: (content) => set({ content }),

  setSegments: (segments) => set({ segments }),

  setStatus: (status) => set({ status }),

  setError: (error) => set({ error }),

  setProgress: (progress) => set({ progress }),

  setParseMode: (parseMode) => set({ parseMode }),

  reset: () => set(initialState),
}));
