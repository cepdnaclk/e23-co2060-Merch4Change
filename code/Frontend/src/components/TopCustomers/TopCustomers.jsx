import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopCustomers } from "../../api/profileService";
import "./TopCustomers.css";
import {
  Users,
  ShoppingBag,
  Coins,
  DollarSign,
  CheckCircle2,
  Heart,
  Sparkles,
  Flame,
} from "lucide-react";

export default function TopCustomers({ username, sellerName, isOrganization }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    getTopCustomers(username)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setData(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching top supporters:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="tc-loader" />;
  }

  const isDonorMode = data?.type === "donors" || isOrganization;
  const supporters = data?.topSupporters || data?.topDonors || data?.donors || data?.topCustomers || [];
  const topThree = supporters.slice(0, 3);
  const remaining = supporters.slice(3);

  if (supporters.length === 0) {
    return (
      <div className="tc-container">
        <div className="tc-empty-state">
          {isDonorMode ? (
            <Heart size={42} style={{ color: "#EF4444", marginBottom: "12px" }} />
          ) : (
            <ShoppingBag size={42} style={{ color: "#D4CECE", marginBottom: "12px" }} />
          )}
          <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#1A1A1A", marginBottom: "6px" }}>
            {isDonorMode ? "No donations yet" : "No customer orders yet"}
          </h3>
          <p>
            {isDonorMode
              ? `When community members donate impact coins to ${sellerName || username}'s initiatives, the top donors will appear here.`
              : `When community members purchase merchandise from ${sellerName || username}, the top customers will appear here.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-container">
      {/* Overview Stat Cards */}
      <div className="tc-stats-header">
        <div className="tc-stat-card">
          <div
            className="tc-stat-icon"
            style={{
              background: isDonorMode ? "#FEE2E2" : "#EFF6FF",
              color: isDonorMode ? "#DC2626" : "#2563EB",
            }}
          >
            {isDonorMode ? <Heart size={20} /> : <Users size={20} />}
          </div>
          <div className="tc-stat-info">
            <h5>{isDonorMode ? "Total Donors" : "Total Buyers"}</h5>
            <p>
              {data?.totalDonorsCount || data?.totalCustomersCount || supporters.length}{" "}
              {isDonorMode ? "Donors" : "Supporters"}
            </p>
          </div>
        </div>

        <div className="tc-stat-card">
          <div
            className="tc-stat-icon"
            style={{
              background: isDonorMode ? "#FEF3C7" : "#F0FDF4",
              color: isDonorMode ? "#D97706" : "#16A34A",
            }}
          >
            {isDonorMode ? <Coins size={20} /> : <DollarSign size={20} />}
          </div>
          <div className="tc-stat-info">
            <h5>{isDonorMode ? "Impact Coins Raised" : "Merchandise Volume"}</h5>
            <p>
              {isDonorMode
                ? `${(data?.totalCoinsRaised || 0).toLocaleString()} Coins`
                : `LKR ${(data?.totalRevenueFromCustomers || 0).toLocaleString()}`}
            </p>
          </div>
        </div>

        <div className="tc-stat-card">
          <div
            className="tc-stat-icon"
            style={{
              background: isDonorMode ? "#E1F5EE" : "#FEF3C7",
              color: isDonorMode ? "#0D6B5E" : "#D97706",
            }}
          >
            {isDonorMode ? <Sparkles size={20} /> : <Coins size={20} />}
          </div>
          <div className="tc-stat-info">
            <h5>{isDonorMode ? "Est. Real Impact" : "Coins Generated"}</h5>
            <p>
              {isDonorMode
                ? `≈ LKR ${(data?.totalImpactValue || (data?.totalCoinsRaised || 0) * 10).toLocaleString()}`
                : `${Math.floor((data?.totalRevenueFromCustomers || 0) / 10).toLocaleString()} Coins`}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Spotlight Cards */}
      <div className="tc-spotlight-grid">
        {topThree.map((supporter) => {
          const avatar =
            supporter.profileImageUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

          return (
            <div key={supporter.rank} className={`tc-spotlight-card rank-${supporter.rank}`}>
              <div className="tc-crown-badge">
                {supporter.rank === 1 ? "👑" : supporter.rank === 2 ? "🥈" : "🥉"}
              </div>

              <div className="tc-avatar-wrapper">
                <img src={avatar} alt={supporter.name} className="tc-avatar-img" />
                <div className="tc-rank-tag">#{supporter.rank}</div>
              </div>

              <Link to={`/profile/${supporter.userName}`} className="tc-customer-name">
                {supporter.name}
                {supporter.isVerified && <CheckCircle2 size={13} color="#0D6B5E" />}
              </Link>

              <span className="tc-customer-handle">@{supporter.userName}</span>

              <div
                className="tc-tier-pill"
                style={{ backgroundColor: supporter.tierBg, color: supporter.tierColor }}
              >
                <span>{supporter.tierIcon}</span>
                <span>{supporter.tier}</span>
              </div>

              <div className="tc-metrics-box">
                <div className="tc-metric-amount">
                  {isDonorMode
                    ? `${(supporter.totalCoinsDonated || supporter.totalSpent || 0).toLocaleString()} Coins`
                    : `LKR ${(supporter.totalSpent || 0).toLocaleString()}`}
                </div>
                <div className="tc-metric-sub">
                  {isDonorMode
                    ? `${supporter.donationsCount || supporter.ordersCount || 1} donation${(supporter.donationsCount || supporter.ordersCount) === 1 ? "" : "s"} (≈ LKR ${((supporter.totalCoinsDonated || supporter.totalSpent || 0) * 10).toLocaleString()})`
                    : `${supporter.ordersCount} order${supporter.ordersCount === 1 ? "" : "s"} (${supporter.itemsCount} items)`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining Supporters Table */}
      {remaining.length > 0 && (
        <div className="tc-table-wrapper">
          <div className="tc-table-head">
            <div>Rank</div>
            <div>{isDonorMode ? "Donor" : "Customer"}</div>
            <div>Tier Level</div>
            <div style={{ textAlign: "right" }}>
              {isDonorMode ? "Total Donated" : "Total Purchases"}
            </div>
          </div>

          <div className="tc-table-body">
            {remaining.map((supporter) => {
              const avatar =
                supporter.profileImageUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

              return (
                <Link
                  to={`/profile/${supporter.userName}`}
                  key={supporter.rank}
                  className="tc-table-row"
                >
                  <div className="tc-cell-rank">#{supporter.rank}</div>

                  <div className="tc-cell-user">
                    <img src={avatar} alt={supporter.name} className="tc-cell-avatar" />
                    <div>
                      <div className="tc-cell-name">
                        {supporter.name}
                        {supporter.isVerified && <CheckCircle2 size={12} color="#0D6B5E" />}
                      </div>
                      <div className="tc-cell-handle">@{supporter.userName}</div>
                    </div>
                  </div>

                  <div>
                    <span
                      className="tc-tier-pill"
                      style={{
                        backgroundColor: supporter.tierBg,
                        color: supporter.tierColor,
                        margin: 0,
                      }}
                    >
                      <span>{supporter.tierIcon}</span>
                      <span>{supporter.tier}</span>
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="tc-cell-metric-main">
                      {isDonorMode
                        ? `${(supporter.totalCoinsDonated || supporter.totalSpent || 0).toLocaleString()} Coins`
                        : `LKR ${(supporter.totalSpent || 0).toLocaleString()}`}
                    </div>
                    <div className="tc-cell-metric-sub">
                      {isDonorMode
                        ? `${supporter.donationsCount || supporter.ordersCount || 1} donation${(supporter.donationsCount || supporter.ordersCount) === 1 ? "" : "s"}`
                        : `${supporter.ordersCount} order${supporter.ordersCount === 1 ? "" : "s"}`}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIVE DONATION HISTORY STREAM (DONOR MODE ONLY) ── */}
      {isDonorMode && data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="tc-history-section">
          <div className="tc-history-header">
            <h4 className="tc-history-title">
              <Sparkles size={18} color="#D4820A" />
              <span>Recent Donation History</span>
            </h4>
            <span className="tc-history-badge">
              {data.totalDonationsCount || data.recentActivity.length} Contributions Recorded
            </span>
          </div>

          <div className="tc-history-list">
            {data.recentActivity.map((activity) => {
              const avatar =
                activity.donorAvatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
              const formattedDate = new Date(activity.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={activity.id || activity.donationId} className="tc-history-item">
                  <div className="tc-history-donor">
                    <img src={avatar} alt={activity.donorName} className="tc-history-avatar" />
                    <div>
                      <Link to={`/profile/${activity.donorUserName}`} className="tc-history-donor-name">
                        {activity.donorName}
                        {activity.isVerified && <CheckCircle2 size={12} color="#0D6B5E" />}
                      </Link>
                      <div className="tc-history-project-name">
                        Supported: <strong>{activity.projectName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="tc-history-right">
                    <div className="tc-history-coins">
                      <Coins size={14} color="#D4820A" />
                      <span>+{activity.coinAmount.toLocaleString()} Coins</span>
                    </div>
                    <div className="tc-history-time">{formattedDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

