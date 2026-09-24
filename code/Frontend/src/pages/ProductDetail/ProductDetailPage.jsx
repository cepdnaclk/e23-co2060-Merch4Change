import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  Package,
  Sparkles,
  Truck,
  BadgeCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";
import "./ProductDetailPage.css";

function coinsFor(price, qty = 1) {
  return Math.floor((price * qty) / 10);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token, loading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "Guest",
    lastName: "User",
    userName: "guest",
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImg, setSelectedImg] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Load user profile for app shell layout
  useEffect(() => {
    if (authLoading || !token) return;
    apiClient
      .get("/api/v1/profile/me")
      .then((res) => {
        if (res.data?.success && res.data?.data?.user) {
          setProfileData(res.data.data.user);
        }
      })
      .catch(() => {});
  }, [token, authLoading]);

  // Load product details
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setQuantity(1);

    apiClient
      .get(`/api/v1/marketplace/products/${id}`)
      .then((res) => {
        const prod = res.data?.data?.product;
        if (prod) {
          setProduct(prod);
          setSelectedImg(prod.imageUrl || (prod.images && prod.images[0]) || "");
        } else {
          setError("Product not found.");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load product details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Load related products
  useEffect(() => {
    apiClient
      .get("/api/v1/marketplace/products")
      .then((res) => {
        const prods = res.data?.data?.products || [];
        setRelatedProducts(prods.filter((p) => p._id !== id).slice(0, 4));
      })
      .catch(() => {});
  }, [id]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("success", "🔗 Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBuy = async () => {
    if (!token) {
      showToast("error", "Please log in to purchase.");
      navigate("/login");
      return;
    }
    if (!product || product.stock === 0) return;
    if (quantity > product.stock) {
      showToast("error", "Selected quantity exceeds available stock.");
      return;
    }

    setIsCheckingOut(true);
    try {
      const res = await apiClient.post("/api/v1/marketplace/checkout", {
        items: [{ productId: product._id, quantity }],
      });
      const data = res.data;
      if (data.success) {
        if (data.data?.checkoutUrl) {
          window.location.href = data.data.checkoutUrl;
          return;
        }

        const earned =
          data.data?.order?.coinsEarned ??
          data.data?.coinsEarned ??
          coinsFor(product.price, quantity);
        showToast(
          "success",
          `🎉 Order placed! You earned ${earned} MerchCoins.`
        );
        setProduct((prev) => ({
          ...prev,
          stock: Math.max(0, prev.stock - quantity),
        }));
        setQuantity(1);
      } else {
        showToast("error", `❌ ${data.message || "Checkout failed."}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Checkout failed. Please try again.";
      showToast("error", `❌ ${msg}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleTabChange = useCallback(
    (tab) => {
      if (tab === "marketplace") {
        navigate("/marketplace");
        return;
      }
      if (tab === "feed") {
        navigate("/home");
        return;
      }
      navigate(`/home?tab=${tab}`);
    },
    [navigate]
  );

  const imagesList = product
    ? Array.from(
        new Set(
          [product.imageUrl, ...(product.images || [])].filter(Boolean)
        )
      )
    : [];

  const seller = product?.ownerUserId || {};
  const brand = product?.brandId || {};
  const sellerDisplayName =
    brand.brandName ||
    (seller.firstName && seller.lastName
      ? `${seller.firstName} ${seller.lastName}`
      : seller.userName || "Verified Creator");

  return (
    <div className={`luminous-app ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <TopNavbar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        profileData={profileData}
        activeTab="marketplace"
        onTabChange={handleTabChange}
      />

      <div className="lum-layout">
        <Sidebar
          profileData={profileData}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        <main className="lum-main-content home-main-content">
          <div className="pdp-container">
            {/* Toast */}
            {toast && (
              <div
                className={`pdp-toast ${
                  toast.type === "success" ? "pdp-toast-success" : "pdp-toast-error"
                }`}
              >
                {toast.text}
              </div>
            )}

            {/* Navigation & Breadcrumb */}
            <div className="pdp-nav-bar">
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="pdp-back-btn"
              >
                <ArrowLeft size={16} />
                <span>Back to Marketplace</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="pdp-back-btn"
                  title="Share product"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                  <span>{copied ? "Copied" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loading product details...
                </p>
              </div>
            )}

            {/* Error State */}
            {!loading && (error || !product) && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {error || "Product Not Found"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 text-sm">
                  The product drop you are looking for may have been removed or is temporarily unavailable.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition"
                >
                  Return to Marketplace
                </Link>
              </div>
            )}

            {/* Product Main Display */}
            {!loading && product && (
              <>
                <div className="pdp-main-grid">
                  {/* Left Column: Gallery */}
                  <div className="pdp-gallery-wrap">
                    <div className="pdp-main-img-box">
                      <div className="pdp-badges-overlay">
                        {product.isLimitedEdition && (
                          <span className="pdp-badge-limited">⚡ Limited Edition</span>
                        )}
                        <span className="pdp-badge-coins">
                          🪙 +{coinsFor(product.price)} MerchCoins
                        </span>
                      </div>

                      {selectedImg ? (
                        <img
                          src={selectedImg}
                          alt={product.name}
                          className="pdp-main-img"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800">
                          <Package size={48} className="stroke-1 mb-2" />
                          <span className="text-xs">No image preview</span>
                        </div>
                      )}
                    </div>

                    {/* Thumbnails strip */}
                    {imagesList.length > 1 && (
                      <div className="pdp-thumb-strip">
                        {imagesList.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`pdp-thumb-btn ${selectedImg === img ? "active" : ""}`}
                            onClick={() => setSelectedImg(img)}
                          >
                            <img
                              src={img}
                              alt={`${product.name} preview ${i + 1}`}
                              className="pdp-thumb-img"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Guarantees Box */}
                    <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <Truck size={18} className="text-purple-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Global Delivery</p>
                          <p className="text-[11px] text-gray-500">Tracked shipping</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                        <ShieldCheck size={18} className="text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">100% Impact</p>
                          <p className="text-[11px] text-gray-500">Funds verified causes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Product Info & Actions */}
                  <div className="pdp-info-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold tracking-wider uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                          {product.isLimitedEdition ? "Special Drop" : "Merchandise"}
                        </span>
                        {product.currency && (
                          <span className="text-xs font-medium text-gray-400">
                            {product.currency}
                          </span>
                        )}
                      </div>

                      <h1 className="pdp-product-title">{product.name}</h1>
                    </div>

                    {/* Price and Stock status */}
                    <div className="pdp-price-row">
                      <span className="pdp-price-val">
                        ${product.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="pdp-currency">{product.currency || "USD"}</span>

                      {product.stock === 0 ? (
                        <span className="pdp-stock-tag pdp-stock-out">Sold Out</span>
                      ) : product.stock <= 5 ? (
                        <span className="pdp-stock-tag pdp-stock-low">
                          🔥 Only {product.stock} left in stock!
                        </span>
                      ) : (
                        <span className="pdp-stock-tag pdp-stock-ok">
                          ✓ In Stock ({product.stock} available)
                        </span>
                      )}
                    </div>

                    {/* Coins Incentive Banner */}
                    <div className="pdp-coins-incentive">
                      <Sparkles size={18} className="text-purple-600 flex-shrink-0" />
                      <span>
                        Earn <strong>+{coinsFor(product.price, quantity)} MerchCoins</strong> on this purchase to donate or unlock rewards!
                      </span>
                    </div>

                    {/* Creator / Brand Card */}
                    <div className="pdp-creator-card">
                      <div className="pdp-creator-left">
                        {seller.profileImageUrl || brand.logoUrl ? (
                          <img
                            src={seller.profileImageUrl || brand.logoUrl}
                            alt={sellerDisplayName}
                            className="pdp-creator-avatar"
                          />
                        ) : (
                          <div className="pdp-creator-avatar flex items-center justify-center font-bold text-purple-600 text-sm">
                            {sellerDisplayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="pdp-creator-name">
                            <span>{sellerDisplayName}</span>
                            {(seller.isVerified || brand.brandName) && (
                              <BadgeCheck size={16} className="text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="pdp-creator-role">
                            {seller.role === "charity"
                              ? "Verified Charity Partner"
                              : seller.userName
                              ? `@${seller.userName}`
                              : "Verified Merchant"}
                          </p>
                        </div>
                      </div>

                      {seller.userName && (
                        <Link
                          to={`/profile/${seller.userName}`}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ExternalLink size={13} />
                        </Link>
                      )}
                    </div>

                    {/* Detailed Description */}
                    <div className="pdp-desc-section">
                      <h3 className="pdp-section-h">About this drop</h3>
                      <p className="pdp-desc-text">{product.description}</p>
                    </div>

                    {/* Checkout & Quantity Box */}
                    <div className="pdp-checkout-box">
                      <div className="pdp-qty-row">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Quantity
                        </span>
                        <div className="pdp-qty-control">
                          <button
                            type="button"
                            className="pdp-qty-btn"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            disabled={quantity <= 1 || product.stock === 0 || isCheckingOut}
                          >
                            -
                          </button>
                          <span className="pdp-qty-val">{quantity}</span>
                          <button
                            type="button"
                            className="pdp-qty-btn"
                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                            disabled={quantity >= product.stock || product.stock === 0 || isCheckingOut}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400 font-medium">Subtotal</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ${(product.price * quantity).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="pdp-buy-btn"
                        onClick={handleBuy}
                        disabled={product.stock === 0 || isCheckingOut}
                      >
                        {isCheckingOut ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing Order...</span>
                          </div>
                        ) : product.stock === 0 ? (
                          "Sold Out"
                        ) : (
                          <>
                            <span>🛒 Complete Purchase</span>
                            <span>•</span>
                            <span>${(product.price * quantity).toFixed(2)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specifications & Transparency Table */}
                <div className="pdp-specs-grid">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-purple-600" size={20} />
                    <span>Product Specifications & Impact Transparency</span>
                  </h3>

                  <table className="pdp-specs-table">
                    <tbody>
                      <tr>
                        <td className="pdp-spec-label">Item / Product ID</td>
                        <td className="pdp-spec-val font-mono text-xs">{product._id}</td>
                      </tr>
                      <tr>
                        <td className="pdp-spec-label">Release Type</td>
                        <td className="pdp-spec-val">
                          {product.isLimitedEdition ? "Limited Edition Collector Drop" : "Standard Merchandise"}
                        </td>
                      </tr>
                      <tr>
                        <td className="pdp-spec-label">Currency</td>
                        <td className="pdp-spec-val">{product.currency || "USD"}</td>
                      </tr>
                      <tr>
                        <td className="pdp-spec-label">Inventory Status</td>
                        <td className="pdp-spec-val">
                          {product.stock > 0 ? `${product.stock} units remaining` : "Depleted / Sold Out"}
                        </td>
                      </tr>
                      <tr>
                        <td className="pdp-spec-label">Impact Model</td>
                        <td className="pdp-spec-val text-purple-600 dark:text-purple-400">
                          100% of proceeds directly fund verified social causes and community projects
                        </td>
                      </tr>
                      <tr>
                        <td className="pdp-spec-label">Rewards Program</td>
                        <td className="pdp-spec-val">
                          Earn 1 MerchCoin for every $10 spent
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* More From Marketplace Section */}
                {relatedProducts.length > 0 && (
                  <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        More Drops You Might Like
                      </h3>
                      <Link
                        to="/marketplace"
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Explore All →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      {relatedProducts.map((rel) => (
                        <div
                          key={rel._id}
                          onClick={() => navigate(`/marketplace/product/${rel._id}`)}
                          className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col"
                        >
                          <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                            {rel.imageUrl ? (
                              <img
                                src={rel.imageUrl}
                                alt={rel.name}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={32} />
                              </div>
                            )}
                            <span className="absolute top-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-yellow-400 backdrop-blur-sm">
                              🪙 +{coinsFor(rel.price)}
                            </span>
                          </div>
                          <div className="p-3.5 flex flex-col flex-grow justify-between">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                {rel.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {rel.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                                ${rel.price?.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {rel.stock > 0 ? `${rel.stock} left` : "Sold out"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
