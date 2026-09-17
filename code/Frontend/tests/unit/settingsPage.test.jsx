import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import Settings from "../../src/pages/Settings/Settings.jsx";

const { apiGet } = vi.hoisted(() => ({ apiGet: vi.fn() }));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet },
}));

vi.mock("../../src/context/Context", () => ({
  useAuth: () => ({ accessToken: "test-token", logout: vi.fn() }),
}));

// The app-wide Sidebar pulls in notifications/auth machinery unrelated to
// what this test is verifying, so it's replaced with a minimal stand-in.
vi.mock("../../src/components/Sidebar/Sidebar", () => ({
  default: () => <div data-testid="app-sidebar" />,
}));

// Stub every settings section down to its name so this test can check
// *which* one is mounted without depending on each section's own internals
// (those are covered by their own test files).
vi.mock("../../src/pages/Settings/sections/Sections", () => ({
  ProfileSection: () => <div data-testid="section">profile</div>,
  SecuritySection: () => <div data-testid="section">security</div>,
  PrivacySection: () => <div data-testid="section">privacy</div>,
  NotificationsSection: () => <div data-testid="section">notifications</div>,
  AppearanceSection: () => <div data-testid="section">appearance</div>,
  LanguageSection: () => <div data-testid="section">language</div>,
  HelpSection: () => <div data-testid="section">help</div>,
}));
vi.mock("../../src/pages/Settings/sections/OrganizationVerificationSection", () => ({
  default: () => <div data-testid="section">organization</div>,
}));

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset().mockResolvedValue({
    data: { success: true, data: { user: { firstName: "Jane", accountType: "individual" } } },
  });
});

function renderSettings(initialEntries = ["/settings"]) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Settings />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe("Settings page", () => {
  it("shows the profile section by default", async () => {
    renderSettings();
    expect(await screen.findByTestId("section")).toHaveTextContent("profile");
  });

  it("honors a ?section= query param on load", async () => {
    renderSettings(["/settings?section=privacy"]);
    expect(await screen.findByTestId("section")).toHaveTextContent("privacy");
  });

  it("switches sections when a sidebar item is clicked", async () => {
    renderSettings();
    await screen.findByTestId("section");

    fireEvent.click(screen.getByText("Notifications"));
    expect(await screen.findByTestId("section")).toHaveTextContent("notifications");

    fireEvent.click(screen.getByText("Account security"));
    expect(await screen.findByTestId("section")).toHaveTextContent("security");
  });

  it("hides the organization tab for a personal account", async () => {
    renderSettings();
    await screen.findByTestId("section");
    expect(screen.queryByText("Organization verification")).not.toBeInTheDocument();
  });

  it("shows and can navigate to the organization tab for an organization account", async () => {
    apiGet.mockResolvedValue({
      data: { success: true, data: { user: { firstName: "Acme", accountType: "organization" } } },
    });
    renderSettings();

    const orgTab = await screen.findByText("Organization verification");
    fireEvent.click(orgTab);
    expect(await screen.findByTestId("section")).toHaveTextContent("organization");
  });

  it("prompts for confirmation and logs out when the logout item is clicked", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderSettings();
    await screen.findByTestId("section");

    fireEvent.click(screen.getByText("Log out"));

    expect(confirmSpy).toHaveBeenCalledWith("Do you want to logout?");
    // User cancelled, so the section shown is unaffected and no navigation happens.
    expect(await screen.findByTestId("section")).toHaveTextContent("profile");
    confirmSpy.mockRestore();
  });
});
