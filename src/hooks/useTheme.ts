import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "app-theme";

export function useTheme() {
  const getSystemPrefersDark = (): boolean =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const readStoredTheme = (): Theme => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return saved ?? "system";
  };

  const [theme, setTheme] = useState<Theme>(readStoredTheme());

  const applyThemeClass = useCallback(
    (t: Theme) => {
      const root = document.documentElement;
      const wantsDark = t === "dark" || (t === "system" && getSystemPrefersDark());
      root.classList.toggle("dark", wantsDark);
    },
    []
  );

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, applyThemeClass]);

  // React to OS changes while on system theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (readStoredTheme() === "system") applyThemeClass("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyThemeClass]);

  return {
    theme,
    setTheme,
    isDark: document.documentElement.classList.contains("dark"),
  };
}

export default useTheme;


