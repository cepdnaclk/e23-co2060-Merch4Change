import React, { useEffect, useState } from "react";
import { useNavigate, useInRouterContext } from "react-router-dom";
import { Clock, Flame, Trophy } from "lucide-react";

export function formatTimeLeft(endTime) {
  const total = new Date(endTime).getTime() - new Date().getTime();
  if (total <= 0) return { label: "Ended", ended: true };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return { label: `${days}d ${hours}h ${minutes}m`, ended: false };
  }
  return { label: `${hours}h ${minutes}m ${seconds}s`, ended: false };
}

function AuctionCardBase({ auction, onOpenBidModal, navigate }) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.endTime));
  const product = auction.productId || {};

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.endTime]);

  const isLive = auction.status === "active" && !timeLeft.ended;
  const isUpcoming = auction.status === "scheduled" && !timeLeft.ended;

  const handleCardClick = () => {
    if (auction?._id && navigate) {
      navigate(`/marketplace/auction/${auction._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name || "Auction item"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm animate-pulse">
              <Flame size={13} /> LIVE AUCTION
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white shadow-sm">
              <Clock size={13} /> UPCOMING
            </span>
          )}
          {timeLeft.ended && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white shadow-sm">
              ENDED
            </span>
          )}
        </div>

        {/* Countdown pill */}
        <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow">
          <Clock size={13} className="text-amber-400" />
          <span>{timeLeft.label}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            {product.category || "Limited Drop"}
          </span>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 mt-0.5">
            {product.name || "Exclusive Collectible"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {product.description || "Limited edition charity merchandise up for bid."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Current Bid
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${auction.currentPrice}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                High Bidder
              </p>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center justify-end gap-1">
                {auction.currentBidder ? (
                  <>
                    <Trophy size={12} className="text-amber-500" />
                    <span>{auction.currentBidder.userName || "Bidder"}</span>
                  </>
                ) : (
                  <span className="text-gray-400">None yet</span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!isLive}
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenBidModal) {
                onOpenBidModal(auction);
              } else if (auction?._id) {
                navigate(`/marketplace/auction/${auction._id}`);
              }
            }}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
              isLive
                ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer active:scale-[0.98]"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLive ? (
              <>
                <Flame size={15} /> Place a Bid
              </>
            ) : timeLeft.ended ? (
              "Auction Ended"
            ) : (
              "Starts Soon"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AuctionCardWithRouter(props) {
  const navigate = useNavigate();
  return <AuctionCardBase {...props} navigate={navigate} />;
}

export function AuctionCard(props) {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <AuctionCardWithRouter {...props} />;
  }
  return (
    <AuctionCardBase
      {...props}
      navigate={(path) => {
        if (typeof window !== "undefined") window.location.href = path;
      }}
    />
  );
}

export default AuctionCard;
