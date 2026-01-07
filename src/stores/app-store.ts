import { create } from "zustand";

export type Theme = "light" | "dark" | "system";

interface AppState {
  theme: Theme;
  isLoading: boolean;
  setTheme: (theme: Theme) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "system",
  isLoading: false,
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
