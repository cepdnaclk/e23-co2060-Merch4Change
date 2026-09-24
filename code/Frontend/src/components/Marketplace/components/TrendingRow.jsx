import React from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "./ProductCard";

export function TrendingRow({ products, onBuy, checkingOut, coinsFor }) {
  const navigate = useNavigate();
  if (products.length === 0) return null;
  return (
    <div className="mk-section">
      <div className="mk-section-header">
        <span className="mk-section-icon">🔥</span>
        <h3 className="mk-section-title">Trending Now</h3>
        <span className="mk-section-sub">Most viewed drops this hour</span>
        <span className="mk-view-all">View All →</span>
      </div>
      <div className="mk-trending-row">
        {products.map((product, i) => (
          <div
            key={product._id}
            className="mk-trending-card cursor-pointer"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => product._id && navigate(`/marketplace/product/${product._id}`)}
          >
            <div className="mk-trending-img">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="mk-card-img-placeholder" />
              )}
              <div className="mk-card-img-overlay" />
              <span className="mk-coins-badge">🪙 +{coinsFor(product.price)} coins</span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="mk-hot-tag">🔥</span>
              )}
            </div>
            <div className="mk-trending-body">
              <h4 className="mk-product-name hover:text-purple-600 transition-colors">
                {product.name}
              </h4>
              <div className="mk-trending-footer">
                <span className="mk-price">${product.price?.toLocaleString()}</span>
                <button
                  type="button"
                  className={`mk-trending-buy ${checkingOut === product._id ? "mk-buy-loading" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy(product);
                  }}
                  disabled={product.stock === 0 || checkingOut === product._id}
                >
                  {checkingOut === product._id ? (
                    <span className="mk-btn-spinner" />
                  ) : "Buy"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
