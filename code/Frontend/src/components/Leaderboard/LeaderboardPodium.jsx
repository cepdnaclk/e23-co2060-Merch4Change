import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Award, Heart, Sparkles, Building2 } from "lucide-react";

export default function LeaderboardPodium({
  topThree = [],
  isCompanyView = false,
  isCharityView = false,
  currentUserId = null,
  currentUserName = "",
  currentUserRef = null,
}) {
  if (!topThree || topThree.length === 0) return null;

  // Visual layout for podium: 2nd on Left, 1st in Middle, 3rd on Right
  const first = topThree.find((item) => item.rank === 1);
  const second = topThree.find((item) => item.rank === 2);
  const third = topThree.find((item) => item.rank === 3);

  const podiumSlots = [
    { data: second, crown: "🥈", rankClass: "rank-2", rankNum: 2 },
    { data: first, crown: "👑", rankClass: "rank-1", rankNum: 1 },
    { data: third, crown: "🥉", rankClass: "rank-3", rankNum: 3 },
  ];

  return (
    <div className="lb-podium-wrap">
      {podiumSlots.map(({ data, crown, rankClass, rankNum }) => {
        if (!data) {
          return (
            <div key={rankNum} className={`lb-podium-card ${rankClass}`} style={{ opacity: 0.5 }}>
              <div className="lb-podium-crown">{crown}</div>
              <p style={{ marginTop: "40px", color: "#8C827A", fontSize: "13px" }}>Unclaimed</p>
            </div>
          );
        }

        const isCurrentUser = isCompanyView
          ? Boolean(
              (currentUserId && (
                (data.ownerUserId && String(data.ownerUserId) === String(currentUserId)) ||
                (data.userId && String(data.userId) === String(currentUserId))
              )) ||
              (currentUserName && (
                (data.ownerUserName && data.ownerUserName.toLowerCase() === currentUserName) ||
                (data.userName && data.userName.toLowerCase() === currentUserName)
              ))
            )
          : isCharityView
          ? Boolean(
              (currentUserId && (
                (data.ownerUserId && String(data.ownerUserId) === String(currentUserId)) ||
                (data.userId && String(data.userId) === String(currentUserId))
              )) ||
              (currentUserName && data.userName && data.userName.toLowerCase() === currentUserName)
            )
          : Boolean(
              (currentUserId && String(data.userId) === String(currentUserId)) ||
              (currentUserName && data.userName && data.userName.toLowerCase() === currentUserName)
            );

        const profileLink = isCompanyView
          ? `/profile/${data.ownerUserName || data.slug}`
          : `/profile/${data.userName}`;

        const avatar = isCompanyView
          ? data.logoUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=150"
          : isCharityView
          ? data.logoUrl || "https://images.unsplash.com/photo-1469571480202-8bcc9fd2f3a7?w=150"
          : data.profileImageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

        const title = isCompanyView ? data.brandName : data.name;
        const subTitle = isCompanyView
          ? `@${data.ownerUserName || data.slug}`
          : isCharityView
          ? `@${data.userName || data.slug || "verified"}`
          : `@${data.userName}`;

        return (
          <div
            key={data.rank}
            ref={isCurrentUser ? currentUserRef : null}
            className={`lb-podium-card ${rankClass} ${isCurrentUser ? "is-current-user" : ""}`}
          >
            <div className="lb-podium-crown">{crown}</div>

            <div className="lb-avatar-container">
              <img src={avatar} alt={title} className="lb-avatar-img" />
              <div className="lb-rank-badge">{data.rank}</div>
            </div>

            <Link to={profileLink} className="lb-podium-name">
              <span>{title}</span>
              {data.isVerified && <CheckCircle2 size={14} color="#0D6B5E" />}
              {isCurrentUser && (
                <span className="lb-current-user-tag">
                  <Sparkles size={10} /> {isCharityView ? "YOUR CAUSE" : isCompanyView ? "YOUR BRAND" : "YOU"}
                </span>
              )}
            </Link>

            <span className="lb-podium-username">{subTitle}</span>

            {isCharityView && (
              <div
                className="lb-podium-tier-pill"
                style={{ backgroundColor: "#E1F5EE", color: "#0D6B5E" }}
              >
                <span>{data.categoryIcon || "🛡️"}</span>
                <span>{data.categoryLabel || "Verified Charity"}</span>
              </div>
            )}

            {isCompanyView && (
              <div
                className="lb-podium-tier-pill"
                style={{ backgroundColor: "#F0FDF4", color: "#166534" }}
              >
                <Building2 size={11} />
                <span>Impact Brand</span>
              </div>
            )}

            {!isCompanyView && !isCharityView && data.tier && (
              <div
                className="lb-podium-tier-pill"
                style={{ backgroundColor: data.tierBg, color: data.tierColor }}
              >
                <span>{data.tierIcon}</span>
                <span>{data.tier} Donor</span>
              </div>
            )}

            <div className="lb-podium-metric">
              <div className="lb-metric-value">
                {isCompanyView
                  ? `${(data.impactCoinsGenerated || 0).toLocaleString()} Coins`
                  : `${(data.totalCoins || 0).toLocaleString()} Coins`}
              </div>
              <div className="lb-metric-label">
                {isCompanyView
                  ? `${data.unitsSold || 0} Products Sold`
                  : isCharityView
                  ? `${data.donorCount || 0} Supporters (${data.donationCount || 0} Donations)`
                  : `${data.donationCount || 0} Donations Made`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
