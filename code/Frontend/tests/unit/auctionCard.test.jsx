import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { AuctionCard, formatTimeLeft } from "../../src/components/Auctions/AuctionCard";

describe("AuctionCard Component", () => {
  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const mockAuction = {
    _id: "auc_123",
    status: "active",
    currentPrice: 150,
    endTime: futureDate,
    productId: {
      name: "Signed Celebrity Jersey",
      description: "Charity autographed shirt",
      category: "Sports",
      images: ["https://example.com/jersey.jpg"],
    },
    currentBidder: {
      userName: "collector_pro",
    },
  };

  it("renders the product name, price, and current high bidder", () => {
    render(<AuctionCard auction={mockAuction} onOpenBidModal={vi.fn()} />);

    expect(screen.getByText("Signed Celebrity Jersey")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("collector_pro")).toBeInTheDocument();
    expect(screen.getByText("LIVE AUCTION")).toBeInTheDocument();
  });

  it("calls onOpenBidModal when clicking Place a Bid", () => {
    const handleOpenModal = vi.fn();
    render(<AuctionCard auction={mockAuction} onOpenBidModal={handleOpenModal} />);

    const bidBtn = screen.getByRole("button", { name: /Place a Bid/i });
    fireEvent.click(bidBtn);

    expect(handleOpenModal).toHaveBeenCalledTimes(1);
    expect(handleOpenModal).toHaveBeenCalledWith(mockAuction);
  });

  it("correctly identifies ended auctions in formatTimeLeft", () => {
    const pastDate = new Date(Date.now() - 10000).toISOString();
    const result = formatTimeLeft(pastDate);

    expect(result.ended).toBe(true);
    expect(result.label).toBe("Ended");
  });
});
