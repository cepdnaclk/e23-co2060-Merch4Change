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

afterEach(cleanup);
beforeEach(() => {
  apiGet.mockReset().mockResolvedValue({
    data: {
      data: {
        user: {
          notifyOnLikes: true,
          notifyOnComments: true,
          notifyOnNewFollowers: true,
          notifyOnDMs: true,
          emailNotifications: false,
        },
      },
    },
  });
  apiPut.mockReset().mockResolvedValue({ data: { success: true } });
});

describe("NotificationsSection", () => {
  it("shows a loading state before settings arrive", () => {
    apiGet.mockReturnValue(new Promise(() => {})); // never resolves
    render(<NotificationsSection />);
    expect(screen.getByText("Loading notification preferences...")).toBeInTheDocument();
  });

  it("loads the current notification preferences from the API", async () => {
    render(<NotificationsSection />);

    await waitFor(() => expect(apiGet).toHaveBeenCalledWith("/api/v1/profile/me"));
    const checkboxes = await screen.findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(5);
    expect(checkboxes[0]).toBeChecked(); // likes
    expect(checkboxes[4]).not.toBeChecked(); // email
  });

  it("shows an error toast when loading preferences fails", async () => {
    apiGet.mockRejectedValue({ response: { data: { message: "Network down" } } });
    render(<NotificationsSection />);

    expect(await screen.findByText("Network down")).toBeInTheDocument();
  });

  it("saves a toggle and shows a success toast", async () => {
    render(<NotificationsSection />);
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
  });

  it("reverts the toggle and shows an error toast when the save fails", async () => {
    apiPut.mockRejectedValue({ response: { data: { message: "Server exploded" } } });
    render(<NotificationsSection />);
    const [likesToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(likesToggle);

    expect(await screen.findByText("Server exploded")).toBeInTheDocument();
    await waitFor(() => expect(likesToggle).toBeChecked());
  });

  it("disables only the toggle currently being saved", async () => {
    let resolvePut;
    apiPut.mockReturnValue(new Promise((resolve) => (resolvePut = resolve)));
    render(<NotificationsSection />);
    const [likesToggle, commentsToggle] = await screen.findAllByRole("checkbox");

    fireEvent.click(likesToggle);

    expect(likesToggle).toBeDisabled();
    expect(commentsToggle).not.toBeDisabled();

    resolvePut({ data: { success: true } });
    await waitFor(() => expect(likesToggle).not.toBeDisabled());
  });
});
