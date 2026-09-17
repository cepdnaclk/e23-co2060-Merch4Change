import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../src/context/ThemeContext.jsx";
import { AppearanceSection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));
vi.mock("../../src/api/apiClient.js", () => ({
  default: { get: apiGet, put: apiPut },
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut },
}));

function stubMatchMedia() {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
}

function renderAppearanceSection(props = {}) {
  return render(
    <ThemeProvider>
      <AppearanceSection {...props} />
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
  it("adopts the account's saved theme and font size from profileData", async () => {
    renderAppearanceSection({
      profileData: { appTheme: "dark", fontSize: "large" },
    });

    expect(screen.getByDisplayValue("Dark")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
  });

  it("prefers a locally cached theme when profileData has no theme specified", async () => {
    localStorage.setItem("m4c-theme", "light");
    renderAppearanceSection({ profileData: {} });

    expect(screen.getByDisplayValue("Light")).toBeInTheDocument();
  });

  it("previews and auto-saves a theme change immediately", async () => {
    const onUpdate = vi.fn();
    renderAppearanceSection({
      profileData: { appTheme: "light", fontSize: "medium" },
      onUpdate,
    });
    await screen.findByDisplayValue("Light");

    fireEvent.change(screen.getByDisplayValue("Light"), { target: { value: "dark" } });

    expect(screen.getByDisplayValue("Dark")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark")
    );
    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/appearance", { appTheme: "dark" })
    );
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ appTheme: "dark" }));
  });

  it("auto-saves font size changes immediately", async () => {
    const onUpdate = vi.fn();
    renderAppearanceSection({
      profileData: { appTheme: "light", fontSize: "small" },
      onUpdate,
    });
    await screen.findByDisplayValue("Small");

    fireEvent.change(screen.getByDisplayValue("Small"), { target: { value: "large" } });

    expect(screen.getByDisplayValue("Large")).toBeInTheDocument();
    await waitFor(() =>
      expect(document.documentElement.getAttribute("data-font-size")).toBe("large")
    );
    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/appearance", { fontSize: "large" })
    );
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ fontSize: "large" }));
  });

  it("displays auto-save notice to the user", async () => {
    renderAppearanceSection();
    expect(await screen.findByText(/Changes are saved automatically/i)).toBeInTheDocument();
  });
});
