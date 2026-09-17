import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SecuritySection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut, apiPost } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
  apiPost: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut, post: apiPost },
}));

const baseProfile = {
  twoFactorEnabled: false,
  loginActivityAlerts: true,
};

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
  apiPost.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("SecuritySection", () => {
  it("initializes 2FA and login-alert state from profileData prop", async () => {
    render(
      <SecuritySection
        profileData={{ twoFactorEnabled: true, loginActivityAlerts: false }}
      />
    );

    const [twoFAToggle, alertsToggle] = await screen.findAllByRole("checkbox");
    expect(twoFAToggle).toBeChecked();
    expect(alertsToggle).not.toBeChecked();
  });

  describe("login activity alerts toggle", () => {
    it("saves the new value and shows a success toast", async () => {
      const onUpdate = vi.fn();
      render(<SecuritySection profileData={baseProfile} onUpdate={onUpdate} />);
      const [, alertsToggle] = await screen.findAllByRole("checkbox");

      fireEvent.click(alertsToggle);

      await waitFor(() =>
        expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/security", {
          loginActivityAlerts: false,
        })
      );
      expect(await screen.findByText("Security settings updated!")).toBeInTheDocument();
      expect(alertsToggle).not.toBeChecked();
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ loginActivityAlerts: false })
      );
    });

    it("rolls back the toggle and shows an error toast when the save fails", async () => {
      apiPut.mockRejectedValue({ response: { data: { message: "Could not save" } } });
      render(<SecuritySection profileData={baseProfile} />);
      const [, alertsToggle] = await screen.findAllByRole("checkbox");

      fireEvent.click(alertsToggle);

      expect(await screen.findByText("Could not save")).toBeInTheDocument();
      await waitFor(() => expect(alertsToggle).toBeChecked());
    });
  });

  describe("enabling two-factor authentication", () => {
    it("requests a code, then confirms it to turn 2FA on", async () => {
      const onUpdate = vi.fn();
      render(<SecuritySection profileData={baseProfile} onUpdate={onUpdate} />);
      const [twoFAToggle] = await screen.findAllByRole("checkbox");

      fireEvent.click(twoFAToggle);

      await waitFor(() =>
        expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/security/2fa/request-enable")
      );
      expect(await screen.findByText(/Enter the verification code/i)).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText("123456"), { target: { value: "998877" } });
      fireEvent.click(screen.getByRole("button", { name: /confirm code/i }));

      await waitFor(() =>
        expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/security/2fa/verify-enable", {
          otp: "998877",
        })
      );
      expect(await screen.findByText("Two-factor authentication enabled!")).toBeInTheDocument();
      const [confirmedToggle] = screen.getAllByRole("checkbox");
      expect(confirmedToggle).toBeChecked();
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ twoFactorEnabled: true })
      );
    });

    it("blocks confirmation until a code is entered", async () => {
      render(<SecuritySection profileData={baseProfile} />);
      const [twoFAToggle] = await screen.findAllByRole("checkbox");
      fireEvent.click(twoFAToggle);
      await screen.findByText(/Enter the verification code/i);

      fireEvent.click(screen.getByRole("button", { name: /confirm code/i }));

      expect(await screen.findByText("Please enter the verification code.")).toBeInTheDocument();
      expect(apiPost).toHaveBeenCalledTimes(1); // only the request-enable call, no verify call
    });

    it("can resend the code without leaving the OTP step", async () => {
      render(<SecuritySection profileData={baseProfile} />);
      const [twoFAToggle] = await screen.findAllByRole("checkbox");
      fireEvent.click(twoFAToggle);
      await screen.findByText(/Enter the verification code/i);

      fireEvent.click(screen.getByRole("button", { name: /resend code/i }));

      await waitFor(() => expect(apiPost).toHaveBeenCalledTimes(2));
      expect(await screen.findByText("A new code has been sent.")).toBeInTheDocument();
    });
  });

  describe("disabling two-factor authentication", () => {
    const twoFAEnabledProfile = { twoFactorEnabled: true, loginActivityAlerts: true };

    it("asks for the current password and turns 2FA off on success", async () => {
      const onUpdate = vi.fn();
      render(<SecuritySection profileData={twoFAEnabledProfile} onUpdate={onUpdate} />);
      const [twoFAToggle] = await screen.findAllByRole("checkbox");
      fireEvent.click(twoFAToggle);
      await screen.findByText(/turn off two-factor authentication/i);

      fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
        target: { value: "MyPassword123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /disable 2fa/i }));

      await waitFor(() =>
        expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/security/2fa/disable", {
          currentPassword: "MyPassword123",
        })
      );
      expect(await screen.findByText("Two-factor authentication disabled.")).toBeInTheDocument();
      const [confirmedToggle] = screen.getAllByRole("checkbox");
      expect(confirmedToggle).not.toBeChecked();
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ twoFactorEnabled: false })
      );
    });

    it("requires a password before allowing the disable request", async () => {
      render(<SecuritySection profileData={twoFAEnabledProfile} />);
      const [twoFAToggle] = await screen.findAllByRole("checkbox");
      fireEvent.click(twoFAToggle);
      await screen.findByText(/turn off two-factor authentication/i);

      fireEvent.click(screen.getByRole("button", { name: /disable 2fa/i }));

      expect(await screen.findByText("Please enter your password to confirm.")).toBeInTheDocument();
      expect(apiPost).not.toHaveBeenCalled();
    });
  });

  describe("password change", () => {
    it("requires all three fields before submitting", async () => {
      render(<SecuritySection profileData={baseProfile} />);
      await screen.findAllByRole("checkbox");

      fireEvent.click(screen.getByRole("button", { name: /update password/i }));

      expect(await screen.findByText("All password fields are required")).toBeInTheDocument();
      expect(apiPost).not.toHaveBeenCalled();
    });

    it("submits and clears the fields on success", async () => {
      render(<SecuritySection profileData={baseProfile} />);
      await screen.findAllByRole("checkbox");

      fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
        target: { value: "OldPass123" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
        target: { value: "NewPass456" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
        target: { value: "NewPass456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));

      await waitFor(() =>
        expect(apiPost).toHaveBeenCalledWith("/api/v1/settings/change-password", {
          currentPassword: "OldPass123",
          newPassword: "NewPass456",
          confirmPassword: "NewPass456",
        })
      );
      expect(await screen.findByText("Password changed successfully!")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter current password")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter new password")).toHaveValue("");
      expect(screen.getByPlaceholderText("Confirm new password")).toHaveValue("");
    });

    it("shows the server's error message when the change fails", async () => {
      apiPost.mockRejectedValue({ response: { data: { message: "Current password is incorrect" } } });
      render(<SecuritySection profileData={baseProfile} />);
      await screen.findAllByRole("checkbox");

      fireEvent.change(screen.getByPlaceholderText("Enter current password"), {
        target: { value: "WrongPass" },
      });
      fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
        target: { value: "NewPass456" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
        target: { value: "NewPass456" },
      });
      fireEvent.click(screen.getByRole("button", { name: /update password/i }));

      expect(await screen.findByText("Current password is incorrect")).toBeInTheDocument();
    });
  });
});
