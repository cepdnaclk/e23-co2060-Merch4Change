import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Award, Sparkles } from "lucide-react";

export default function LeaderboardTable({
  rows = [],
  isCompanyView = false,
  isCharityView = false,
  currentUserId = null,
  currentUserName = "",
  currentUserRef = null,
}) {
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
        <div>{isCharityView ? "Charity / Cause" : isCompanyView ? "Company / Brand" : "Community Donor"}</div>
        <div>{isCharityView ? "Cause Category" : isCompanyView ? "Impact Tier" : "Donor Level"}</div>
        <div style={{ textAlign: "right" }}>
          {isCharityView ? "Coins Raised" : isCompanyView ? "Impact Generated" : "Total Donated"}
        </div>
      </div>

      <div className="lb-table-body">
        {rows.map((row) => {
          const isCurrentUser = isCompanyView
            ? Boolean(currentUserName && row.ownerUserName && row.ownerUserName.toLowerCase() === currentUserName)
            : isCharityView
            ? Boolean(currentUserName && row.userName && row.userName.toLowerCase() === currentUserName)
            : Boolean(
                (currentUserId && String(row.userId) === String(currentUserId)) ||
                (currentUserName && row.userName && row.userName.toLowerCase() === currentUserName)
              );

          const profileLink = isCompanyView
            ? `/profile/${row.ownerUserName || row.slug}`
            : `/profile/${row.userName}`;

          const avatar = isCompanyView
            ? row.logoUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150"
            : isCharityView
            ? row.logoUrl || "https://images.unsplash.com/photo-1469571480202-8bcc9fd2f3a7?w=150"
            : row.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

          const title = isCompanyView ? row.brandName : row.name;
          const subTitle = isCompanyView
            ? `@${row.ownerUserName || row.slug}`
            : isCharityView
            ? `@${row.userName || row.slug || "verified"}`
            : `@${row.userName}`;

          return (
            <Link
              to={profileLink}
              key={row.rank}
              ref={isCurrentUser ? currentUserRef : null}
              className={`lb-table-row ${isCurrentUser ? "is-current-user" : ""}`}
            >
              <div className="lb-row-rank">
                {row.rank === 1 ? "👑 #1" : row.rank === 2 ? "🥈 #2" : row.rank === 3 ? "🥉 #3" : `#${row.rank}`}
              </div>

              <div className="lb-row-user">
                <img src={avatar} alt={title} className="lb-row-avatar" />
                <div className="lb-row-name-wrap">
                  <span className="lb-row-name">
                    {title}
                    {row.isVerified && <CheckCircle2 size={13} color="#0D6B5E" />}
                    {isCurrentUser && (
                      <span className="lb-current-user-tag">
                        <Sparkles size={10} /> {isCharityView ? "YOUR CAUSE" : isCompanyView ? "YOUR BRAND" : "YOU"}
                      </span>
                    )}
                  </span>
                  <span className="lb-row-username">{subTitle}</span>
                </div>
              </div>

              <div>
                {isCharityView && (
                  <span
                    className="lb-podium-tier-pill"
                    style={{ backgroundColor: "#E1F5EE", color: "#0D6B5E", margin: 0 }}
                  >
                    <span>{row.categoryIcon || "🛡️"}</span>
                    <span>{row.categoryLabel || "Verified Charity"}</span>
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
                {!isCompanyView && !isCharityView && row.tier && (
                  <span
                    className="lb-podium-tier-pill"
                    style={{ backgroundColor: row.tierBg, color: row.tierColor, margin: 0 }}
                  >
                    <span>{row.tierIcon}</span>
                    <span>{row.tier}</span>
                  </span>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div className="lb-row-metric-main">
                  {isCompanyView
                    ? `${(row.impactCoinsGenerated || 0).toLocaleString()} Coins`
                    : `${(row.totalCoins || 0).toLocaleString()} Coins`}
                </div>
                <div className="lb-row-metric-sub">
                  {isCompanyView
                    ? `${row.unitsSold || 0} units sold`
                    : isCharityView
                    ? `${row.donorCount || 0} supporter${row.donorCount === 1 ? "" : "s"} (${row.donationCount || 0} donation${row.donationCount === 1 ? "" : "s"})`
                    : `${row.donationCount || 0} donation${row.donationCount === 1 ? "" : "s"}`}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
