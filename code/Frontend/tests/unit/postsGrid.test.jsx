import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import PostsGrid from "../../src/components/Feed/PostsGrid";

vi.mock("../../src/api/postsService", () => ({
  getRecommendedPosts: vi.fn(),
  likePost: vi.fn(),
}));

import { getRecommendedPosts } from "../../src/api/postsService";

describe("PostsGrid recommended feed", () => {
  it("keeps the existing placeholder post when recommendations are empty", async () => {
    getRecommendedPosts.mockResolvedValue({ data: { success: true, posts: [] } });

    render(<PostsGrid />);

    await waitFor(() => {
      expect(screen.getByText("Zoe.Studio")).toBeInTheDocument();
    });
  });

  it("renders ranked posts returned by the recommendation endpoint", async () => {
    getRecommendedPosts.mockResolvedValue({
      data: {
        success: true,
        posts: [
          {
            _id: "p1",
            content: "Ranked campaign update",
            images: [],
            likes: [],
            comments: [],
            createdAt: "2026-09-23T10:00:00.000Z",
            userId: { firstName: "Ada", lastName: "Ng", userName: "ada" },
          },
        ],
      },
    });

    render(<PostsGrid />);

    await waitFor(() => {
      expect(screen.getByText("Ranked campaign update")).toBeInTheDocument();
      expect(screen.getByText("Ada Ng")).toBeInTheDocument();
    });
    expect(screen.queryByText("Zoe.Studio")).not.toBeInTheDocument();
  });
});
