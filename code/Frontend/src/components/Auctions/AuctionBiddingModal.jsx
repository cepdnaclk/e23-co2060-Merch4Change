import React, { useEffect, useState } from "react";
import { X, Flame, Trophy, Clock, AlertCircle, History, CheckCircle2 } from "lucide-react";
import { getAuctionBids, placeBid } from "../../services/auctionApi";
import { formatTimeLeft } from "./AuctionCard";

export function AuctionBiddingModal({ auction, isOpen, onClose, onBidSuccess }) {
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentPrice, setCurrentPrice] = useState(auction?.currentPrice || 0);

  const product = auction?.productId || {};
  const increment = auction?.bidIncrement || 10;
  const minRequiredBid = currentPrice + increment;

  useEffect(() => {
    if (!isOpen || !auction?._id) return;

    setCurrentPrice(auction.currentPrice);
    setBidAmount(String(auction.currentPrice + increment));
    setErrorMsg("");
    setSuccessMsg("");
    setLoadingBids(true);

    getAuctionBids(auction._id)
      .then((res) => {
        if (res.success && Array.isArray(res.bids)) {
          setBids(res.bids);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBids(false));
  }, [isOpen, auction, increment]);

  if (!isOpen || !auction) return null;

  const timeLeft = formatTimeLeft(auction.endTime);

  const handleQuickBidClick = (amount) => {
    setBidAmount(String(amount));
    setErrorMsg("");
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = Number(bidAmount);

    if (isNaN(numericAmount) || numericAmount < minRequiredBid) {
      setErrorMsg(`Bid must be at least $${minRequiredBid} ($${currentPrice} + $${increment} minimum increment).`);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await placeBid(auction._id, numericAmount);
      if (res.success) {
        setSuccessMsg(`Bid placed successfully at $${numericAmount}! You are now the high bidder.`);
        setCurrentPrice(numericAmount);
        setBidAmount(String(numericAmount + increment));

        // Refresh bids leaderboard
        const updatedBids = await getAuctionBids(auction._id);
        if (updatedBids.success && Array.isArray(updatedBids.bids)) {
          setBids(updatedBids.bids);
        }

        if (onBidSuccess) {
          onBidSuccess(res.auction);
        }
      } else {
        setErrorMsg(res.message || "Failed to place bid. Please try again.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Error placing bid. Check your coin balance and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
              <Flame size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Place Live Bid</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Clock size={12} /> Ends in: {timeLeft.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Item Banner */}
          <div className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {product.category || "Exclusive"}
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {product.name}
              </h3>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                    Current Highest Bid
                  </span>
                  <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
                    ${currentPrice}
                  </span>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                    Min Increment
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    +${increment}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Bid Form */}
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                Quick Bid Options
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[minRequiredBid, minRequiredBid + 15, minRequiredBid + 40].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickBidClick(amt)}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      Number(bidAmount) === amt
                        ? "border-purple-600 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                Custom Bid Amount (Min: ${minRequiredBid})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  $
                </span>
                <input
                  type="number"
                  min={minRequiredBid}
                  step={1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder={String(minRequiredBid)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Placing Bid..." : `Confirm Bid of $${bidAmount || minRequiredBid}`}
            </button>
          </form>

          {/* Live Bid History Feed */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History size={14} /> Bid History & Leaderboard
            </h4>

            {loadingBids ? (
              <p className="text-xs text-gray-400 text-center py-4">Loading bids...</p>
            ) : bids.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No bids placed yet. Be the first to bid!
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bids.map((b, idx) => (
                  <div
                    key={b._id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {idx === 0 ? (
                        <Trophy size={14} className="text-amber-500" />
                      ) : (
                        <span className="w-3.5 text-center text-gray-400 font-bold">{idx + 1}</span>
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {b.userId?.userName || "Anonymous"}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 text-[10px] font-bold">
                          Leading
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      ${b.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionBiddingModal;
