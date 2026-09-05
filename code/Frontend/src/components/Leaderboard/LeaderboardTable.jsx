import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Award } from "lucide-react";

export default function LeaderboardTable({ rows = [], isCompanyView = false }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="lb-table-card">
        <div className="lb-empty-box">
          <Award size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
          <p>No more rankings recorded for this timeframe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lb-table-card">
      <div className="lb-table-header">
        <div>Rank</div>
        <div>{isCompanyView ? "Company / Brand" : "Community Donor"}</div>
        <div>{isCompanyView ? "Impact Tier" : "Donor Level"}</div>
        <div style={{ textAlign: "right" }}>{isCompanyView ? "Impact Generated" : "Total Donated"}</div>
      </div>

      <div className="lb-table-body">
        {rows.map((row) => {
          const profileLink = isCompanyView
            ? `/profile/${row.ownerUserName || row.slug}`
            : `/profile/${row.userName}`;

          const avatar = isCompanyView
            ? row.logoUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150"
            : row.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

          const title = isCompanyView ? row.brandName : row.name;
          const subTitle = isCompanyView ? `@${row.ownerUserName || row.slug}` : `@${row.userName}`;

          return (
            <Link to={profileLink} key={row.rank} className="lb-table-row">
              <div className="lb-row-rank">#{row.rank}</div>

              <div className="lb-row-user">
                <img src={avatar} alt={title} className="lb-row-avatar" />
                <div className="lb-row-name-wrap">
                  <span className="lb-row-name">
                    {title}
                    {row.isVerified && <CheckCircle2 size={13} color="#0D6B5E" />}
                  </span>
                  <span className="lb-row-username">{subTitle}</span>
                </div>
              </div>

              <div>
                {!isCompanyView && row.tier && (
                  <span
                    className="lb-podium-tier-pill"
                    style={{ backgroundColor: row.tierBg, color: row.tierColor, margin: 0 }}
                  >
                    <span>{row.tierIcon}</span>
                    <span>{row.tier}</span>
                  </span>
                )}
                {isCompanyView && (
                  <span
                    className="lb-podium-tier-pill"
                    style={{ backgroundColor: "#F0FDF4", color: "#166534", margin: 0 }}
                  >
                    <span>🏢 Impact Brand</span>
                  </span>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="lb-row-metric-main">
                  {isCompanyView
                    ? `${row.impactCoinsGenerated.toLocaleString()} Coins`
                    : `${row.totalCoins.toLocaleString()} Coins`}
                </div>
                <div className="lb-row-metric-sub">
                  {isCompanyView
                    ? `${row.unitsSold} units sold`
                    : `${row.donationCount} donation${row.donationCount === 1 ? "" : "s"}`}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
