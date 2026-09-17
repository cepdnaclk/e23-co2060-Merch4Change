import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ProfileSection from "../../src/pages/Settings/sections/ProfileSection.jsx";

const { apiGet, apiPut, apiPost } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiPost: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut, post: apiPost },
}));

const baseProfile = {
  firstName: "Jane",
  lastName: "Doe",
  userName: "jane_doe",
  profileBio: "Loves clean water projects",
  userLink: "https://example.com",
  location: "Colombo",
  email: "jane@example.com",
  profileImageUrl: "",
  avatarUrl: "",
};

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset().mockResolvedValue({
    data: { success: true, data: { user: { ...baseProfile } } },
  });
  apiPost.mockReset();
});

describe("ProfileSection", () => {
  it("pre-fills the form from the profileData prop", () => {
    render(<ProfileSection profileData={baseProfile} />);

    expect(screen.getByDisplayValue("jane_doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Loves clean water projects")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Colombo")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("saves the edited fields and excludes email from the general save", async () => {
    render(<ProfileSection profileData={baseProfile} />);

    fireEvent.change(screen.getByDisplayValue("Colombo"), {
      target: { value: "Kandy" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(apiPut).toHaveBeenCalledTimes(1));

    const [url, body] = apiPut.mock.calls[0];
    expect(url).toBe("/api/v1/settings/profile");
    expect(body.location).toBe("Kandy");
    expect(body).not.toHaveProperty("email");

    expect(await screen.findByText(/Profile settings updated successfully/i)).toBeInTheDocument();
  });

  it("shows an error toast when the save fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Username already taken" } } });
    render(<ProfileSection profileData={baseProfile} />);

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(await screen.findByText("Username already taken")).toBeInTheDocument();
  });

  it("walks through the email-change flow: request code, then enter it to confirm", async () => {
    apiPost.mockImplementation((url) => {
      if (url === "/api/v1/settings/email/request-change") {
        return Promise.resolve({
          data: { success: true, data: { pendingEmail: "new@example.com", nextCooldownSeconds: 60 } },
        });
      }
      if (url === "/api/v1/settings/email/verify") {
        return Promise.resolve({
          data: { success: true, data: { user: { ...baseProfile, email: "new@example.com" } } },
        });
      }
      return Promise.reject(new Error(`Unexpected POST ${url}`));
    });

    render(<ProfileSection profileData={baseProfile} />);

    fireEvent.click(screen.getByRole("button", { name: /change email/i }));

    fireEvent.change(screen.getByPlaceholderText("New email address"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Current password"), {
      target: { value: "MyPassword123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/email/request-change", {
        newEmail: "new@example.com",
        currentPassword: "MyPassword123",
      })
    );

    // Now on the OTP step — six single-digit boxes.
    expect(await screen.findByText(/Enter the code sent to/i)).toBeInTheDocument();
    const otpInputs = document.querySelectorAll(".otp-input");
    expect(otpInputs.length).toBe(6);
    "654321".split("").forEach((digit, i) => {
      fireEvent.change(otpInputs[i], { target: { value: digit } });
    });

    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() =>
      expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/email/verify", { otp: "654321" })
    );
  });

  it("blocks the email-change request until both fields are filled", () => {
    render(<ProfileSection profileData={baseProfile} />);

    fireEvent.click(screen.getByRole("button", { name: /change email/i }));
    fireEvent.click(screen.getByRole("button", { name: /send code/i }));

    expect(apiPost).not.toHaveBeenCalled();
  });
});