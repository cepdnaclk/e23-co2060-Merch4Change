import { useState, useEffect } from "react";
import "./LoadingScreen.css";
import BrandLogo from "../BrandLogo/BrandLogo";
import { Sparkles, Heart } from "lucide-react";

const DEFAULT_TIPS = [
  "Connecting you with verified changemakers and causes...",
  "Every purchase directly funds impactful non-profit campaigns...",
  "100% verified organisations and transparent impact tracking...",
  "Discover conscious merchandise that makes a difference...",
  "Preparing your personalized impact dashboard...",
];

export default function LoadingScreen({
  message = "Merch4Change",
  subtext = "Wear your values · Fund a cause",
  tips = DEFAULT_TIPS,
  showTips = true,
  fullScreen = true,
  tipInterval = 2600,
}) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!showTips || !tips || tips.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        setIsFading(false);
      }, 350);
    }, tipInterval);

    return () => clearInterval(interval);
  }, [showTips, tips, tipInterval]);

  return (
    <div
      className={`m4c-loader-container ${fullScreen ? "m4c-loader-fullscreen" : "m4c-loader-inline"}`}
      role="status"
      aria-live="polite"
      aria-label="Loading application"
    >
      {/* Ambient background glow */}
      <div className="m4c-loader-ambient-glow" />

      <div className="m4c-loader-card">
        {/* Logo with pulsing halo */}
        <div className="m4c-loader-badge-wrapper">
          <div className="m4c-loader-pulse-ring" />
          <div className="m4c-loader-pulse-ring delay" />
          
          <div className="m4c-loader-logo-frame">
            <BrandLogo size={52} />
          </div>

          <div className="m4c-loader-sparkle-pill" title="Verified Impact">
            <Sparkles size={13} className="m4c-sparkle-icon" />
          </div>
        </div>

        {/* Brand Headline */}
        <div className="m4c-loader-brand-section">
          <h1 className="m4c-loader-title">{message}</h1>
          {subtext && <p className="m4c-loader-subtext">{subtext}</p>}
        </div>

        {/* Shimmering Micro-Progress Bar */}
        <div className="m4c-loader-progress-track">
          <div className="m4c-loader-progress-shimmer" />
        </div>

        {/* Dynamic Rotating Impact Quotes */}
        {showTips && tips && tips.length > 0 && (
          <div className="m4c-loader-tip-area">
            <div className="m4c-loader-tip-content">
              <Heart size={14} className="m4c-heart-icon" />
              <p className={`m4c-loader-tip-text ${isFading ? "fade-out" : "fade-in"}`}>
                {tips[currentTipIndex]}
              </p>
            </div>

            {/* Tip indicators */}
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
