import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import LeaderboardSection from "../../components/Leaderboard/LeaderboardSection";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";
import {
  Trophy,
  Heart,
  Store,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import "../Home/Home.css";
import "./LeaderboardPage.css";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setProfileData(null);
      return;
    }
    apiClient
      .get("/api/v1/profile/me")
      .then((res) => {
        if (res.data?.success && res.data?.data?.user) {
          setProfileData(res.data.data.user);
        }
      })
      .catch((err) => {
        console.error("Error loading profile in LeaderboardPage:", err);
        setProfileData(authUser);
      });
  }, [authUser]);

  return (
    <div className={`luminous-app ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <TopNavbar
        profileData={profileData || authUser}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <div className="lum-layout">
        <Sidebar
          profileData={profileData || authUser}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <main className="leaderboard-main">
          {/* ── HERO BANNER ── */}
          <div className="lb-page-hero">
            <div className="lb-page-hero-decor-1" />
            <div className="lb-page-hero-decor-2" />

            <div className="lb-page-hero-content">
              <span className="lb-page-hero-badge">
                <Sparkles size={13} /> Global Impact Rankings
              </span>

              <h1 className="lb-page-hero-title">
                Community Donors &<br />
                <em>Brand Impact Leaderboard</em>
              </h1>

              <p className="lb-page-hero-sub">
                Celebrating exceptional community champions and conscious brands turning
                everyday purchases and contributions into verified real-world impact.
              </p>

              <div className="lb-page-hero-actions">
                <Link to="/donate" className="lb-hero-cta-btn-primary">
                  <Heart size={16} />
                  <span>Donate Coins</span>
                </Link>
                <Link to="/marketplace" className="lb-hero-cta-btn-secondary">
                  <Store size={16} />
                  <span>Shop Impact Merch</span>
                </Link>
                <Link to="/donations" className="lb-hero-cta-btn-secondary">
                  <ShieldCheck size={16} />
                  <span>Explore Causes</span>
                </Link>
              </div>
            </div>

            {/* Wave divider */}
            <svg
              viewBox="0 0 1440 60"
              className="lb-page-wave"
              preserveAspectRatio="none"
            >
              <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#FAF7F2" />
            </svg>
          </div>

          <div className="lb-page-body">
            {/* ── SECTION SWITCHER TABS ── */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
              <div
                style={{
                  display: "inline-flex",
                  background: "#EAE5DC",
                  padding: "5px",
                  borderRadius: "16px",
                  gap: "6px",
                }}
              >
                <button
                  onClick={() => navigate("/donations")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "12px",
                    border: "none",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    background: "transparent",
                    color: "#6B6560",
                  }}
                >
                  <Heart size={16} />
                  <span>Causes & Projects</span>
                </button>

                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 24px",
                    borderRadius: "12px",
                    border: "none",
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "default",
                    background: "#ffffff",
                    color: "#D4820A",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Trophy size={16} />
                  <span>🏆 Community Leaderboards</span>
                </button>
              </div>
            </div>

            {/* ── LEADERBOARD SECTION COMPONENT ── */}
            <LeaderboardSection profileData={profileData || authUser} />
          </div>
        </main>
      </div>
    </div>
  );
}
