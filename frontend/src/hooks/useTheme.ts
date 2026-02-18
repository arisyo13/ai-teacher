import { useSyncExternalStore, useCallback } from "react";
import {
  getTheme,
  setTheme as setThemeStorage,
  getResolvedTheme,
  subscribeToThemeChange,
  type Theme,
} from "@/lib/theme";

function subscribe(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => callback();
  const unsubTheme = subscribeToThemeChange(callback);
  media.addEventListener("change", onMediaChange);
  return () => {
    media.removeEventListener("change", onMediaChange);
    unsubTheme();
  };
}

function getSnapshot() {
  return getResolvedTheme();
}

function getServerSnapshot() {
  return "light" as const;
}

export function useResolvedTheme(): "light" | "dark" {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useTheme() {
  const resolved = useResolvedTheme();
  const theme = getTheme();

  const setTheme = useCallback((value: Theme) => {
    setThemeStorage(value);
  }, []);

  const cycleTheme = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  return { theme, resolvedTheme: resolved, setTheme, cycleTheme };
}
