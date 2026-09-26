import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CustomerFootprint from "../../src/pages/UserProfile/Footprint/CustomerFootprint";
import apiClient from "../../src/api/apiClient";

vi.mock("../../src/api/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("CustomerFootprint Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading screen initially", () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}));
    render(<CustomerFootprint userId="usr_001" />);
    expect(screen.getByText(/loading purchase footprint/i)).toBeInTheDocument();
  });

  it("renders product name from titleSnapshot and line price from unitPrice", async () => {
    const mockOrder = {
      _id: "6ab6b5e0b607cd95d7febcf7",
      stripePaymentIntentId: "pi_3PxxxTest123",
      status: "paid",
      createdAt: "2026-09-25T10:00:00Z",
      totalAmount: 3200,
      donationAmount: 480,
      cause: "Social & Environmental Sustainability Relief",
      items: [
        {
          productId: "prod_123",
          titleSnapshot: "Ocean Cleanup Organic Hoodie",
          quantity: 1,
          unitPrice: 3200,
        },
      ],
    };

    apiClient.get.mockResolvedValueOnce({
      data: { orders: [mockOrder] },
    });

    render(<CustomerFootprint userId="usr_001" />);

    await waitFor(() => {
      expect(screen.getByText("Ocean Cleanup Organic Hoodie")).toBeInTheDocument();
    });

    // Scope to this order's card: with only one order in the list, the
    // aggregate "Direct Impact Generated" summary widget renders the same
    // LKR 480.00 value, so an unscoped getByText would match two elements.
    const orderCard = screen
      .getByText("Ocean Cleanup Organic Hoodie")
      .closest(".order-footprint-card");
    const withinCard = within(orderCard);

    expect(withinCard.getByText("x1")).toBeInTheDocument();
    expect(withinCard.getAllByText(/3,200/)[0]).toBeInTheDocument();
    expect(withinCard.getByText(/LKR 480.00/)).toBeInTheDocument();
    expect(withinCard.getByText("pi_3PxxxTest123")).toBeInTheDocument();
    expect(
      withinCard.getByText(/Verified on Merch4Change Public Social Ledger/i)
    ).toBeInTheDocument();
  });

  it("renders verified document link only when an authentic receiptUrl exists", async () => {
    const mockOrderWithReceipt = {
      _id: "6ab4b852a74c36fdc922a95a",
      stripePaymentIntentId: "pi_3PyyyTest456",
      status: "paid",
      totalAmount: 4200,
      receiptUrl: "https://pay.stripe.com/receipts/acct_test/rcpt_valid_4200",
      items: [
        {
          productId: "prod_456",
          titleSnapshot: "Bamboo Reusable Water Bottle",
          quantity: 1,
          unitPrice: 4200,
        },
      ],
    };

    apiClient.get.mockResolvedValueOnce({
      data: { orders: [mockOrderWithReceipt] },
    });

    render(<CustomerFootprint userId="usr_001" />);

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /view verified proof document/i });
      expect(link).toHaveAttribute(
        "href",
        "https://pay.stripe.com/receipts/acct_test/rcpt_valid_4200"
      );
    });
  });

  it("falls back to default seeded orders if the API call fails", async () => {
    apiClient.get.mockRejectedValue(new Error("Network Error"));

    render(<CustomerFootprint userId="usr_001" />);

    await waitFor(() => {
      expect(screen.getByText("Ocean Cleanup Organic Hoodie")).toBeInTheDocument();
      expect(screen.getByText("Bamboo Reusable Water Bottle")).toBeInTheDocument();
    });
  });
});