import "@testing-library/jest-dom";
import { vi } from "vitest";
import enUS from "../src/i18n/translations/en-US.json";

function resolveTranslation(key) {
  if (!key) return "";
  const parts = key.split(".");
  let cur = enUS;
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in cur) {
      cur = cur[part];
    } else {
      return key;
    }
  }
  return typeof cur === "string" ? cur : key;
}

const mockThemeValue = {
  theme: "light",
  setTheme: vi.fn(),
  resolvedTheme: "light",
  fontSize: "medium",
  setFontSize: vi.fn(),
};

const mockI18nValue = {
  language: "en-US",
  setLanguage: vi.fn(),
  t: (key) => resolveTranslation(key),
  supportedLanguages: [{ code: "en-US", label: "English (US)" }],
};

vi.mock("../src/context/Context", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      return {
        accessToken: token,
        user: token ? { id: "1", userName: "testuser", email: "test@example.com", accountType: "user" } : null,
        login: vi.fn(),
        loading: false,
        logout: vi.fn(),
      };
    },
  };
});

vi.mock("../src/context/ThemeContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useTheme: () => mockThemeValue,
  };
});

vi.mock("../src/i18n/I18nContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useI18n: () => mockI18nValue,
  };
});
