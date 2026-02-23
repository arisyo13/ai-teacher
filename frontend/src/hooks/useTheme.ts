import { useSyncExternalStore, useCallback } from "react";
import {
  getTheme,
  setTheme as setThemeStorage,
  getResolvedTheme,
  subscribeToThemeChange,
  type Theme,
} from "@/lib/theme";

const subscribe = (callback: () => void) => {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onMediaChange = () => callback();
  const unsubTheme = subscribeToThemeChange(callback);
  media.addEventListener("change", onMediaChange);
  return () => {
    media.removeEventListener("change", onMediaChange);
    unsubTheme();
  };
};

const getSnapshot = () => getResolvedTheme();

const getServerSnapshot = () => "light" as const;

export const useResolvedTheme = (): "light" | "dark" =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const useTheme = () => {
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
};
