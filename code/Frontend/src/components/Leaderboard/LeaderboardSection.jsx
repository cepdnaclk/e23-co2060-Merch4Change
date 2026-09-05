import React, { useState, useEffect } from "react";
import {
  getDonorLeaderboard,
  getCompanyLeaderboard,
  getLeaderboardStats,
} from "../../api/leaderboardService";
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
} from "lucide-react";

export default function LeaderboardSection() {
  const [activeType, setActiveType] = useState("donors"); // "donors" | "companies"
  const [timeframe, setTimeframe] = useState("all_time"); // "all_time" | "month" | "week"
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
          />

          {/* Ranked List (4 to 50) */}
          <LeaderboardTable
            rows={remainingRows}
            isCompanyView={activeType === "companies"}
          />
        </>
      )}
    </div>
  );
}
