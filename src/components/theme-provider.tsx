"use client";

import { useEffect } from "react";
import { useAppStore, Theme } from "@/stores/app-store";

function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    root.classList.add(systemPrefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    applyThemeToDOM(theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyThemeToDOM("system");
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return <>{children}</>;
}
