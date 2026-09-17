import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OrganizationVerificationSection from "../../src/pages/Settings/sections/OrganizationVerificationSection.jsx";

const { getMyCharity } = vi.hoisted(() => ({ getMyCharity: vi.fn() }));
vi.mock("../../src/services/charityApi", () => ({ getMyCharity }));

vi.mock("../../src/context/Context", () => ({
  useAuth: () => ({ user: { userName: "acme_org" } }),
}));

function renderSection() {
  return render(
    <MemoryRouter>
      <OrganizationVerificationSection />
    </MemoryRouter>
  );
}

afterEach(cleanup);
beforeEach(() => {
  getMyCharity.mockReset();
});

describe("OrganizationVerificationSection", () => {
  it("shows a loading state before the charity status arrives", () => {
    getMyCharity.mockReturnValue(new Promise(() => {})); // never resolves
    renderSection();
    expect(screen.getByText("Loading verification status...")).toBeInTheDocument();
  });

  it("shows the unsubmitted state when there is no charity profile yet", async () => {
    getMyCharity.mockResolvedValue({ data: { charity: null } });
    renderSection();

    expect(await screen.findByText("Verification not started")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start verification/i })).toHaveAttribute(
      "href",
      "/charity/verify"
    );
  });

  it("falls back to the unsubmitted state instead of crashing when the request fails", async () => {
    // Regression test: getMyCharity() used to have no .catch(), so a
    // rejected request (e.g. a 404 for an org with no charity profile yet)
    // was an unhandled rejection and never resolved the loading state.
    getMyCharity.mockRejectedValue(new Error("Request failed with status code 404"));
    renderSection();

    expect(await screen.findByText("Verification not started")).toBeInTheDocument();
    expect(screen.queryByText("Loading verification status...")).not.toBeInTheDocument();
  });

  it("shows the pending state with a link to view the application", async () => {
    getMyCharity.mockResolvedValue({ data: { charity: { verificationStatus: "pending" } } });
    renderSection();

    expect(await screen.findByText("Verification under review")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view application/i })).toHaveAttribute(
      "href",
      "/charity/verify"
    );
  });

  it("shows the rejection reason when verification was rejected", async () => {
    getMyCharity.mockResolvedValue({
      data: {
        charity: { verificationStatus: "rejected", rejectionReason: "Missing registration doc" },
      },
    });
    renderSection();

    expect(await screen.findByText("Verification rejected")).toBeInTheDocument();
    expect(screen.getByText("Missing registration doc")).toBeInTheDocument();
  });

  it("links a verified organization to its public profile instead of the verify form", async () => {
    getMyCharity.mockResolvedValue({
      data: { charity: { verificationStatus: "verified", registrationNumber: "REG-123" } },
    });
    renderSection();

    expect(await screen.findByText("Organization verified")).toBeInTheDocument();
    expect(screen.getByText("Registration #: REG-123")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view public profile/i })).toHaveAttribute(
      "href",
      "/profile/acme_org"
    );
  });
});
