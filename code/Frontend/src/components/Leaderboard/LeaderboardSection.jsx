import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getDonorLeaderboard,
  getCompanyLeaderboard,
  getLeaderboardStats,
} from "../../api/leaderboardService";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";
import LeaderboardPodium from "./LeaderboardPodium";
import LeaderboardTable from "./LeaderboardTable";
import "./Leaderboard.css";
import {
  Users,
  Building2,
  Calendar,
  Sparkles,
  Trophy,
  Coins,
  HeartHandshake,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function LeaderboardSection() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const currentUserRef = useRef(null);

  const [activeType, setActiveType] = useState("donors"); // "donors" | "companies"
  const [timeframe, setTimeframe] = useState("all_time"); // "all_time" | "month" | "week"
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged in profile details
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
      .catch(() => {
        setProfileData(authUser);
      });
  }, [authUser]);

  // Determine current user match IDs
  const currentUserId = profileData?._id || profileData?.id || authUser?.id || authUser?._id || null;
  const currentUserName = (profileData?.userName || authUser?.userName || "").toLowerCase();

  // Find user entry in current leaderboard view
  const currentUserEntry = useMemo(() => {
    if (!leaderboardData.length) return null;
    return leaderboardData.find((entry) => {
      if (activeType === "companies") {
        return Boolean(currentUserName && entry.ownerUserName && entry.ownerUserName.toLowerCase() === currentUserName);
      } else {
        const idMatch = currentUserId && String(entry.userId) === String(currentUserId);
        const usernameMatch = currentUserName && entry.userName && entry.userName.toLowerCase() === currentUserName;
        return idMatch || usernameMatch;
      }
    });
  }, [leaderboardData, activeType, currentUserId, currentUserName]);

  const scrollToMyPosition = () => {
    if (currentUserRef.current) {
      currentUserRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      currentUserRef.current.classList.add("pulse-highlight");
      setTimeout(() => {
        currentUserRef.current?.classList.remove("pulse-highlight");
      }, 2500);
    }
  };

  // Load stats once
  useEffect(() => {
    getLeaderboardStats()
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  // Load leaderboard whenever activeType or timeframe changes
  useEffect(() => {
    setLoading(true);
    const fetchLeaderboard =
      activeType === "donors"
        ? getDonorLeaderboard(timeframe)
        : getCompanyLeaderboard(timeframe);

    fetchLeaderboard
      .then((res) => {
        if (res.success && res.data?.leaderboard) {
          setLeaderboardData(res.data.leaderboard);
        } else {
          setLeaderboardData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setLeaderboardData([]);
      })
      .finally(() => setLoading(false));
  }, [activeType, timeframe]);

  const topThree = leaderboardData.slice(0, 3);
  const remainingRows = leaderboardData.slice(3);

  return (
    <div className="lb-container">
      {/* Community Impact Stats Row */}
      {stats && (
        <div className="lb-stats-row">
          <div className="lb-stat-box">
            <div
              className="lb-stat-icon-wrapper"
              style={{ background: "#EFF6FF", color: "#2563EB" }}
            >
              <Coins size={22} />
            </div>
            <div className="lb-stat-content">
              <h4>Total Donated</h4>
              <p>{stats.totalCoinsDonated.toLocaleString()} Coins</p>
            </div>
          </div>

          <div className="lb-stat-box">
            <div
              className="lb-stat-icon-wrapper"
              style={{ background: "#F0FDF4", color: "#16A34A" }}
            >
              <Users size={22} />
            </div>
            <div className="lb-stat-content">
              <h4>Active Donors</h4>
              <p>{stats.totalCommunityDonors.toLocaleString()} Members</p>
            </div>
          </div>

          <div className="lb-stat-box">
            <div
              className="lb-stat-icon-wrapper"
              style={{ background: "#FEF3C7", color: "#D97706" }}
            >
              <HeartHandshake size={22} />
            </div>
            <div className="lb-stat-content">
              <h4>Verified Charities</h4>
              <p>{stats.verifiedCharitiesSupported} Organizations</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="lb-controls-bar">
        {/* Toggle between Donors and Companies */}
        <div className="lb-toggle-group">
          <button
            className={`lb-toggle-btn ${activeType === "donors" ? "active" : ""}`}
            onClick={() => setActiveType("donors")}
          >
            <Users size={16} />
            <span>Community Donors</span>
          </button>
          <button
            className={`lb-toggle-btn ${activeType === "companies" ? "active" : ""}`}
            onClick={() => setActiveType("companies")}
          >
            <Building2 size={16} />
            <span>Companies & Brands</span>
          </button>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="lb-timeframe-group">
          <span className="lb-timeframe-label">
            <Calendar size={13} /> Timeframe:
          </span>
          <button
            className={`lb-time-btn ${timeframe === "all_time" ? "active" : ""}`}
            onClick={() => setTimeframe("all_time")}
          >
            All-Time
          </button>
          <button
            className={`lb-time-btn ${timeframe === "month" ? "active" : ""}`}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </button>
          <button
            className={`lb-time-btn ${timeframe === "week" ? "active" : ""}`}
            onClick={() => setTimeframe("week")}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Current User Standing Callout (when logged in and not loading) */}
      {!loading && authUser && (
        currentUserEntry ? (
          <div className="lb-user-standing-card user-found">
            <div className="lb-standing-main">
              <div className="lb-standing-rank-badge">
                #{currentUserEntry.rank}
              </div>
              <div className="lb-standing-info">
                <div className="lb-standing-title-wrap">
                  <span className="lb-standing-tag">
                    <Sparkles size={13} /> {activeType === "companies" ? "Your Brand Standing" : "Your Global Standing"}
                  </span>
                  {activeType === "donors" && currentUserEntry.tier && (
                    <span
                      className="lb-podium-tier-pill"
                      style={{
                        backgroundColor: currentUserEntry.tierBg,
                        color: currentUserEntry.tierColor,
                        margin: 0,
                      }}
                    >
                      <span>{currentUserEntry.tierIcon}</span>
                      <span>{currentUserEntry.tier} Donor</span>
                    </span>
                  )}
                </div>
                <h3>
                  You are ranked <strong>#{currentUserEntry.rank}</strong> out of {leaderboardData.length} on the leaderboard!
                </h3>
                <p>
                  {activeType === "companies"
                    ? `Your brand has generated ${(currentUserEntry.impactCoinsGenerated || 0).toLocaleString()} coins across ${currentUserEntry.unitsSold || 0} products sold.`
                    : `You've donated ${(currentUserEntry.totalCoins || 0).toLocaleString()} coins across ${currentUserEntry.donationCount || 0} contribution${currentUserEntry.donationCount === 1 ? "" : "s"}.`}
                </p>
              </div>
            </div>
            <button onClick={scrollToMyPosition} className="lb-standing-jump-btn">
              <span>Jump to my position</span>
              <ChevronRight size={15} />
            </button>
          </div>
        ) : (
          <div className="lb-user-standing-card user-unranked">
            <div className="lb-standing-main">
              <div className="lb-standing-icon-unranked">
                <Trophy size={22} />
              </div>
              <div className="lb-standing-info">
                <h3>
                  {activeType === "companies"
                    ? "Your brand isn't ranked on the leaderboard yet"
                    : "You're not ranked on the global leaderboard yet"}
                </h3>
                <p>
                  {activeType === "companies"
                    ? "List impact products and sell merchandise to generate impact coins and claim your brand's spot!"
                    : "Donate coins to verified charity projects to earn donor rank and claim your spot among top community donors!"}
                </p>
              </div>
            </div>
            {activeType === "donors" ? (
              <Link to="/donations?tab=projects" className="lb-standing-cta-btn">
                <Heart size={15} />
                <span>Make a Donation</span>
              </Link>
            ) : (
              <Link to="/marketplace" className="lb-standing-cta-btn">
                <span>Explore Marketplace</span>
              </Link>
            )}
          </div>
        )
      )}

      {/* Content Area */}
      {loading ? (
        <div className="lb-spinner" />
      ) : leaderboardData.length === 0 ? (
        <div className="lb-empty-box">
          <Trophy size={48} style={{ color: "#D4CECE", marginBottom: "16px" }} />
          <h3>No leaderboard records yet</h3>
          <p>
            Be the first to donate coins or buy impact merchandise to climb the rankings!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <LeaderboardPodium
            topThree={topThree}
            isCompanyView={activeType === "companies"}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRef={currentUserRef}
          />

          {/* Ranked List (4 to 50) */}
          <LeaderboardTable
            rows={remainingRows}
            isCompanyView={activeType === "companies"}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRef={currentUserRef}
          />
        </>
      )}
    </div>
  );
}
