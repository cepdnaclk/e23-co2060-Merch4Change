import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuctionCard } from "../../src/components/Auctions/AuctionCard";
import AuctionDetailPage from "../../src/pages/AuctionDetail/AuctionDetailPage";
import * as auctionApi from "../../src/services/auctionApi";
import apiClient from "../../src/api/apiClient";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "auc_777" }),
  };
});

vi.mock("../../src/context/Context", () => ({
  useAuth: () => ({
    accessToken: "mock-token",
    loading: false,
  }),
}));

vi.mock("../../src/api/apiClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../src/services/auctionApi", () => ({
  getAuction: vi.fn(),
  getAuctionBids: vi.fn(),
  placeBid: vi.fn(),
}));

describe("AuctionCard Navigation & Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const mockAuction = {
    _id: "auc_123",
    status: "active",
    currentPrice: 200,
    endTime: futureDate,
    productId: {
      name: "Signed Sports Memorabilia",
      description: "Charity autographed shirt",
      category: "Sports",
      images: ["https://example.com/jersey.jpg"],
    },
    currentBidder: {
      userName: "collector_pro",
    },
  };

  it("navigates to auction detail page when card is clicked", () => {
    render(
      <MemoryRouter>
        <AuctionCard auction={mockAuction} onOpenBidModal={vi.fn()} />
      </MemoryRouter>
    );

    const title = screen.getByText("Signed Sports Memorabilia");
    fireEvent.click(title);

    expect(mockNavigate).toHaveBeenCalledWith("/marketplace/auction/auc_123");
  });

  it("calls onOpenBidModal without navigating when Place a Bid button is clicked", () => {
    const handleOpenModal = vi.fn();
    render(
      <MemoryRouter>
        <AuctionCard auction={mockAuction} onOpenBidModal={handleOpenModal} />
      </MemoryRouter>
    );

    const bidBtn = screen.getByRole("button", { name: /Place a Bid/i });
    fireEvent.click(bidBtn);

    expect(handleOpenModal).toHaveBeenCalledWith(mockAuction);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("AuctionDetailPage Component with Side Bids List", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const sampleAuction = {
    _id: "auc_777",
    status: "active",
    startPrice: 100,
    currentPrice: 250,
    bidIncrement: 10,
    startTime: new Date().toISOString(),
    endTime: futureDate,
    productId: {
      name: "Exclusive Celebrity Painting",
      description: "Original acrylic on canvas supporting youth education.",
      category: "Art",
      images: ["https://example.com/art.jpg"],
    },
    currentBidder: {
      userName: "art_collector",
    },
  };

  const sampleBids = [
    {
      _id: "bid_1",
      amount: 250,
      createdAt: new Date().toISOString(),
      userId: {
        userName: "art_collector",
        firstName: "Art",
        lastName: "Collector",
      },
    },
    {
      _id: "bid_2",
      amount: 200,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      userId: {
        userName: "charity_supporter",
        firstName: "Charity",
        lastName: "Supporter",
      },
    },
  ];

  it("loads and displays auction overview, current bid, and side bids history list", async () => {
    auctionApi.getAuction.mockResolvedValue({
      success: true,
      auction: sampleAuction,
    });
    auctionApi.getAuctionBids.mockResolvedValue({
      success: true,
      bids: sampleBids,
    });
    apiClient.get.mockImplementation((url) => {
      if (url.includes("/api/v1/profile/me")) {
        return Promise.resolve({
          data: {
            success: true,
            data: { user: { firstName: "Test", userName: "tester", coinBalance: 500 } },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <AuctionDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Exclusive Celebrity Painting")).toBeInTheDocument();
    });

    // Overview Stats & Side list both display $250
    expect(screen.getAllByText("$250").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("art_collector")).toBeInTheDocument();

    // Side panel bids history
    expect(screen.getByText("Live Bids History")).toBeInTheDocument();
    expect(screen.getByText("2 Bids")).toBeInTheDocument();
    expect(screen.getByText("@art_collector")).toBeInTheDocument();
    expect(screen.getByText("@charity_supporter")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
  });

  it("updates custom bid input when clicking quick increment chip", async () => {
    auctionApi.getAuction.mockResolvedValue({
      success: true,
      auction: sampleAuction,
    });
    auctionApi.getAuctionBids.mockResolvedValue({
      success: true,
      bids: sampleBids,
    });
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { user: { coinBalance: 500 } },
      },
    });

    render(
      <MemoryRouter>
        <AuctionDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Exclusive Celebrity Painting")).toBeInTheDocument();
    });

    // Min next bid = 250 + 10 = 260
    // Click quick chip +$25 => 260 + 25 = 285
    const chip25 = screen.getByRole("button", { name: "+$25" });
    fireEvent.click(chip25);

    const input = screen.getByPlaceholderText(/Min \$260/);
    expect(input.value).toBe("285");
  });
});
