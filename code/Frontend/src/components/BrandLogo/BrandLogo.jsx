import { useState } from "react";
import "./BrandLogo.css";

/**
 * ============================================================================
 * CENTRALIZED BRAND LOGO CONFIGURATION
 * ============================================================================
 * To update the logo everywhere across the application:
 * 1. Place your final logo file (e.g. `logo.svg` or `logo.png`) in `src/assets/`
 * 2. Set BRAND_LOGO_SRC to that imported asset or file path below.
 * 
 * When BRAND_LOGO_SRC is `null`, the app uses the clean, modern vector monogram ("M").
 * ============================================================================
 */
export const BRAND_LOGO_SRC = null;

export default function BrandLogo({
  size = 36,
  className = "",
  style = {},
  alt = "Merch4Change",
  showText = false,
  textClassName = "",
  rounded = true,
  onClick,
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const borderRadius = rounded ? Math.round(size * 0.26) : 0;
  const fontSize = Math.round(size * 0.48);

  const iconElement = (
    <div
      className={`m4c-brand-logo ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${borderRadius}px`,
        fontSize: `${fontSize}px`,
        ...style,
      }}
      onClick={onClick}
      role="img"
      aria-label={alt}
    >
      {BRAND_LOGO_SRC && !imgFailed ? (
        <img
          src={BRAND_LOGO_SRC}
          alt={alt}
          className="m4c-brand-logo-img"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="m4c-brand-logo-text">M</span>
      )}
    </div>
  );

  if (!showText) return iconElement;

  return (
    <div className="m4c-brand-logo-group" onClick={onClick}>
      {iconElement}
      <span className={`m4c-brand-logo-name ${textClassName}`}>
        Merch4Change
      </span>
    </div>
  );
}
