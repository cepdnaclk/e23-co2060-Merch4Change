import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getDonorLeaderboard,
  getCompanyLeaderboard,
  getCharityLeaderboard,
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
  Search,
} from "lucide-react";

const ENTITY_LABELS = {
  donors: { singular: "donor", plural: "donors" },
  companies: { singular: "brand", plural: "brands" },
  charities: { singular: "charity", plural: "charities" },
};

const getEntityLabel = (type, count) => {
  const entity = ENTITY_LABELS[type] || ENTITY_LABELS.donors;
  return count === 1 ? entity.singular : entity.plural;
};

export default function LeaderboardSection() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const currentUserRef = useRef(null);

  const [activeType, setActiveType] = useState("donors"); // "donors" | "companies" | "charities"
  const [timeframe, setTimeframe] = useState("all_time"); // "all_time" | "month" | "week"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("all"); // "all" | "diamond" | "platinum" | "gold" | "silver" | "bronze"
  const [selectedCategory, setSelectedCategory] = useState("all"); // "all" | "health" | "education" | ...
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldScrollToUser, setShouldScrollToUser] = useState(false);

  const handleTypeChange = (type) => {
    setActiveType(type);
    setSearchQuery("");
    setSelectedTier("all");
    setSelectedCategory("all");
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTier("all");
    setSelectedCategory("all");
  };

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

  // Filtered leaderboard dataset according to search, tier, and category
  const filteredData = useMemo(() => {
    let list = [...leaderboardData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        if (activeType === "companies") {
          return (
            (item.brandName && item.brandName.toLowerCase().includes(q)) ||
            (item.ownerUserName && item.ownerUserName.toLowerCase().includes(q)) ||
            (item.slug && item.slug.toLowerCase().includes(q))
          );
        } else if (activeType === "charities") {
          return (
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.userName && item.userName.toLowerCase().includes(q)) ||
            (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q)) ||
            (item.category && item.category.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
          );
        } else {
          return (
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.userName && item.userName.toLowerCase().includes(q))
          );
        }
      });
    }

    if (activeType === "donors" && selectedTier !== "all") {
      list = list.filter(
        (item) => (item.tier || "").toLowerCase() === selectedTier.toLowerCase()
      );
    }

    if (activeType === "charities" && selectedCategory !== "all") {
      list = list.filter(
        (item) => (item.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return list;
  }, [leaderboardData, searchQuery, selectedTier, selectedCategory, activeType]);

  const isFiltered = Boolean(
    searchQuery.trim() ||
    (activeType === "donors" && selectedTier !== "all") ||
    (activeType === "charities" && selectedCategory !== "all")
  );

  // Find user entry in current leaderboard view
  const currentUserEntry = useMemo(() => {
    if (!leaderboardData.length) return null;
    return leaderboardData.find((entry) => {
      if (activeType === "companies") {
        return Boolean(currentUserName && entry.ownerUserName && entry.ownerUserName.toLowerCase() === currentUserName);
      } else if (activeType === "charities") {
        return Boolean(currentUserName && entry.userName && entry.userName.toLowerCase() === currentUserName);
      } else {
        const idMatch = currentUserId && String(entry.userId) === String(currentUserId);
        const usernameMatch = currentUserName && entry.userName && entry.userName.toLowerCase() === currentUserName;
        return idMatch || usernameMatch;
      }
    });
  }, [leaderboardData, activeType, currentUserId, currentUserName]);

  const performScrollToUser = () => {
    if (currentUserRef.current) {
      currentUserRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      currentUserRef.current.classList.add("pulse-highlight");
      setTimeout(() => {
        currentUserRef.current?.classList.remove("pulse-highlight");
      }, 2500);
      return true;
    }
    return false;
  };

  const scrollToMyPosition = () => {
    if (isFiltered) {
      // Check if current user is in filteredData; if not, reset filters first
      const userInFiltered = filteredData.some((entry) => {
        if (activeType === "companies") {
          return Boolean(currentUserName && entry.ownerUserName && entry.ownerUserName.toLowerCase() === currentUserName);
        } else if (activeType === "charities") {
          return Boolean(currentUserName && entry.userName && entry.userName.toLowerCase() === currentUserName);
        } else {
          const idMatch = currentUserId && String(entry.userId) === String(currentUserId);
          const usernameMatch = currentUserName && entry.userName && entry.userName.toLowerCase() === currentUserName;
          return idMatch || usernameMatch;
        }
      });

      if (!userInFiltered) {
        resetFilters();
        setShouldScrollToUser(true);
        return;
      }
    }

    if (!performScrollToUser()) {
      setShouldScrollToUser(true);
    }
  };

  // Reactively scroll to user once DOM is updated and rendered
  useEffect(() => {
    if (!shouldScrollToUser) return;

    if (currentUserRef.current) {
      const rafId = requestAnimationFrame(() => {
        if (currentUserRef.current) {
          currentUserRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          currentUserRef.current.classList.add("pulse-highlight");
          setTimeout(() => {
            currentUserRef.current?.classList.remove("pulse-highlight");
          }, 2500);
        }
      });
      setShouldScrollToUser(false);
      return () => cancelAnimationFrame(rafId);
    }
  }, [shouldScrollToUser, filteredData]);

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
    let fetchLeaderboard;
    if (activeType === "donors") {
      fetchLeaderboard = getDonorLeaderboard(timeframe);
    } else if (activeType === "companies") {
      fetchLeaderboard = getCompanyLeaderboard(timeframe);
    } else {
      fetchLeaderboard = getCharityLeaderboard(timeframe);
    }

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
        {/* Toggle between Donors, Companies, and Charities */}
        <div className="lb-toggle-group">
          <button
            className={`lb-toggle-btn ${activeType === "donors" ? "active" : ""}`}
            onClick={() => handleTypeChange("donors")}
          >
            <Users size={16} />
            <span>Community Donors</span>
          </button>
          <button
            className={`lb-toggle-btn ${activeType === "companies" ? "active" : ""}`}
            onClick={() => handleTypeChange("companies")}
          >
            <Building2 size={16} />
            <span>Companies & Brands</span>
          </button>
          <button
            className={`lb-toggle-btn ${activeType === "charities" ? "active" : ""}`}
            onClick={() => handleTypeChange("charities")}
          >
            <HeartHandshake size={16} />
            <span>Top Charities & Causes</span>
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

      {/* Search & Tier/Category Filter Bar */}
      <div className="lb-filter-panel">
        <div className="lb-search-input-wrap">
          <Search size={17} className="lb-search-icon" />
          <input
            type="text"
            className="lb-search-input"
            placeholder={
              activeType === "companies"
                ? "Search brands by name, @handle, or slug..."
                : activeType === "charities"
                ? "Search charities by name, cause, or @username..."
                : "Search community donors by name or @username..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="lb-search-clear-btn"
              title="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {activeType === "donors" && (
          <div className="lb-tier-filter-pills">
            <span className="lb-tier-filter-label">Tier:</span>
            {[
              { id: "all", label: "All Tiers", icon: "" },
              { id: "diamond", label: "Diamond", icon: "💎" },
              { id: "platinum", label: "Platinum", icon: "👑" },
              { id: "gold", label: "Gold", icon: "🥇" },
              { id: "silver", label: "Silver", icon: "🥈" },
              { id: "bronze", label: "Bronze", icon: "🥉" },
            ].map((tier) => (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`lb-tier-pill ${selectedTier.toLowerCase() === tier.id.toLowerCase() ? "active" : ""}`}
              >
                {tier.icon && <span>{tier.icon}</span>}
                <span>{tier.label}</span>
              </button>
            ))}
          </div>
        )}

        {activeType === "charities" && (
          <div className="lb-tier-filter-pills">
            <span className="lb-tier-filter-label">Cause:</span>
            {[
              { id: "all", label: "All Causes", icon: "" },
              { id: "health", label: "Health", icon: "🩺" },
              { id: "education", label: "Education", icon: "📚" },
              { id: "environment", label: "Nature", icon: "🌱" },
              { id: "humanitarian", label: "Humanitarian", icon: "❤️" },
              { id: "animal", label: "Animal", icon: "🐾" },
              { id: "other", label: "Community", icon: "🛡️" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`lb-tier-pill ${selectedCategory.toLowerCase() === cat.id.toLowerCase() ? "active" : ""}`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}
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
                    <Sparkles size={13} />{" "}
                    {activeType === "companies"
                      ? "Your Brand Standing"
                      : activeType === "charities"
                      ? "Your Charity Standing"
                      : "Your Global Standing"}
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
                  {activeType === "charities" && (
                    <span
                      className="lb-podium-tier-pill"
                      style={{
                        backgroundColor: "#E1F5EE",
                        color: "#0D6B5E",
                        margin: 0,
                      }}
                    >
                      <span>{currentUserEntry.categoryIcon || "🛡️"}</span>
                      <span>{currentUserEntry.categoryLabel || "Verified Charity"}</span>
                    </span>
                  )}
                </div>
                <h3>
                  You are ranked <strong>#{currentUserEntry.rank}</strong>
                  {activeType === "donors" && stats?.totalCommunityDonors
                    ? ` out of ${stats.totalCommunityDonors.toLocaleString()} members`
                    : activeType === "charities" && stats?.verifiedCharitiesSupported
                    ? ` out of ${stats.verifiedCharitiesSupported.toLocaleString()} organizations`
                    : activeType === "companies" && stats?.totalPartnerBrands
                    ? ` out of ${stats.totalPartnerBrands.toLocaleString()} brands`
                    : ""}{" "}
                  on the leaderboard!
                </h3>
                <p>
                  {activeType === "companies"
                    ? `Your brand has generated ${(currentUserEntry.impactCoinsGenerated || 0).toLocaleString()} coins across ${currentUserEntry.unitsSold || 0} products sold.`
                    : activeType === "charities"
                    ? `Your charity has received ${(currentUserEntry.totalCoins || 0).toLocaleString()} coins from ${currentUserEntry.donorCount || 0} supporters across ${currentUserEntry.donationCount || 0} donations.`
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
                    : activeType === "charities"
                    ? "Verified Charities & Causes Leaderboard"
                    : "You're not ranked on the global leaderboard yet"}
                </h3>
                <p>
                  {activeType === "companies"
                    ? "List impact products and sell merchandise to generate impact coins and claim your brand's spot!"
                    : activeType === "charities"
                    ? "Support verified organizations and help real-world causes rise to the top of community impact rankings!"
                    : "Donate coins to verified charity projects to earn donor rank and claim your spot among top community donors!"}
                </p>
              </div>
            </div>
            {activeType === "companies" ? (
              <Link to="/marketplace" className="lb-standing-cta-btn">
                <span>Explore Marketplace</span>
              </Link>
            ) : (
              <Link to="/donate" className="lb-standing-cta-btn">
                <Heart size={15} />
                <span>{activeType === "charities" ? "Support a Cause" : "Make a Donation"}</span>
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
      ) : isFiltered ? (
        filteredData.length === 0 ? (
          <div className="lb-empty-box">
            <Users size={44} style={{ color: "#B5ACA4", marginBottom: "14px" }} />
            <h3>No matching {getEntityLabel(activeType, 0)} found</h3>
            <p>
              No rankings match your current search &ldquo;{searchQuery}&rdquo;
              {activeType === "donors" && selectedTier !== "all" ? ` or tier &ldquo;${selectedTier}&rdquo;` : ""}
              {activeType === "charities" && selectedCategory !== "all" ? ` or cause &ldquo;${selectedCategory}&rdquo;` : ""}.
            </p>
            <button
              onClick={resetFilters}
              className="lb-reset-filters-btn"
              type="button"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="lb-filter-results-info">
              <span>
                Showing <strong>{filteredData.length}</strong> matching {getEntityLabel(activeType, filteredData.length)}
                {searchQuery && <> for &ldquo;<strong>{searchQuery}</strong>&rdquo;</>}
                {activeType === "donors" && selectedTier !== "all" && <> in <strong>{selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Tier</strong></>}
                {activeType === "charities" && selectedCategory !== "all" && <> in <strong>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Cause</strong></>}
              </span>
              <button
                onClick={resetFilters}
                className="lb-clear-filter-text-btn"
                type="button"
              >
                Reset filters
              </button>
            </div>

            <LeaderboardTable
              rows={filteredData}
              isCompanyView={activeType === "companies"}
              isCharityView={activeType === "charities"}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserRef={currentUserRef}
            />
          </>
        )
      ) : (
        <>
          {/* Top 3 Podium */}
          <LeaderboardPodium
            topThree={topThree}
            isCompanyView={activeType === "companies"}
            isCharityView={activeType === "charities"}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRef={currentUserRef}
          />

          {/* Ranked List (4 to 50) */}
          <LeaderboardTable
            rows={remainingRows}
            isCompanyView={activeType === "companies"}
            isCharityView={activeType === "charities"}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserRef={currentUserRef}
          />
        </>
      )}
    </div>
  );
}
