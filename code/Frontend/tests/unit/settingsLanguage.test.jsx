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

function renderLanguageSection() {
  return render(
    <I18nProvider>
      <LanguageSection />
    </I18nProvider>
  );
}

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  apiGet.mockReset().mockResolvedValue({
    data: { data: { user: { appLanguage: "en-US" } } },
  });
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("LanguageSection", () => {
  it("lists every supported language in the dropdown", async () => {
    renderLanguageSection();
    await waitFor(() => expect(apiGet).toHaveBeenCalledWith("/api/v1/profile/me"));

    ["English (US)", "English (UK)", "Español (Spanish)", "Français (French)", "Deutsch (German)", "日本語 (Japanese)"].forEach(
      (label) => expect(screen.getByRole("option", { name: label })).toBeInTheDocument()
    );
  });

  it("adopts the account's saved language on load", async () => {
    apiGet.mockResolvedValue({ data: { data: { user: { appLanguage: "fr" } } } });
    renderLanguageSection();

    await waitFor(() =>
      expect(screen.getByDisplayValue("Français (French)")).toBeInTheDocument()
    );
  });

  it("shows an error toast when loading the saved language fails", async () => {
    apiGet.mockRejectedValue({ response: { data: { message: "Could not reach server" } } });
    renderLanguageSection();

    expect(await screen.findByText("Could not reach server")).toBeInTheDocument();
  });

  it("only applies the new language after Save is clicked", async () => {
    renderLanguageSection();
    await waitFor(() => expect(apiGet).toHaveBeenCalled());

    fireEvent.change(screen.getByDisplayValue("English (US)"), { target: { value: "es" } });
    // Selecting a draft value shouldn't touch the backend or the live app yet.
    expect(apiPut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/language", { appLanguage: "es" })
    );
    // The success toast is rendered from the *pre-save* render's `t`, so it
    // shows in the language the user was on when they clicked Save, not the
    // language they just switched to.
    expect(await screen.findByText("Language preference updated!")).toBeInTheDocument();
  });

  it("shows the server's error message when saving fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Unsupported language" } } });
    renderLanguageSection();
    await waitFor(() => expect(apiGet).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Unsupported language")).toBeInTheDocument();
  });
});
