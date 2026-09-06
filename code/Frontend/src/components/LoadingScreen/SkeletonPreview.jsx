import React from "react";
import "./SkeletonPreview.css";

export default function SkeletonPreview({ isExiting = false }) {
  return (
    <div
      className={`m4c-skeleton-app ${isExiting ? "m4c-skeleton-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading feed wireframe"
    >
      <div className="m4c-skeleton-layout">
        {/* LEFT SIDEBAR SKELETON */}
        <aside className="m4c-sk-sidebar">
          {/* Brand Logo Ghost */}
          <div className="m4c-sk-logo-box m4c-sk-wave" />

          {/* Navigation Icon Placeholders */}
          <div className="m4c-sk-nav-list">
            <div className="m4c-sk-nav-item active m4c-sk-wave" />
            <div className="m4c-sk-nav-item m4c-sk-wave" />
            <div className="m4c-sk-nav-item m4c-sk-wave" />
            <div className="m4c-sk-nav-item m4c-sk-wave" />
            <div className="m4c-sk-nav-item m4c-sk-wave" />
            <div className="m4c-sk-nav-item m4c-sk-wave" />
          </div>

          {/* Bottom user avatar placeholder */}
          <div className="m4c-sk-sidebar-footer m4c-sk-wave" />
        </aside>

        {/* MAIN FEED SKELETON */}
        <main className="m4c-sk-main">
          {/* Top Stories Row */}
          <div className="m4c-sk-stories-card">
            <div className="m4c-sk-stories-scroll">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="m4c-sk-story-item">
                  <div className="m4c-sk-story-ring">
                    <div className="m4c-sk-story-circle m4c-sk-wave" />
                  </div>
                  <div className="m4c-sk-story-name m4c-sk-wave" />
                </div>
              ))}
            </div>
          </div>

          {/* Promo Banner Ghost */}
          <div className="m4c-sk-promo-banner m4c-sk-wave" />

          {/* Feed Post Card 1 */}
          <div className="m4c-sk-post-card">
            <div className="m4c-sk-post-header">
              <div className="m4c-sk-avatar m4c-sk-wave" />
              <div className="m4c-sk-header-text">
                <div className="m4c-sk-line-title m4c-sk-wave" />
                <div className="m4c-sk-line-sub m4c-sk-wave" />
              </div>
            </div>

            <div className="m4c-sk-post-body">
              <div className="m4c-sk-line-full m4c-sk-wave" />
              <div className="m4c-sk-line-three-quarters m4c-sk-wave" />
            </div>

            <div className="m4c-sk-post-media m4c-sk-wave" />

            <div className="m4c-sk-post-actions">
              <div className="m4c-sk-action-btn m4c-sk-wave" />
              <div className="m4c-sk-action-btn m4c-sk-wave" />
              <div className="m4c-sk-action-btn m4c-sk-wave" />
            </div>
          </div>

          {/* Feed Post Card 2 */}
          <div className="m4c-sk-post-card">
            <div className="m4c-sk-post-header">
              <div className="m4c-sk-avatar m4c-sk-wave" />
              <div className="m4c-sk-header-text">
                <div className="m4c-sk-line-title m4c-sk-wave" />
                <div className="m4c-sk-line-sub m4c-sk-wave" />
              </div>
            </div>

            <div className="m4c-sk-post-body">
              <div className="m4c-sk-line-full m4c-sk-wave" />
              <div className="m4c-sk-line-half m4c-sk-wave" />
            </div>

            <div className="m4c-sk-post-media short m4c-sk-wave" />
          </div>
        </main>

        {/* RIGHT SIDEBAR SKELETON (Desktop) */}
        <aside className="m4c-sk-right-sidebar">
          {/* Search Pill */}
          <div className="m4c-sk-search-pill m4c-sk-wave" />

          {/* Trending Card */}
          <div className="m4c-sk-widget-card">
            <div className="m4c-sk-widget-title m4c-sk-wave" />
            <div className="m4c-sk-widget-item">
              <div className="m4c-sk-widget-text-main m4c-sk-wave" />
              <div className="m4c-sk-widget-text-sub m4c-sk-wave" />
            </div>
            <div className="m4c-sk-widget-item">
              <div className="m4c-sk-widget-text-main m4c-sk-wave" />
              <div className="m4c-sk-widget-text-sub m4c-sk-wave" />
            </div>
            <div className="m4c-sk-widget-item">
              <div className="m4c-sk-widget-text-main m4c-sk-wave" />
              <div className="m4c-sk-widget-text-sub m4c-sk-wave" />
            </div>
          </div>

          {/* Leaderboard / Causes Card */}
          <div className="m4c-sk-widget-card">
            <div className="m4c-sk-widget-title m4c-sk-wave" />
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="m4c-sk-donor-row">
                <div className="m4c-sk-donor-avatar m4c-sk-wave" />
                <div className="m4c-sk-donor-lines">
                  <div className="m4c-sk-donor-name m4c-sk-wave" />
                  <div className="m4c-sk-donor-sub m4c-sk-wave" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
