export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
};

const applyTheme = (resolved: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

/** Call before first paint to avoid flash. Run from main.tsx. */
export const initTheme = (): "light" | "dark" => {
  const theme = getStoredTheme();
  const resolved = theme === "system" ? getSystemTheme() : theme;
  applyTheme(resolved);
  return resolved;
};

export const getResolvedTheme = (): "light" | "dark" => {
  const theme = getStoredTheme();
  return theme === "system" ? getSystemTheme() : theme;
};

const THEME_CHANGE_EVENT = "theme-change";

export const setTheme = (theme: Theme) => {
  localStorage.setItem(STORAGE_KEY, theme);
  const resolved = theme === "system" ? getSystemTheme() : theme;
  applyTheme(resolved);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
  }
  return resolved;
};

export const subscribeToThemeChange = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(THEME_CHANGE_EVENT, handler);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
};

export const getTheme = (): Theme => getStoredTheme();
