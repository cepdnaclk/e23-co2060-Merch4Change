import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import enUS from "./translations/en-US.json";
import enUK from "./translations/en-UK.json";
import si from "./translations/si.json";
import ta from "./translations/ta.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";
import de from "./translations/de.json";
import ja from "./translations/ja.json";

// Every language falls back to en-US for any key that hasn't been translated yet,
// so the UI never shows a raw key or blank text.
const DICTIONARIES = {
  "en-US": enUS,
  "en-UK": enUK,
  si,
  ta,
  es,
  fr,
  de,
  ja,
};

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-UK", label: "English (UK)" },
  { code: "si", label: "සිංහල (Sinhala)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "de", label: "Deutsch (German)" },
  { code: "ja", label: "日本語 (Japanese)" },
];

const STORAGE_KEY = "m4c_app_language";
const DEFAULT_LANGUAGE = "en-US";

function getStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTIONARIES[stored]) return stored;
  } catch {
    // localStorage unavailable (e.g. private mode) - ignore
  }
  return DEFAULT_LANGUAGE;
}

// Resolves "settings.title" -> dictionary.settings.title
function resolveKey(dictionary, key) {
  return key.split(".").reduce((acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined), dictionary);
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, token) => (token in params ? String(params[token]) : match));
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore write failures
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (!DICTIONARIES[code]) return;
    setLanguageState(code);
  }, []);

  const t = useCallback(
    (key, paramsOrFallback, maybeParams) => {
      // Supports t("key"), t("key", { count: 1 }), and t("key", "Fallback text")
      let fallback;
      let params;
      if (typeof paramsOrFallback === "string") {
        fallback = paramsOrFallback;
        params = maybeParams;
      } else {
        params = paramsOrFallback;
      }

      const dictionary = DICTIONARIES[language] || DICTIONARIES[DEFAULT_LANGUAGE];
      let value = resolveKey(dictionary, key);

      if (value === undefined) {
        value = resolveKey(DICTIONARIES[DEFAULT_LANGUAGE], key);
      }
      if (value === undefined) {
        value = fallback !== undefined ? fallback : key;
      }
      return typeof value === "string" ? interpolate(value, params) : value;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

// Convenience alias matching the common react-i18next naming, so it reads
// naturally in components: const { t } = useTranslation();
export const useTranslation = useI18n;