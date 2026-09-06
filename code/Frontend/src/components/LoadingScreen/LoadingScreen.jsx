import { useState, useEffect } from "react";
import "./LoadingScreen.css";
import BrandLogo from "../BrandLogo/BrandLogo";
import { Sparkles, Heart } from "lucide-react";

const DEFAULT_TIPS = [
  "Connecting you with verified changemakers and causes...",
  "Every purchase directly funds verified NGO campaigns...",
  "100% transparent and verified non-profit partners...",
  "Making conscious merchandise wearable and impactful...",
  "Setting up your personalized impact dashboard...",
];

export default function LoadingScreen({
  message = "Merch4Change",
  subtext = "Wear your values · Fund a cause",
  tips = DEFAULT_TIPS,
  showTips = true,
  fullScreen = true,
  tipInterval = 1800,
  isExiting = false,
}) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Dynamic Micro-Copy: rotating impact statements with gentle crossfade
  useEffect(() => {
    if (!showTips || !tips || tips.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setIsFading(false);
      }, 260);
    }, tipInterval);

    return () => clearInterval(interval);
  }, [showTips, tips, tipInterval]);

  return (
    <div
      className={`m4c-loader-container ${
        fullScreen ? "m4c-loader-fullscreen" : "m4c-loader-inline"
      } ${isExiting ? "m4c-loader-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      {/* Pillar 1: Calm Ambient Glowing Aura */}
      <div className="m4c-loader-ambient-glow" />

      <div className="m4c-loader-card">
        {/* Logo badge with organic breathing halo */}
        <div className="m4c-loader-badge-wrapper">
          <div className="m4c-loader-pulse-ring" />
          <div className="m4c-loader-pulse-ring delay" />
          
          <div className="m4c-loader-logo-frame">
            <BrandLogo size={50} />
          </div>

          <div className="m4c-loader-sparkle-pill" title="Verified Impact">
            <Sparkles size={12} className="m4c-sparkle-icon" />
          </div>
        </div>

        {/* Brand Headline */}
        <div className="m4c-loader-brand-section">
          <h1 className="m4c-loader-title">{message}</h1>
          {subtext && <p className="m4c-loader-subtext">{subtext}</p>}
        </div>

        {/* Pillar 3: Sleek 2px Gradient Micro-Bar */}
        <div className="m4c-loader-progress-track">
          <div className="m4c-loader-progress-shimmer" />
        </div>

        {/* Pillar 2: Dynamic Micro-Copy Storytelling */}
        {showTips && tips && tips.length > 0 && (
          <div className="m4c-loader-tip-area">
            <div className="m4c-loader-tip-content">
              <Heart size={13} className="m4c-heart-icon" />
              <p className={`m4c-loader-tip-text ${isFading ? "fade-out" : "fade-in"}`}>
                {tips[currentTipIndex]}
              </p>
            </div>

            {/* Tip progress indicators */}
            <div className="m4c-loader-tip-indicators">
              {tips.map((_, idx) => (
                <span
                  key={idx}
                  className={`m4c-tip-dot ${idx === currentTipIndex ? "active" : ""}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
