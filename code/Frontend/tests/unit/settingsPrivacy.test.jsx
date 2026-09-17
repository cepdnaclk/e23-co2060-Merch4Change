import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PrivacySection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut },
}));

const mockProfile = {
  isPrivate: false,
  showActivityStatus: true,
  allowMessageRequests: true,
  hideReadReceipts: false,
  commentPermission: "following",
};

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("PrivacySection", () => {
  it("loads the current privacy settings from the profileData prop", async () => {
    render(<PrivacySection profileData={mockProfile} />);

    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);
    expect(checkboxes[0]).not.toBeChecked(); // private
    expect(checkboxes[1]).toBeChecked(); // activity
    expect(checkboxes[2]).toBeChecked(); // allowMessageRequests
    expect(checkboxes[3]).not.toBeChecked(); // hideReadReceipts
    expect(screen.getByDisplayValue("People you follow")).toBeInTheDocument();
  });

  it("saves a toggle immediately and shows a success toast", async () => {
    const onUpdate = vi.fn();
    render(<PrivacySection profileData={mockProfile} onUpdate={onUpdate} />);
    const [privateToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(privateToggle);

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/privacy", {
        isPrivate: true,
        showActivityStatus: true,
        allowMessageRequests: true,
        hideReadReceipts: false,
        commentPermission: "following",
      })
    );
    expect(await screen.findByText("Privacy settings updated!")).toBeInTheDocument();
    expect(privateToggle).toBeChecked();
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPrivate: true,
      })
    );
  });

  it("rolls back a toggle and shows an error toast when the save fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Could not save" } } });
    render(<PrivacySection profileData={mockProfile} />);
    const [privateToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(privateToggle);

    expect(await screen.findByText("Could not save")).toBeInTheDocument();
    await waitFor(() => expect(privateToggle).not.toBeChecked());
  });

  it("saves the comment-permission dropdown on change", async () => {
    const onUpdate = vi.fn();
    render(<PrivacySection profileData={mockProfile} onUpdate={onUpdate} />);
    await screen.findAllByRole("checkbox");

    fireEvent.change(screen.getByDisplayValue("People you follow"), {
      target: { value: "everyone" },
    });

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith(
        "/api/v1/settings/privacy",
        expect.objectContaining({ commentPermission: "everyone" })
      )
    );
    expect(await screen.findByText("Privacy settings updated!")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        commentPermission: "everyone",
      })
    );
  });

  it("rolls back the comment-permission dropdown when the save fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Error updating privacy" } } });
    render(<PrivacySection profileData={mockProfile} />);
    await screen.findAllByRole("checkbox");

    fireEvent.change(screen.getByDisplayValue("People you follow"), {
      target: { value: "everyone" },
    });

    expect(await screen.findByText("Error updating privacy")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByDisplayValue("People you follow")).toBeInTheDocument()
    );
  });
});
