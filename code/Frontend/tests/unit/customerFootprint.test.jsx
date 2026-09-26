import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
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

  const renderComponent = (userId) => {
    return render(
      <MemoryRouter>
        <CustomerFootprint userId={userId} />
      </MemoryRouter>
    );
  };

  it("renders loading screen initially", () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}));
    renderComponent("usr_001");
    expect(screen.getByText(/Loading your purchases and donations.../i)).toBeInTheDocument();
  });

  it("renders empty states when no orders or donations exist", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url === "/api/v1/marketplace/orders") {
        return Promise.resolve({ data: { data: { orders: [] } } });
      }
      if (url === "/api/v1/donations/my") {
        return Promise.resolve({ data: { data: { donations: [] } } });
      }
    });

    renderComponent("usr_001");

    await waitFor(() => {
      expect(screen.getByText(/No purchases recorded for this customer profile yet/i)).toBeInTheDocument();
      expect(screen.getByText(/No donations recorded yet/i)).toBeInTheDocument();
    });
  });

  it("renders product name, quantity, and total price correctly", async () => {
    const mockOrder = {
      _id: "6ab6b5e0b607cd95d7febcf7",
      status: "paid",
      createdAt: "2026-09-25T10:00:00Z",
      totalAmount: 3200,
      currency: "LKR",
      coinsEarned: 320,
      items: [
        {
          productId: "prod_123",
          titleSnapshot: "Ocean Cleanup Organic Hoodie",
          quantity: 1,
          unitPrice: 3200,
        },
      ],
    };

    apiClient.get.mockImplementation((url) => {
      if (url === "/api/v1/marketplace/orders") {
        return Promise.resolve({ data: { data: { orders: [mockOrder] } } });
      }
      if (url === "/api/v1/donations/my") {
        return Promise.resolve({ data: { data: { donations: [] } } });
      }
    });

    renderComponent("usr_001");

    await waitFor(() => {
      expect(screen.getByText("Ocean Cleanup Organic Hoodie")).toBeInTheDocument();
    });

    const orderCard = screen.getByText("Ocean Cleanup Organic Hoodie").closest(".order-footprint-card");
    const withinCard = within(orderCard);

    expect(withinCard.getByText("x1")).toBeInTheDocument();
    expect(withinCard.getByText("LKR 3,200")).toBeInTheDocument();
    expect(withinCard.getByText("LKR 3,200.00")).toBeInTheDocument();
    expect(withinCard.getByText("320")).toBeInTheDocument(); // coins earned
    
    // Check summary grid correctly counts the order and coins
    expect(screen.getByText("Completed Purchases").previousElementSibling.textContent).toBe("1");
    expect(screen.getByText("Coins Earned").previousElementSibling.textContent).toBe("320");
  });

  it("renders donation certificate properly", async () => {
    const mockDonation = {
      _id: "don_123",
      status: "completed",
      createdAt: "2026-09-25T12:00:00Z",
      project: "Ocean Plastic Removal",
      charity: "Ocean Crusaders",
      coinAmount: 150
    };

    apiClient.get.mockImplementation((url) => {
      if (url === "/api/v1/marketplace/orders") {
        return Promise.resolve({ data: { data: { orders: [] } } });
      }
      if (url === "/api/v1/donations/my") {
        return Promise.resolve({ data: { data: { donations: [mockDonation] } } });
      }
    });

    renderComponent("usr_001");

    await waitFor(() => {
      expect(screen.getByText(/Ocean Plastic Removal/i)).toBeInTheDocument();
    });

    const donationCard = screen.getByText(/Ocean Plastic Removal/i).closest(".order-footprint-card");
    const withinCard = within(donationCard);

    expect(withinCard.getByText("COMPLETED")).toBeInTheDocument();
    expect(withinCard.getByText("Ocean Crusaders")).toBeInTheDocument();
    expect(withinCard.getByText("150")).toBeInTheDocument();
    
    // Check summary grid correctly counts the donation
    expect(screen.getByText("Donations Made").previousElementSibling.textContent).toBe("1");
  });
});
