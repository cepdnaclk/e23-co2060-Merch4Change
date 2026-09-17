import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HelpSection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiDelete } = vi.hoisted(() => ({ apiDelete: vi.fn() }));
vi.mock("../../src/api/apiClient", () => ({
  default: { delete: apiDelete },
}));

function renderHelpSection() {
  return render(
    <MemoryRouter>
      <HelpSection />
    </MemoryRouter>
  );
}

afterEach(cleanup);
beforeEach(() => {
  apiDelete.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("HelpSection", () => {
  it("renders links to the help center, contact, and privacy policy", () => {
    renderHelpSection();

    expect(screen.getByText("Help center").closest("a")).toHaveAttribute("href", "/help");
    expect(screen.getByText("Report a problem").closest("a")).toHaveAttribute(
      "href",
      "/help/contact"
    );
    expect(screen.getByText("Privacy policy").closest("a")).toHaveAttribute("href", "/privacy");
  });

  it("hides the password field until Delete account is clicked", () => {
    renderHelpSection();

    expect(screen.queryByPlaceholderText("Enter your password")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));

    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
  });

  it("requires a password before sending the delete request", async () => {
    renderHelpSection();
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));

    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    expect(
      await screen.findByText("Please enter your password to confirm deletion.")
    ).toBeInTheDocument();
    expect(apiDelete).not.toHaveBeenCalled();
  });

  it("asks for window.confirm before deleting, and does nothing if cancelled", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderHelpSection();
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "MyPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(apiDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("deletes the account with the entered password once confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderHelpSection();
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "MyPassword123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    await waitFor(() =>
      expect(apiDelete).toHaveBeenCalledWith("/api/v1/settings/account", {
        data: { password: "MyPassword123" },
      })
    );
    expect(await screen.findByText("Account deleted. Redirecting...")).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("shows the server's error message when deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    apiDelete.mockRejectedValue({ response: { data: { message: "Incorrect password" } } });
    renderHelpSection();
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "WrongPass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm deletion/i }));

    expect(await screen.findByText("Incorrect password")).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("lets the user cancel out of the delete confirmation panel", () => {
    renderHelpSection();
    fireEvent.click(screen.getByRole("button", { name: /delete account/i }));
    expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByPlaceholderText("Enter your password")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
  });
});
