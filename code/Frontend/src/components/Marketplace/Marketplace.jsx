import { useEffect, useState } from "react";
import "./Marketplace.css";
import { HeroSection } from "./components/HeroSection";
import { FlashBanner } from "./components/FlashBanner";
import { FilterBar } from "./components/FilterBar";
import { TrendingRow } from "./components/TrendingRow";
import { ProductSection } from "./components/ProductSection";
import { ProductCard } from "./components/ProductCard";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";
import { AuctionCard } from "../Auctions/AuctionCard";
import { AuctionBiddingModal } from "../Auctions/AuctionBiddingModal";
import { listAuctions } from "../../services/auctionApi";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function coinsFor(price) {
  return Math.floor(price / 10);
}

const FILTERS = ["All", "Auctions", "In Stock", "Limited", "Trending"];

import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");
  const { accessToken: token } = useAuth();

  useEffect(() => {
    Promise.allSettled([
      apiClient.get("/api/v1/marketplace/products"),
      listAuctions({ status: "all" }),
    ])
      .then(([productsRes, auctionsRes]) => {
        if (productsRes.status === "fulfilled") {
          setProducts(productsRes.value.data?.data?.products ?? []);
        } else {
          showToast("error", "Could not load products.");
        }

        if (auctionsRes.status === "fulfilled" && auctionsRes.value?.success) {
          setAuctions(auctionsRes.value.auctions ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleBuy(product) {
    if (!token) { showToast("error", "Please log in to purchase."); return; }
    if (product.stock === 0) return;

    setCheckingOut(product._id);
    try {
      const res = await apiClient.post("/api/v1/marketplace/checkout", { items: [{ productId: product._id, quantity: 1 }] });
      const data = res.data;
      if (data.success) {
        if (data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
          return;
        }
        const coins = data.data?.coinsEarned ?? data.data?.order?.coinsEarned ?? coinsFor(product.price);
        showToast("success", `✅ Purchased! You earned ${coins} coins.`);
        setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, stock: p.stock - 1 } : p));
      } else {
        showToast("error", `❌ ${data.message || "Checkout failed."}`);
      }
    } catch {
      showToast("error", "❌ Network error. Try again.");
    } finally {
      setCheckingOut(null);
    }
  }

  const featured = products.filter(p => p.isLimitedEdition && p.stock > 0);
  const trending = products.filter(p => p.stock <= 20 && p.stock > 0 && !p.isLimitedEdition);
  const regular = products.filter(p => p.stock > 20);
  const heroProduct = featured[0] || products[0];

  const getFiltered = () => {
    if (filter === "In Stock") return products.filter(p => p.stock > 0);
    if (filter === "Limited") return products.filter(p => p.isLimitedEdition);
    if (filter === "Trending") return products.filter(p => p.stock <= 20 && p.stock > 0);
    return products;
  };

  const handleBidSuccess = (updatedAuction) => {
    setAuctions((prev) =>
      prev.map((auc) => (auc._id === updatedAuction._id ? updatedAuction : auc))
    );
    showToast("success", `🎉 High bid placed at $${updatedAuction.currentPrice}!`);
  };

  const filtered = getFiltered();
  const showSections = filter === "All";

  return (
    <div className="mk-root">

      {/* Toast */}
      {toast && (
        <div className={`mk-toast ${toast.type === "success" ? "mk-toast-success" : "mk-toast-error"}`}>
          {toast.text}
        </div>
      )}

      {/* Hero */}
      {heroProduct && (
        <HeroSection
          heroProduct={heroProduct}
          onBuy={handleBuy}
          checkingOut={checkingOut}
          coinsFor={coinsFor}
        />
      )}

      {/* Flash banner */}
      <FlashBanner />

      {/* Filter bar */}
      <FilterBar filter={filter} onFilterChange={setFilter} filters={FILTERS} />

      {/* Loading */}
      {loading && <LoadingState />}

      {/* Empty */}
      {!loading && filter !== "Auctions" && filtered.length === 0 && <EmptyState filter={filter} />}

      {/* Sectioned view */}
      {!loading && showSections && (
        <>
          {auctions.length > 0 && (
            <div className="mk-section mb-6">
              <div className="mk-section-head flex items-center justify-between">
                <h2 className="mk-section-title">⚡ Live Charity Auctions</h2>
                <button
                  type="button"
                  onClick={() => setFilter("Auctions")}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  View All ({auctions.length}) →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
                {auctions.slice(0, 4).map((auc) => (
                  <AuctionCard
                    key={auc._id}
                    auction={auc}
                    onOpenBidModal={(a) => setSelectedAuction(a)}
                  />
                ))}
              </div>
            </div>
          )}
          <TrendingRow products={trending} onBuy={handleBuy} checkingOut={checkingOut} coinsFor={coinsFor} />
          <ProductSection title="Featured Drops" icon="⭐" products={featured} onBuy={handleBuy} checkingOut={checkingOut} startIndex={0} coinsFor={coinsFor} />
          <ProductSection title="Curated Marketplace" icon="🛍️" products={regular} onBuy={handleBuy} checkingOut={checkingOut} startIndex={featured.length} coinsFor={coinsFor} />
        </>
      )}

      {/* Auctions filter view */}
      {!loading && filter === "Auctions" && (
        <div className="mk-section">
          <div className="mk-section-head flex items-center justify-between mb-4">
            <h2 className="mk-section-title">⚡ Live Charity Auctions & Drops</h2>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/40 px-2.5 py-1 rounded-full">
              {auctions.length} Drops
            </span>
          </div>

          {auctions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No live auctions right now. Check back soon for the next exclusive drop!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {auctions.map((auc) => (
                <AuctionCard
                  key={auc._id}
                  auction={auc}
                  onOpenBidModal={(a) => setSelectedAuction(a)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtered flat view */}
      {!loading && !showSections && filter !== "Auctions" && filtered.length > 0 && (
        <div className="mk-grid">
          {filtered.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} onBuy={handleBuy} isBuying={checkingOut === product._id} coinsFor={coinsFor} />
          ))}
        </div>
      )}

      {/* Bidding Modal */}
      <AuctionBiddingModal
        auction={selectedAuction}
        isOpen={Boolean(selectedAuction)}
        onClose={() => setSelectedAuction(null)}
        onBidSuccess={handleBidSuccess}
      />

    </div>
  );
}
