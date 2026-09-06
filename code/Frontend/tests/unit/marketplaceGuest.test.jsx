import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MarketplacePage from "../../src/pages/Marketplace/Marketplace";

const { auth, getProfile } = vi.hoisted(() => ({
  auth: { accessToken: null, loading: false },
  getProfile: vi.fn(),
}));
vi.mock("../../src/context/Context", () => ({ useAuth: () => auth }));
vi.mock("../../src/api/apiClient", () => ({ default: { get: getProfile } }));
vi.mock("../../src/components/TopNavbar/TopNavbar", () => ({
  default: () => <div>Dashboard navigation</div>,
}));
vi.mock("../../src/components/Sidebar/Sidebar", () => ({
  default: () => <div>Dashboard sidebar</div>,
}));
vi.mock("../../src/components/Marketplace/Marketplace", () => ({
  default: () => <div>Authenticated product listings</div>,
}));

beforeEach(() => {
  auth.accessToken = null;
  auth.loading = false;
  getProfile
    .mockReset()
    .mockResolvedValue({
      data: { success: true, data: { user: { firstName: "Member" } } },
    });
});
afterEach(cleanup);
const renderMarketplace = () =>
  render(
    <MemoryRouter>
      <MarketplacePage />
    </MemoryRouter>,
  );

describe("Marketplace guest welcome", () => {
  it("offers sign-in, signup, home, and help without exposing member content", async () => {
    renderMarketplace();
    expect(
      await screen.findByRole("heading", {
        name: /Good finds.*One sign-in away/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Help & Support" }),
    ).toHaveAttribute("href", "/help");
    expect(
      screen.queryByText("Authenticated product listings"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard sidebar")).not.toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("waits for authentication before presenting guest actions", () => {
    auth.loading = true;
    renderMarketplace();
    expect(screen.getByText("Verifying access...")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Sign in" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Authenticated product listings"),
    ).not.toBeInTheDocument();
  });

  it("keeps the member marketplace and navigation after authentication", async () => {
    auth.accessToken = "test-token";
    renderMarketplace();
    expect(
      await screen.findByText("Authenticated product listings"),
    ).toBeInTheDocument();
    expect(screen.getByText("Dashboard sidebar")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Create an account" }),
    ).not.toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledWith("/api/v1/profile/me");
  });
});
