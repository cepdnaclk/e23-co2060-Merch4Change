import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../src/context/ThemeContext.jsx";
import { AppearanceSection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut },
}));

// jsdom doesn't implement matchMedia; ThemeContext and the theme-change
// handler both call it to resolve "system" and to watch for OS changes.
function stubMatchMedia() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
}

function renderAppearanceSection() {
  return render(
    <ThemeProvider>
      <AppearanceSection />
    </ThemeProvider>
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-font-size");
});

beforeEach(() => {
  localStorage.clear();
  stubMatchMedia();
  apiGet.mockReset().mockResolvedValue({
    data: { data: { user: { appTheme: "dark", fontSize: "large" } } },
  });
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("AppearanceSection", () => {
  it("adopts the account's saved theme and font size when nothing is cached locally", async () => {
    renderAppearanceSection();

    await waitFor(() => expect(screen.getByDisplayValue("Dark")).toBeInTheDocument());
    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
  });

  it("prefers a locally cached theme over the account's saved value", async () => {
    localStorage.setItem("m4c-theme", "light");
    renderAppearanceSection();

    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    expect(screen.getByDisplayValue("Light")).toBeInTheDocument();
  });

  it("previews a theme change immediately, without needing Save", async () => {
    localStorage.setItem("m4c-theme", "light");
    localStorage.setItem("m4c-font-size", "medium");
    renderAppearanceSection();
    await screen.findByDisplayValue("Light");

    fireEvent.change(screen.getByDisplayValue("Light"), { target: { value: "dark" } });

    expect(screen.getByDisplayValue("Dark")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
    );
  });

  it("saves the selected theme and font size when Save preferences is clicked", async () => {
    localStorage.setItem("m4c-theme", "light");
    localStorage.setItem("m4c-font-size", "small");
    renderAppearanceSection();
    await screen.findByDisplayValue("Light");

    fireEvent.click(screen.getByRole("button", { name: /save preferences/i }));

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/appearance", {
        appTheme: "light",
        fontSize: "small",
      })
    );
    expect(await screen.findByText("Appearance settings saved!")).toBeInTheDocument();
  });

  it("shows an error toast when saving fails", async () => {
    localStorage.setItem("m4c-theme", "light");
    localStorage.setItem("m4c-font-size", "small");
    apiPut.mockRejectedValue({ response: { data: { message: "Could not save preferences" } } });
    renderAppearanceSection();
    await screen.findByDisplayValue("Light");

    fireEvent.click(screen.getByRole("button", { name: /save preferences/i }));

    expect(await screen.findByText("Could not save preferences")).toBeInTheDocument();
  });

  it("shows an error toast when loading appearance preferences fails", async () => {
    apiGet.mockRejectedValue({ response: { data: { message: "Network down" } } });
    renderAppearanceSection();

    expect(await screen.findByText("Network down")).toBeInTheDocument();
  });
});
