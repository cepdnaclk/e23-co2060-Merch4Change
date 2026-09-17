import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import { LanguageSection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut },
}));

function renderLanguageSection(props = {}) {
  return render(
    <I18nProvider>
      <LanguageSection {...props} />
    </I18nProvider>
  );
}

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  apiGet.mockReset();
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("LanguageSection", () => {
  it("lists every supported language in the dropdown", () => {
    renderLanguageSection({ profileData: { appLanguage: "en-US" } });

    [
      "English (US)",
      "English (UK)",
      "Español (Spanish)",
      "Français (French)",
      "Deutsch (German)",
      "日本語 (Japanese)",
    ].forEach((label) =>
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument()
    );
  });

  it("adopts the account's saved language from profileData", () => {
    renderLanguageSection({ profileData: { appLanguage: "fr" } });

    expect(screen.getByDisplayValue("Français (French)")).toBeInTheDocument();
  });

  it("only applies the new language after Save is clicked", async () => {
    const onUpdate = vi.fn();
    renderLanguageSection({ profileData: { appLanguage: "en-US" }, onUpdate });

    fireEvent.change(screen.getByDisplayValue("English (US)"), { target: { value: "es" } });
    // Selecting a draft value shouldn't touch the backend or the live app yet.
    expect(apiPut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/language", { appLanguage: "es" })
    );
    expect(await screen.findByText("Language preference updated!")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ appLanguage: "es" }));
  });

  it("shows the server's error message when saving fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Unsupported language" } } });
    renderLanguageSection({ profileData: { appLanguage: "en-US" } });

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Unsupported language")).toBeInTheDocument();
  });
});
