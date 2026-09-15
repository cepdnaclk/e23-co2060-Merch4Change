import "@testing-library/jest-dom";
import { vi } from "vitest";
import enUS from "../src/i18n/translations/en-US.json";

// jsdom doesn't implement scrollIntoView, but several components (Navbar's
// in-page section links, HelpAndSupport's category/filter jumps) call it on
// click. Without a stub, those clicks throw "scrollIntoView is not a
// function" in every test that exercises them.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}

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
  get theme() {
    return localStorage.getItem("m4c-theme") || "light";
  },
  setTheme: vi.fn(),
  get resolvedTheme() {
    return localStorage.getItem("m4c-theme") || "light";
  },
  get fontSize() {
    return localStorage.getItem("m4c-font-size") || "medium";
  },
  setFontSize: vi.fn(),
};

const mockI18nValue = {
  language: "en-US",
  setLanguage: vi.fn(),
  t: (key) => resolveTranslation(key),
  languages: [
    { code: "en-US", label: "English (US)" },
    { code: "si-LK", label: "සිංහල" },
    { code: "ta-LK", label: "தமிழ்" },
  ],
  supportedLanguages: [
    { code: "en-US", label: "English (US)" },
    { code: "si-LK", label: "සිංහල" },
    { code: "ta-LK", label: "தமிழ்" },
  ],
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
    useI18n: () => {
      try {
        const ctx = actual.useI18n();
        if (ctx) return ctx;
      } catch {
        // fallback to mock
      }
      return mockI18nValue;
    },
  };
});
