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
  Award,
  Crown,
  Sparkles,
} from "lucide-react";

export default function TopCustomers({ username, sellerName }) {
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
        console.error("Error fetching top customers:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="tc-loader" />;
  }

  const customers = data?.topCustomers || [];
  const topThree = customers.slice(0, 3);
  const remaining = customers.slice(3);

  if (customers.length === 0) {
    return (
      <div className="tc-container">
        <div className="tc-empty-state">
          <ShoppingBag size={42} style={{ color: "#D4CECE", marginBottom: "12px" }} />
          <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#1A1A1A", marginBottom: "6px" }}>
            No customer orders yet
          </h3>
          <p>
            When community members purchase merchandise from {sellerName || username}, the top supporters will appear here.
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
          <div className="tc-stat-icon" style={{ background: "#EFF6FF", color: "#2563EB" }}>
            <Users size={20} />
          </div>
          <div className="tc-stat-info">
            <h5>Total Buyers</h5>
            <p>{data?.totalCustomersCount || customers.length} Supporters</p>
          </div>
        </div>

        <div className="tc-stat-card">
          <div className="tc-stat-icon" style={{ background: "#F0FDF4", color: "#16A34A" }}>
            <DollarSign size={20} />
          </div>
          <div className="tc-stat-info">
            <h5>Merchandise Volume</h5>
            <p>LKR {(data?.totalRevenueFromCustomers || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="tc-stat-card">
          <div className="tc-stat-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
            <Coins size={20} />
          </div>
          <div className="tc-stat-info">
            <h5>Coins Generated</h5>
            <p>{Math.floor((data?.totalRevenueFromCustomers || 0) / 10).toLocaleString()} Coins</p>
          </div>
        </div>
      </div>

      {/* Top 3 Spotlight Cards */}
      <div className="tc-spotlight-grid">
        {topThree.map((customer) => {
          const avatar =
            customer.profileImageUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

          return (
            <div key={customer.rank} className={`tc-spotlight-card rank-${customer.rank}`}>
              <div className="tc-crown-badge">
                {customer.rank === 1 ? "👑" : customer.rank === 2 ? "🥈" : "🥉"}
              </div>

              <div className="tc-avatar-wrapper">
                <img src={avatar} alt={customer.name} className="tc-avatar-img" />
                <div className="tc-rank-tag">#{customer.rank}</div>
              </div>

              <Link to={`/profile/${customer.userName}`} className="tc-customer-name">
                {customer.name}
                {customer.isVerified && <CheckCircle2 size={13} color="#0D6B5E" />}
              </Link>

              <span className="tc-customer-handle">@{customer.userName}</span>

              <div
                className="tc-tier-pill"
                style={{ backgroundColor: customer.tierBg, color: customer.tierColor }}
              >
                <span>{customer.tierIcon}</span>
                <span>{customer.tier}</span>
              </div>

              <div className="tc-metrics-box">
                <div className="tc-metric-amount">
                  LKR {customer.totalSpent.toLocaleString()}
                </div>
                <div className="tc-metric-sub">
                  {customer.ordersCount} order{customer.ordersCount === 1 ? "" : "s"} ({customer.itemsCount} items)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining Customers Table */}
      {remaining.length > 0 && (
        <div className="tc-table-wrapper">
          <div className="tc-table-head">
            <div>Rank</div>
            <div>Customer</div>
            <div>Tier Level</div>
            <div style={{ textAlign: "right" }}>Total Purchases</div>
          </div>

          <div className="tc-table-body">
            {remaining.map((customer) => {
              const avatar =
                customer.profileImageUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

              return (
                <Link
                  to={`/profile/${customer.userName}`}
                  key={customer.rank}
                  className="tc-table-row"
                >
                  <div className="tc-cell-rank">#{customer.rank}</div>

                  <div className="tc-cell-user">
                    <img src={avatar} alt={customer.name} className="tc-cell-avatar" />
                    <div>
                      <div className="tc-cell-name">
                        {customer.name}
                        {customer.isVerified && <CheckCircle2 size={12} color="#0D6B5E" />}
                      </div>
                      <div className="tc-cell-handle">@{customer.userName}</div>
                    </div>
                  </div>

                  <div>
                    <span
                      className="tc-tier-pill"
                      style={{
                        backgroundColor: customer.tierBg,
                        color: customer.tierColor,
                        margin: 0,
                      }}
                    >
                      <span>{customer.tierIcon}</span>
                      <span>{customer.tier}</span>
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div className="tc-cell-metric-main">
                      LKR {customer.totalSpent.toLocaleString()}
                    </div>
                    <div className="tc-cell-metric-sub">
                      {customer.ordersCount} order{customer.ordersCount === 1 ? "" : "s"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
