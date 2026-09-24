import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ProductCard } from "../../src/components/Marketplace/components/ProductCard";
import ProductDetailPage from "../../src/pages/ProductDetail/ProductDetailPage";
import apiClient from "../../src/api/apiClient";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "prod_999" }),
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

describe("ProductCard Navigation & Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProduct = {
    _id: "prod_123",
    name: "Limited Edition Eco Hoodie",
    description: "Made from 100% recycled cotton",
    price: 60,
    stock: 8,
    isLimitedEdition: true,
    imageUrl: "https://example.com/hoodie.jpg",
  };

  it("navigates to product detail page when card is clicked", () => {
    render(
      <MemoryRouter>
        <ProductCard
          product={mockProduct}
          index={0}
          onBuy={vi.fn()}
          isBuying={false}
          coinsFor={(p) => Math.floor(p / 10)}
        />
      </MemoryRouter>
    );

    const title = screen.getByText("Limited Edition Eco Hoodie");
    fireEvent.click(title);

    expect(mockNavigate).toHaveBeenCalledWith("/marketplace/product/prod_123");
  });

  it("stops propagation and calls onBuy without navigating when Buy button is clicked", () => {
    const handleBuy = vi.fn();
    render(
      <MemoryRouter>
        <ProductCard
          product={mockProduct}
          index={0}
          onBuy={handleBuy}
          isBuying={false}
          coinsFor={(p) => Math.floor(p / 10)}
        />
      </MemoryRouter>
    );

    const buyBtn = screen.getByRole("button", { name: /Buy Now/i });
    fireEvent.click(buyBtn);

    expect(handleBuy).toHaveBeenCalledWith(mockProduct);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("ProductDetailPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleProduct = {
    _id: "prod_999",
    name: "Save The Oceans Stainless Bottle",
    description: "Vacuum insulated water bottle supporting marine cleanup.",
    price: 35,
    currency: "USD",
    stock: 12,
    isLimitedEdition: true,
    imageUrl: "https://example.com/bottle.jpg",
    images: ["https://example.com/bottle.jpg", "https://example.com/bottle2.jpg"],
    brandId: {
      brandName: "OceanGuardians",
      logoUrl: "https://example.com/logo.png",
    },
    ownerUserId: {
      userName: "oceanguard",
      firstName: "Ocean",
      lastName: "Guardians",
      isVerified: true,
      role: "charity",
    },
  };

  it("loads and displays full product specifications and details", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("/api/v1/marketplace/products/prod_999")) {
        return Promise.resolve({
          data: {
            success: true,
            data: { product: sampleProduct },
          },
        });
      }
      if (url.includes("/api/v1/profile/me")) {
        return Promise.resolve({
          data: { success: true, data: { user: { firstName: "Test", userName: "tester" } } },
        });
      }
      if (url.includes("/api/v1/marketplace/products")) {
        return Promise.resolve({
          data: { success: true, data: { products: [] } },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <ProductDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Save The Oceans Stainless Bottle")).toBeInTheDocument();
    });

    expect(screen.getByText(/Vacuum insulated water bottle/)).toBeInTheDocument();
    expect(screen.getByText("OceanGuardians")).toBeInTheDocument();
    expect(screen.getByText(/In Stock \(12 available\)/)).toBeInTheDocument();
    expect(screen.getByText(/⚡ Limited Edition/)).toBeInTheDocument();
    expect(screen.getByText("prod_999")).toBeInTheDocument();
  });

  it("updates subtotal when changing quantity", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("/api/v1/marketplace/products/prod_999")) {
        return Promise.resolve({
          data: {
            success: true,
            data: { product: sampleProduct },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <MemoryRouter>
        <ProductDetailPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Save The Oceans Stainless Bottle")).toBeInTheDocument();
    });

    const plusBtn = screen.getByRole("button", { name: "+" });
    fireEvent.click(plusBtn);

    expect(screen.getByText("2")).toBeInTheDocument();
    // Subtotal and button both display $70.00
    expect(screen.getAllByText("$70.00").length).toBeGreaterThanOrEqual(1);
  });
});
