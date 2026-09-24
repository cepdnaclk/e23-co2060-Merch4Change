import React from "react";
import { useNavigate } from "react-router-dom";

function stockLabel(stock) {
  if (stock === 0) return { text: "Sold out", cls: "mk-stock-out" };
  if (stock <= 5) return { text: `Only ${stock} left`, cls: "mk-stock-low" };
  if (stock <= 20) return { text: `${stock} left`, cls: "mk-stock-low" };
  return { text: "In stock", cls: "mk-stock-ok" };
}

export function ProductCard({ product, index, onBuy, isBuying, coinsFor }) {
  const navigate = useNavigate();
  const stock = stockLabel(product.stock);
  const coins = coinsFor(product.price);
  const soldOut = product.stock === 0;

  const handleCardClick = () => {
    if (product?._id) {
      navigate(`/marketplace/product/${product._id}`);
    }
  };

  return (
    <div
      className="mk-card cursor-pointer"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={handleCardClick}
    >
      <div className="mk-card-img">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="mk-card-img-placeholder" />
        )}
        <div className="mk-card-img-overlay" />
        <span className="mk-coins-badge">🪙 +{coins} coins</span>
        {product.isLimitedEdition && (
          <span className="mk-limited-tag">LIMITED</span>
        )}
        {product.stock > 0 && product.stock <= 5 && (
          <span className="mk-hot-tag">🔥 Almost gone</span>
        )}
      </div>

      <div className="mk-card-body">
        <div className="mk-card-top">
          <h4 className="mk-product-name hover:text-purple-600 transition-colors">
            {product.name}
          </h4>
          {product.description && (
            <p className="mk-product-desc">{product.description}</p>
          )}
        </div>

        <div className="mk-card-footer">
          <div className="mk-price-row">
            <span className="mk-price">${product.price?.toLocaleString()}</span>
            <span className={`mk-stock ${stock.cls}`}>{stock.text}</span>
          </div>
          <button
            type="button"
            className={`mk-buy-btn ${soldOut ? "mk-buy-soldout" : ""} ${isBuying ? "mk-buy-loading" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onBuy(product);
            }}
            disabled={soldOut || isBuying}
          >
            {isBuying ? (
              <><span className="mk-btn-spinner" /> Processing...</>
            ) : soldOut ? "Sold Out" : (
              <><span>🛒</span> Buy Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
