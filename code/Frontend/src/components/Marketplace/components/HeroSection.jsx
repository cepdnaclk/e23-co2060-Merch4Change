import React from "react";
import { useNavigate } from "react-router-dom";

export function HeroSection({ heroProduct, onBuy, checkingOut, coinsFor }) {
  const navigate = useNavigate();

  return (
    <div className="mk-hero">
      {heroProduct.imageUrl && <img src={heroProduct.imageUrl} alt={heroProduct.name} className="mk-hero-bg" />}
      <div className="mk-hero-overlay" />
      <div className="mk-hero-content">
        <div className="mk-hero-left">
          <div className="mk-hero-tag">
            <span className="mk-hero-dot" />
            {heroProduct.isLimitedEdition ? "LIMITED DROP" : "FEATURED DROP"}
          </div>
          <h1
            className="mk-hero-title cursor-pointer hover:text-purple-300 transition-colors"
            onClick={() => heroProduct._id && navigate(`/marketplace/product/${heroProduct._id}`)}
          >
            {heroProduct.name}
          </h1>
          <p className="mk-hero-sub">{heroProduct.description}</p>
          <div className="mk-hero-actions">
            <button
              type="button"
              className="mk-hero-buy"
              onClick={() => onBuy(heroProduct)}
              disabled={heroProduct.stock === 0 || checkingOut === heroProduct._id}
            >
              {checkingOut === heroProduct._id ? "Processing..." : "🛒 Buy Now"}
            </button>
            <button
              type="button"
              className="mk-filter-pill font-bold text-xs"
              onClick={() => heroProduct._id && navigate(`/marketplace/product/${heroProduct._id}`)}
            >
              View Details →
            </button>
            <span className="mk-hero-price">${heroProduct.price?.toLocaleString()}</span>
            <span className="mk-hero-coins">🪙 +{coinsFor(heroProduct.price)} coins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
