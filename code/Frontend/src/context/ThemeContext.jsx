import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/**
 * Global theme + font-size state for the whole app.
 *
 * This is intentionally independent from AuthContext: theme should work
 * even on public pages before login, and should apply instantly (from
 * localStorage) before the user's saved preference comes back from
 * /api/v1/profile/me. Settings/sections/Sections.jsx (AppearanceSection)
 * is responsible for syncing the backend value into this context once it
 * loads, and for calling setTheme/setFontSize on every change so the user
 * gets a live preview instead of only seeing the change after "Save".
 */

const ThemeContext = createContext(null);

const THEME_KEY = "m4c-theme"; // "system" | "light" | "dark"
const FONT_KEY = "m4c-font-size"; // "small" | "medium" | "large"

const VALID_THEMES = ["system", "light", "dark"];
const VALID_FONT_SIZES = ["small", "medium", "large"];

function getSystemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolveTheme(theme) {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return getSystemPrefersDark() ? "dark" : "light";
}

function applyThemeToDom(resolved) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-theme", resolved);
}

function applyFontSizeToDom(fontSize) {
  document.documentElement.setAttribute("data-font-size", fontSize);
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return VALID_THEMES.includes(stored) ? stored : "system";
  });
  const [fontSize, setFontSizeState] = useState(() => {
    const stored = localStorage.getItem(FONT_KEY);
    return VALID_FONT_SIZES.includes(stored) ? stored : "medium";
  });
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  // Apply whenever `theme` changes (covers first render + every future change).
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);
  }, [theme]);

  useEffect(() => {
    applyFontSizeToDom(fontSize);
  }, [fontSize]);

  // If the user picked "system", keep tracking OS-level changes live.
  useEffect(() => {
    if (theme !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const resolved = resolveTheme("system");
      setResolvedTheme(resolved);
      applyThemeToDom(resolved);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!VALID_THEMES.includes(next)) return;
    setThemeState(next);
    localStorage.setItem(THEME_KEY, next);
  }, []);

  const setFontSize = useCallback((next) => {
    if (!VALID_FONT_SIZES.includes(next)) return;
    setFontSizeState(next);
    localStorage.setItem(FONT_KEY, next);
  }, []);

  const value = { theme, resolvedTheme, fontSize, setTheme, setFontSize };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};