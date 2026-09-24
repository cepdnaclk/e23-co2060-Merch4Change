import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Check,
  Flame,
  Clock,
  Trophy,
  ShieldCheck,
  Package,
  Sparkles,
  Coins,
  History,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";
import { getAuction, getAuctionBids, placeBid } from "../../services/auctionApi";
import "./AuctionDetailPage.css";

function formatTimeLeft(endTime) {
  const total = new Date(endTime).getTime() - new Date().getTime();
  if (total <= 0) return { label: "Ended", ended: true };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return { label: `${days}d ${hours}h ${minutes}m ${seconds}s`, ended: false };
  }
  return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
}

function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken: token, loading: authLoading } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: "Guest",
    lastName: "User",
    userName: "guest",
    coinBalance: 0,
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImg, setSelectedImg] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ label: "Loading...", ended: false });

  // Load user profile for coin balance and app shell
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

  // Load auction & bids
  const loadAuctionData = useCallback(async () => {
    if (!id) return;
    try {
      const [auctionRes, bidsRes] = await Promise.allSettled([
        getAuction(id),
        getAuctionBids(id),
      ]);

      if (auctionRes.status === "fulfilled" && auctionRes.value?.success) {
        const auc = auctionRes.value.auction;
        setAuction(auc);
        setTimeLeft(formatTimeLeft(auc.endTime));

        const prod = auc.productId || {};
        const cover = (prod.images && prod.images[0]) || prod.imageUrl || "";
        setSelectedImg((prev) => prev || cover);

        const minNext = auc.currentPrice + (auc.bidIncrement || 5);
        setBidAmount((prev) => (!prev ? String(minNext) : prev));
      } else if (auctionRes.status === "fulfilled" && !auctionRes.value?.success) {
        setError(auctionRes.value.message || "Auction not found.");
      } else {
        setError("Failed to load auction.");
      }

      if (bidsRes.status === "fulfilled" && bidsRes.value?.success) {
        setBids(bidsRes.value.bids ?? []);
      }
    } catch (err) {
      setError("Failed to load auction.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadAuctionData();

    // Auto-poll auction data every 5 seconds for live bid updates
    const pollInterval = setInterval(() => {
      loadAuctionData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [loadAuctionData]);

  // Live timer tick
  useEffect(() => {
    if (!auction?.endTime) return;
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction?.endTime]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("success", "🔗 Auction link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const minNextBid = auction ? auction.currentPrice + (auction.bidIncrement || 5) : 5;

  const handleQuickAdd = (inc) => {
    const current = Number(bidAmount) || minNextBid;
    setBidAmount(String(current + inc));
    setBidError("");
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError("");

    if (!token) {
      showToast("error", "Please log in to place a bid.");
      navigate("/login");
      return;
    }

    const numAmount = Number(bidAmount);
    if (!numAmount || isNaN(numAmount) || numAmount < minNextBid) {
      setBidError(`Minimum valid bid is $${minNextBid}`);
      return;
    }

    const userBalance = profileData?.coinBalance || 0;
    if (userBalance < numAmount) {
      setBidError(`Insufficient coin balance. You have ${userBalance} coins.`);
      return;
    }

    setIsBidding(true);
    try {
      const res = await placeBid(auction._id, numAmount);
      if (res?.success) {
        showToast("success", `🎉 High bid placed successfully at $${numAmount}!`);
        // Deduct from local profileData coins
        setProfileData((prev) => ({
          ...prev,
          coinBalance: Math.max(0, (prev.coinBalance || 0) - numAmount),
        }));
        // Reload fresh auction & bids
        await loadAuctionData();
        const nextMin = numAmount + (auction.bidIncrement || 5);
        setBidAmount(String(nextMin));
      } else {
        setBidError(res?.message || "Failed to place bid.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to place bid.";
      setBidError(msg);
    } finally {
      setIsBidding(false);
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

  const product = auction?.productId || {};
  const imagesList = Array.from(
    new Set(
      [...(product.images || []), product.imageUrl].filter(Boolean)
    )
  );

  const isLive = auction?.status === "active" && !timeLeft.ended;
  const isUpcoming = auction?.status === "scheduled" && !timeLeft.ended;
  const isEnded = auction?.status === "ended" || timeLeft.ended;

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
          <div className="adp-container">
            {/* Toast */}
            {toast && (
              <div
                className={`adp-toast ${
                  toast.type === "success" ? "adp-toast-success" : "adp-toast-error"
                }`}
              >
                {toast.text}
              </div>
            )}

            {/* Nav & Action Bar */}
            <div className="adp-nav-bar">
              <button
                type="button"
                onClick={() => navigate("/marketplace")}
                className="adp-back-btn"
              >
                <ArrowLeft size={16} />
                <span>Back to Marketplace</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="adp-back-btn"
                title="Share auction"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                <span>{copied ? "Copied" : "Share"}</span>
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loading live auction details...
                </p>
              </div>
            )}

            {/* Error State */}
            {!loading && (error || !auction) && (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {error || "Auction Not Found"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 text-sm">
                  The charity drop you are looking for may have been concluded or is temporarily unavailable.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition"
                >
                  Return to Marketplace
                </Link>
              </div>
            )}

            {/* Main Auction Layout: Left Content (65%) + Right Side Bids List (35%) */}
            {!loading && auction && (
              <div className="adp-main-layout">
                {/* Left Column: Product & Bidding */}
                <div className="adp-content-card">
                  {/* Gallery */}
                  <div>
                    <div className="adp-img-box">
                      {selectedImg ? (
                        <img
                          src={selectedImg}
                          alt={product.name || "Auction drop"}
                          className="adp-main-img"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <Package size={48} className="stroke-1 mb-2" />
                          <span className="text-xs">No image preview</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-md animate-pulse">
                            <Flame size={14} /> LIVE AUCTION
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                            <Clock size={14} /> STARTS SOON
                          </span>
                        )}
                        {isEnded && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-600 text-white shadow-md">
                            AUCTION CONCLUDED
                          </span>
                        )}
                      </div>

                      {/* Countdown badge */}
                      <div className="adp-timer-badge">
                        <Clock size={15} className="text-amber-400" />
                        <span>{timeLeft.label}</span>
                      </div>
                    </div>

                    {/* Thumbnail Switcher */}
                    {imagesList.length > 1 && (
                      <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                        {imagesList.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImg(img)}
                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition ${
                              selectedImg === img
                                ? "border-purple-600 ring-2 ring-purple-600/30"
                                : "border-transparent opacity-75 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title & Category */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                        {product.category || "Charity Exclusive"}
                      </span>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={12} /> 100% Impact
                      </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                      {product.name || "Exclusive Charity Drop"}
                    </h1>
                  </div>

                  {/* Bid Stats Grid */}
                  <div className="adp-stats-grid">
                    <div className="adp-stat-box">
                      <span className="adp-stat-label">Current Bid</span>
                      <span className="adp-stat-val adp-stat-highlight">
                        ${auction.currentPrice}
                      </span>
                    </div>

                    <div className="adp-stat-box">
                      <span className="adp-stat-label">Starting Price</span>
                      <span className="adp-stat-val text-gray-500 dark:text-gray-400">
                        ${auction.startPrice}
                      </span>
                    </div>

                    <div className="adp-stat-box">
                      <span className="adp-stat-label">Highest Bidder</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Trophy size={16} className="text-amber-500 flex-shrink-0" />
                        <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                          {auction.currentBidder?.userName || "None yet"}
                        </span>
                      </div>
                    </div>

                    <div className="adp-stat-box">
                      <span className="adp-stat-label">Total Bids</span>
                      <span className="adp-stat-val text-gray-800 dark:text-gray-200">
                        {bids.length}
                      </span>
                    </div>
                  </div>

                  {/* In-Page Bidding Card */}
                  {isLive && (
                    <div className="adp-bidding-card">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-purple-900 dark:text-purple-200">
                          <TrendingUp size={16} className="text-purple-600" />
                          <span>Place Your Bid</span>
                        </div>
                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <Coins size={14} className="text-amber-500" />
                          <span>
                            Your Balance: <strong>{profileData?.coinBalance || 0} MerchCoins</strong>
                          </span>
                        </div>
                      </div>

                      <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
                        {/* Quick increments */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500 font-medium">Quick Bid:</span>
                          {[5, 10, 25, 50, 100].map((inc) => (
                            <button
                              key={inc}
                              type="button"
                              onClick={() => handleQuickAdd(inc)}
                              className="adp-bid-chip"
                            >
                              +${inc}
                            </button>
                          ))}
                        </div>

                        {/* Input & Button */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                              $
                            </span>
                            <input
                              type="number"
                              min={minNextBid}
                              step="1"
                              value={bidAmount}
                              onChange={(e) => {
                                setBidAmount(e.target.value);
                                setBidError("");
                              }}
                              placeholder={`Min $${minNextBid}`}
                              className="w-full pl-8 pr-3 py-3 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isBidding || !isLive}
                            className="adp-bid-btn sm:w-auto sm:px-8"
                          >
                            {isBidding ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Bidding...</span>
                              </div>
                            ) : (
                              <>
                                <Flame size={18} />
                                <span>Place High Bid</span>
                              </>
                            )}
                          </button>
                        </div>

                        {bidError && (
                          <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                            {bidError}
                          </p>
                        )}

                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          * Minimum required next bid is <strong>${minNextBid}</strong> (Increment: ${auction.bidIncrement || 5}). Bids deduct from your MerchCoins balance and are automatically escrow-refunded if you are outbid.
                        </p>
                      </form>
                    </div>
                  )}

                  {/* Ended Banner */}
                  {isEnded && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-center">
                      <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">
                        Auction Successfully Concluded
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        Winning Bidder:{" "}
                        <strong className="text-purple-600 dark:text-purple-400">
                          {auction.currentBidder?.userName || "None"}
                        </strong>{" "}
                        with a final hammer price of <strong>${auction.currentPrice}</strong>.
                      </p>
                    </div>
                  )}

                  {/* Product Story / Description */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      About This Charity Item
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {product.description ||
                        "This exclusive piece was donated to raise essential funding for verified non-profit initiatives through Merch4Change. 100% of proceeds go towards making an immediate impact."}
                    </p>
                  </div>

                  {/* Specifications & Transparency */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Drop Specifications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Auction ID</span>
                        <span className="font-mono text-gray-900 dark:text-white">{auction._id}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Min Increment</span>
                        <span className="font-bold text-gray-900 dark:text-white">${auction.bidIncrement || 5}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">Start Time</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(auction.startTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500">End Time</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(auction.endTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: List of Last Bids (Side Panel) */}
                <aside className="adp-side-panel">
                  <div className="adp-side-head">
                    <div className="flex items-center gap-2">
                      <History size={18} className="text-purple-600" />
                      <h3 className="font-bold text-base text-gray-900 dark:text-white">
                        Live Bids History
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {bids.length} {bids.length === 1 ? "Bid" : "Bids"}
                    </span>
                  </div>

                  {/* Bids List */}
                  <div className="adp-bids-list">
                    {bids.length === 0 ? (
                      <div className="text-center py-12 px-4 text-gray-400">
                        <Trophy size={32} className="mx-auto mb-2 stroke-1 opacity-50" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          No bids placed yet
                        </p>
                        <p className="text-xs mt-1">
                          Be the first to place a bid and claim the high spot!
                        </p>
                      </div>
                    ) : (
                      bids.map((b, idx) => {
                        const bidder = b.userId || {};
                        const isTop = idx === 0;
                        const bidderName = bidder.userName || bidder.firstName || "Anonymous";
                        const avatar = bidder.profileImageUrl || bidder.avatarUrl;

                        let statusCls = "adp-status-outbid";
                        let statusText = "Outbid";
                        if (isTop) {
                          if (isEnded) {
                            statusCls = "adp-status-won";
                            statusText = "Winner";
                          } else {
                            statusCls = "adp-status-winning";
                            statusText = "Winning";
                          }
                        }

                        return (
                          <div
                            key={b._id || idx}
                            className={`adp-bid-item ${isTop ? "adp-bid-item-top" : ""}`}
                          >
                            <div className="adp-bidder-left">
                              <span
                                className={`adp-rank-pill ${
                                  isTop ? "adp-rank-pill-top" : ""
                                }`}
                              >
                                {isTop ? "👑" : `#${idx + 1}`}
                              </span>

                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={bidderName}
                                  className="adp-bidder-avatar"
                                />
                              ) : (
                                <div className="adp-bidder-avatar flex items-center justify-center font-bold text-xs text-purple-600 bg-purple-50 dark:bg-purple-950">
                                  {bidderName.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="adp-bidder-info">
                                <span className="adp-bidder-name">
                                  @{bidderName}
                                </span>
                                <span className="adp-bid-time">
                                  {formatRelativeTime(b.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="adp-bidder-right">
                              <span className="adp-bid-amount">
                                ${b.amount?.toLocaleString()}
                              </span>
                              <span className={`adp-bid-status-pill ${statusCls}`}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 text-center">
                    Bids are updated in real-time. Highest active bid at time expiration wins.
                  </div>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
