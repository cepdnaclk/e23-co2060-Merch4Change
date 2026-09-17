import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../src/i18n/I18nContext.jsx";
import SettingsSidebar from "../../src/pages/Settings/components/SettingsSidebar.jsx";

afterEach(cleanup);

function renderSidebar(props) {
  return render(
    <I18nProvider>
      <SettingsSidebar activeSection="profile" onSelect={vi.fn()} showOrganization={false} {...props} />
    </I18nProvider>
  );
}

describe("SettingsSidebar", () => {
  it("renders the standard account, preferences, and more groups", () => {
    renderSidebar();

    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();

    ["Edit profile", "Account security", "Privacy", "Notifications", "Appearance", "Language", "Help & support", "Log out"].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("hides the organization verification item for non-organization accounts", () => {
    renderSidebar({ showOrganization: false });
    expect(screen.queryByText("Organization verification")).not.toBeInTheDocument();
  });

  it("shows the organization verification item for organization accounts", () => {
    renderSidebar({ showOrganization: true });
    expect(screen.getByText("Organization verification")).toBeInTheDocument();
  });

  it("marks the active section with the active class", () => {
    renderSidebar({ activeSection: "privacy" });

    const privacyButton = screen.getByText("Privacy").closest("button");
    const profileButton = screen.getByText("Edit profile").closest("button");
    expect(privacyButton.className).toContain("ss-nav__item--active");
    expect(profileButton.className).not.toContain("ss-nav__item--active");
  });

  it("calls onSelect with the clicked item's id", () => {
    const onSelect = vi.fn();
    renderSidebar({ onSelect });

    fireEvent.click(screen.getByText("Notifications"));
    expect(onSelect).toHaveBeenCalledWith("notifications");

    fireEvent.click(screen.getByText("Log out"));
    expect(onSelect).toHaveBeenCalledWith("logout");
  });

  it("styles the logout item as a danger action", () => {
    renderSidebar();
    const logoutButton = screen.getByText("Log out").closest("button");
    expect(logoutButton.className).toContain("ss-nav__item--danger");
  });
});
