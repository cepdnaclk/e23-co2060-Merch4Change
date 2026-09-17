import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsSection } from "../../src/pages/Settings/sections/Sections.jsx";

const { apiGet, apiPut } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPut: vi.fn(),
}));
vi.mock("../../src/api/apiClient", () => ({
  default: { get: apiGet, put: apiPut },
}));

const mockProfile = {
  notifyOnLikes: true,
  notifyOnComments: true,
  notifyOnNewFollowers: true,
  notifyOnDMs: true,
  emailNotifications: false,
};

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset();
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("NotificationsSection", () => {
  it("initializes toggle states from the profileData prop", async () => {
    render(<NotificationsSection profileData={mockProfile} />);

    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(5);
    expect(checkboxes[0]).toBeChecked(); // likes
    expect(checkboxes[1]).toBeChecked(); // comments
    expect(checkboxes[2]).toBeChecked(); // followers
    expect(checkboxes[3]).toBeChecked(); // dms
    expect(checkboxes[4]).not.toBeChecked(); // email
  });

  it("saves a toggle and shows a success toast and calls onUpdate", async () => {
    const onUpdate = vi.fn();
    render(<NotificationsSection profileData={mockProfile} onUpdate={onUpdate} />);
    const [likesToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(likesToggle);

    await waitFor(() =>
      expect(apiPut).toHaveBeenCalledWith("/api/v1/settings/notifications", {
        notifyOnLikes: false,
        notifyOnComments: true,
        notifyOnNewFollowers: true,
        notifyOnDMs: true,
        emailNotifications: false,
      })
    );
    expect(await screen.findByText("Notification preference updated!")).toBeInTheDocument();
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        notifyOnLikes: false,
      })
    );
  });

  it("reverts the toggle and shows an error toast when the save fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Server exploded" } } });
    render(<NotificationsSection profileData={mockProfile} />);
    const [likesToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(likesToggle);

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();
    await waitFor(() => expect(likesToggle).toBeChecked());
  });

  it("disables only the toggle currently being saved", async () => {
    let resolvePut;
    apiPut.mockReturnValue(new Promise((resolve) => (resolvePut = resolve)));
    render(<NotificationsSection profileData={mockProfile} />);
    const [likesToggle, commentsToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(likesToggle);

    expect(likesToggle).toBeDisabled();
    expect(commentsToggle).not.toBeDisabled();

    resolvePut({ data: { success: true } });
    await waitFor(() => expect(likesToggle).not.toBeDisabled());
  });
});
