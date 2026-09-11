import {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import apiClient from "../api/apiClient.js";

const ThemeContext = createContext(null);

const THEME_KEY = "m4c-theme"; // "system" | "light" | "dark"
const FONT_KEY = "m4c-font-size"; // "small" | "medium" | "large"

const VALID_THEMES = ["system", "light", "dark"];
const VALID_FONT_SIZES = ["small", "medium", "large"];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;

  const isDark = resolved === "dark";

  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", resolved);

  if (body) {
    body.classList.toggle("dark", isDark);
    body.setAttribute("data-theme", resolved);
  }
}

function applyFontSizeToDom(fontSize) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-font-size", fontSize);
  if (document.body) {
    document.body.setAttribute("data-font-size", fontSize);
  }
}

// Immediately apply cached theme and font scale prior to React mount
if (typeof window !== "undefined") {
  try {
    const initialTheme = localStorage.getItem(THEME_KEY);
    const resolvedInitial = resolveTheme(
      VALID_THEMES.includes(initialTheme) ? initialTheme : "system"
    );
    applyThemeToDom(resolvedInitial);

    const initialFontSize = localStorage.getItem(FONT_KEY);
    applyFontSizeToDom(
      VALID_FONT_SIZES.includes(initialFontSize) ? initialFontSize : "medium"
    );
  } catch (e) {
    console.error("Failed to apply initial theme/font size from storage:", e);
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      return VALID_THEMES.includes(stored) ? stored : "system";
    } catch {
      return "system";
    }
  });

  const [fontSize, setFontSizeState] = useState(() => {
    try {
      const stored = localStorage.getItem(FONT_KEY);
      return VALID_FONT_SIZES.includes(stored) ? stored : "medium";
    } catch {
      return "medium";
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(theme));

  // Sync with backend on initial load for cross-device persistence
  useEffect(() => {
    const fetchBackendSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const { appTheme, fontSize: backendFont } = res.data.data.user;
          const cachedTheme = localStorage.getItem(THEME_KEY);
          const cachedFont = localStorage.getItem(FONT_KEY);

          if (!cachedTheme && VALID_THEMES.includes(appTheme)) {
            setThemeState(appTheme);
            localStorage.setItem(THEME_KEY, appTheme);
          }

          if (!cachedFont && VALID_FONT_SIZES.includes(backendFont)) {
            setFontSizeState(backendFont);
            localStorage.setItem(FONT_KEY, backendFont);
          }
        }
      } catch {
        // Fallback silently to localStorage for unauthenticated users
      }
    };
    fetchBackendSettings();
  }, []);

  // Synchronously update DOM before painting pages
  useIsomorphicLayoutEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeToDom(resolved);
  }, [theme]);

  useIsomorphicLayoutEffect(() => {
    applyFontSizeToDom(fontSize);
  }, [fontSize]);

  // Track OS-level theme changes when theme === "system"
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

  // Synchronize across multiple tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_KEY && VALID_THEMES.includes(e.newValue)) {
        setThemeState(e.newValue);
      }
      if (e.key === FONT_KEY && VALID_FONT_SIZES.includes(e.newValue)) {
        setFontSizeState(e.newValue);
        applyFontSizeToDom(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Mutator: updates state, localStorage, and database
  const setTheme = useCallback(async (next) => {
    if (!VALID_THEMES.includes(next)) return;
    setThemeState(next);
    try {
      localStorage.setItem(THEME_KEY, next);
      await apiClient.put("/api/v1/settings/appearance", { appTheme: next });
    } catch (e) {
      console.warn("Theme synced locally; database sync failed:", e.message);
    }
  }, []);

  // Mutator: updates state, localStorage, and database
  const setFontSize = useCallback(async (next) => {
    if (!VALID_FONT_SIZES.includes(next)) return;
    setFontSizeState(next);
    applyFontSizeToDom(next);
    try {
      localStorage.setItem(FONT_KEY, next);
      await apiClient.put("/api/v1/settings/appearance", { fontSize: next });
    } catch (e) {
      console.warn("Font size synced locally; database sync failed:", e.message);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = {
    theme,
    resolvedTheme,
    fontSize,
    isDarkMode: resolvedTheme === "dark",
    setTheme,
    setFontSize,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
};