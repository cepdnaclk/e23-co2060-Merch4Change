import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Context";
import { getTopCustomers } from "../../api/profileService";
import apiClient from "../../api/apiClient";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  Heart,
  Users,
  Coins,
  Sparkles,
  Trophy,
  ArrowLeft,
  Search,
  CheckCircle2,
  ChevronRight,
  Filter,
  Flame,
  Award,
  ShieldCheck,
} from "lucide-react";
import "./AllDonorsPage.css";

export default function AllDonorsPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [data, setData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [sortBy, setSortBy] = useState("rank"); // "rank" | "coins" | "donations" | "recent"
  const currentUserRowRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.success && res.data?.data?.user) {
          setProfileData(res.data.data.user);
        }
      } catch (err) {
        // Fallback to authUser
        if (authUser) setProfileData(authUser);
      }
    };

    fetchCurrentUserProfile();
  }, [authUser]);

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
        console.error("Error fetching all donors:", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [username]);

  const supporters = useMemo(() => {
    return data?.topSupporters || data?.topDonors || data?.donors || [];
  }, [data]);

  const entity = data?.entity || {
    name: username,
    userName: username,
    accountType: "organization",
  };

  // Determine current user match
  const currentUserId = profileData?._id || profileData?.id || authUser?.id;
  const currentUserName = (profileData?.userName || authUser?.userName || "").toLowerCase();

  const currentUserDonation = useMemo(() => {
    if (!supporters.length) return null;
    return supporters.find((s) => {
      const idMatch = currentUserId && String(s.userId) === String(currentUserId);
      const usernameMatch = s.userName && s.userName.toLowerCase() === currentUserName;
      return idMatch || usernameMatch;
    });
  }, [supporters, currentUserId, currentUserName]);

  // Filtered & sorted supporters
  const filteredSupporters = useMemo(() => {
    let list = [...supporters];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.userName && s.userName.toLowerCase().includes(q))
      );
    }

    if (selectedTier !== "all") {
      list = list.filter((s) => (s.tier || "").toLowerCase() === selectedTier.toLowerCase());
    }

    if (sortBy === "coins") {
      list.sort((a, b) => (b.totalCoinsDonated || 0) - (a.totalCoinsDonated || 0));
    } else if (sortBy === "donations") {
      list.sort((a, b) => (b.donationsCount || 0) - (a.donationsCount || 0));
    } else if (sortBy === "recent") {
      list.sort((a, b) => new Date(b.lastDonatedAt || 0) - new Date(a.lastDonatedAt || 0));
    } else {
      // Default: rank
      list.sort((a, b) => a.rank - b.rank);
    }

    return list;
  }, [supporters, searchQuery, selectedTier, sortBy]);

  const scrollToMyRanking = () => {
    if (currentUserRowRef.current) {
      currentUserRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      currentUserRowRef.current.classList.add("pulse-highlight");
      setTimeout(() => {
        currentUserRowRef.current?.classList.remove("pulse-highlight");
      }, 2500);
    }
  };

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
        <main className="lum-main-content all-donors-main">
          <div className="all-donors-container">
            {/* ── BREADCRUMB & BACK LINK ── */}
            <div className="all-donors-breadcrumb">
              <Link to={`/profile/${username}`} className="all-donors-back-btn">
                <ArrowLeft size={16} />
                <span>Back to {entity.name || username}'s Profile</span>
              </Link>
            </div>

            {/* ── HERO BANNER ── */}
            <div className="all-donors-hero">
              <div className="all-donors-hero-content">
                <div className="all-donors-entity-row">
                  {entity.logoUrl ? (
                    <img
                      src={entity.logoUrl}
                      alt={entity.name}
                      className="all-donors-entity-avatar"
                    />
                  ) : (
                    <div className="all-donors-entity-avatar-placeholder">
                      <Heart size={28} color="#0D6B5E" />
                    </div>
                  )}
                  <div>
                    <div className="all-donors-verified-badge">
                      <ShieldCheck size={14} color="#0D6B5E" />
                      <span>Verified Organization Directory</span>
                    </div>
                    <h1 className="all-donors-title">{entity.name}</h1>
                    <p className="all-donors-subtitle">
                      Honoring every supporter who contributed impact coins to advance our community causes.
                    </p>
                  </div>
                </div>

                <div className="all-donors-hero-actions">
                  <button
                    onClick={() =>
                      navigate(
                        `/donate?charityName=${encodeURIComponent(entity.name)}&charityId=${entity.id || ""}`
                      )
                    }
                    className="all-donors-donate-btn"
                  >
                    <Heart size={16} />
                    <span>Donate Impact Coins</span>
                  </button>
                </div>
              </div>

              {/* ── STATS ROW ── */}
              <div className="all-donors-stats-grid">
                <div className="all-donors-stat-card">
                  <div className="all-donors-stat-icon icon-users">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="all-donors-stat-val">
                      {data?.totalDonorsCount || supporters.length}
                    </div>
                    <div className="all-donors-stat-label">Community Donors</div>
                  </div>
                </div>

                <div className="all-donors-stat-card">
                  <div className="all-donors-stat-icon icon-coins">
                    <Coins size={20} />
                  </div>
                  <div>
                    <div className="all-donors-stat-val">
                      {(data?.totalCoinsRaised || 0).toLocaleString()}
                    </div>
                    <div className="all-donors-stat-label">Impact Coins Raised</div>
                  </div>
                </div>

                <div className="all-donors-stat-card">
                  <div className="all-donors-stat-icon icon-impact">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="all-donors-stat-val">
                      LKR {(data?.totalImpactValue || (data?.totalCoinsRaised || 0) * 10).toLocaleString()}
                    </div>
                    <div className="all-donors-stat-label">Real Impact Created</div>
                  </div>
                </div>

                <div className="all-donors-stat-card">
                  <div className="all-donors-stat-icon icon-trophy">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="all-donors-stat-val">
                      {data?.totalDonationsCount || supporters.length}
                    </div>
                    <div className="all-donors-stat-label">Total Contributions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CURRENT USER HIGHLIGHT CALLOUT ── */}
            {currentUserDonation ? (
              <div className="all-donors-user-callout user-found">
                <div className="all-donors-user-callout-left">
                  <div className="all-donors-user-badge">
                    <Trophy size={16} color="#D4820A" />
                    <span>Your Donor Standing</span>
                  </div>
                  <div className="all-donors-user-rank-box">
                    <div className="all-donors-user-rank">#{currentUserDonation.rank}</div>
                    <div className="all-donors-user-details">
                      <h3>
                        You are ranked <strong>#{currentUserDonation.rank}</strong> among all {supporters.length} donors!
                      </h3>
                      <p>
                        You've contributed{" "}
                        <strong>{currentUserDonation.totalCoinsDonated.toLocaleString()} Coins</strong> (≈ LKR{" "}
                        {(currentUserDonation.totalCoinsDonated * 10).toLocaleString()}) across{" "}
                        <strong>{currentUserDonation.donationsCount} contribution{currentUserDonation.donationsCount === 1 ? "" : "s"}</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="all-donors-user-callout-actions">
                  <div
                    className="all-donors-tier-badge"
                    style={{
                      background: currentUserDonation.tierBg,
                      color: currentUserDonation.tierColor,
                    }}
                  >
                    <span>{currentUserDonation.tierIcon}</span>
                    <span>{currentUserDonation.tier}</span>
                  </div>
                  <button onClick={scrollToMyRanking} className="all-donors-jump-btn">
                    <span>Jump to my position</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="all-donors-user-callout user-not-found">
                <div className="all-donors-user-callout-left">
                  <div className="all-donors-callout-icon-wrap">
                    <Award size={24} color="#0D6B5E" />
                  </div>
                  <div>
                    <h3>You haven't donated to {entity.name} yet</h3>
                    <p>
                      Join {supporters.length} fellow community members on this leaderboard and make a lasting real-world impact.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(
                      `/donate?charityName=${encodeURIComponent(entity.name)}&charityId=${entity.id || ""}`
                    )
                  }
                  className="all-donors-claim-spot-btn"
                >
                  <Heart size={15} />
                  <span>Claim Your Donor Spot</span>
                </button>
              </div>
            )}

            {/* ── CONTROLS: SEARCH, FILTERS & SORT ── */}
            <div className="all-donors-controls">
              <div className="all-donors-search-box">
                <Search size={18} color="#8C827A" />
                <input
                  type="text"
                  placeholder="Search donors by name or @username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="all-donors-clear-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="all-donors-filter-group">
                <div className="all-donors-tier-pills">
                  {["all", "Diamond", "Platinum", "Gold", "Silver", "Bronze"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`all-donors-filter-pill ${
                        selectedTier.toLowerCase() === tier.toLowerCase() ? "active" : ""
                      }`}
                    >
                      {tier === "all" ? "All Tiers" : tier}
                    </button>
                  ))}
                </div>

                <div className="all-donors-sort-wrapper">
                  <span className="all-donors-sort-label">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="all-donors-sort-select"
                  >
                    <option value="rank">Leaderboard Rank</option>
                    <option value="coins">Most Coins</option>
                    <option value="donations">Contribution Count</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── DONORS TABLE ── */}
            {loading ? (
              <div className="all-donors-loading">
                <div className="all-donors-spinner" />
                <p>Loading donor rankings...</p>
              </div>
            ) : filteredSupporters.length === 0 ? (
              <div className="all-donors-empty-card">
                <Users size={36} color="#B5ACA4" />
                <h3>No supporters found</h3>
                <p>No community donors match your current search or tier filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTier("all");
                  }}
                  className="all-donors-reset-filter-btn"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="all-donors-table-card">
                <div className="all-donors-table-head">
                  <div className="col-rank">Rank</div>
                  <div className="col-donor">Community Donor</div>
                  <div className="col-tier">Tier Level</div>
                  <div className="col-amount">Coins Donated</div>
                  <div className="col-count">Contributions</div>
                  <div className="col-impact">Impact Value</div>
                  <div className="col-date">Last Active</div>
                </div>

                <div className="all-donors-table-body">
                  {filteredSupporters.map((donor) => {
                    const isCurrentUser =
                      (currentUserId && String(donor.userId) === String(currentUserId)) ||
                      (donor.userName && donor.userName.toLowerCase() === currentUserName);

                    const avatar =
                      donor.profileImageUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";

                    const formattedDate = donor.lastDonatedAt
                      ? new Date(donor.lastDonatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <div
                        key={donor.userId || donor.userName || donor.rank}
                        ref={isCurrentUser ? currentUserRowRef : null}
                        className={`all-donors-table-row ${isCurrentUser ? "is-current-user" : ""} rank-${donor.rank}`}
                      >
                        {/* Rank */}
                        <div className="col-rank">
                          <div className={`rank-badge rank-badge-${donor.rank <= 3 ? donor.rank : "standard"}`}>
                            {donor.rank === 1 ? "🥇" : donor.rank === 2 ? "🥈" : donor.rank === 3 ? "🥉" : `#${donor.rank}`}
                          </div>
                        </div>

                        {/* Donor Info */}
                        <div className="col-donor">
                          <img src={avatar} alt={donor.name} className="donor-avatar" />
                          <div className="donor-text-wrap">
                            <div className="donor-name-line">
                              <Link
                                to={`/profile/${donor.userName}`}
                                className="donor-name-link"
                              >
                                {donor.name}
                              </Link>
                              {donor.isVerified && (
                                <CheckCircle2 size={13} color="#0D6B5E" title="Verified Member" />
                              )}
                              {isCurrentUser && (
                                <span className="current-user-tag">
                                  <Sparkles size={10} /> YOU
                                </span>
                              )}
                            </div>
                            <span className="donor-username">@{donor.userName}</span>
                          </div>
                        </div>

                        {/* Tier */}
                        <div className="col-tier">
                          <span
                            className="tier-pill"
                            style={{
                              background: donor.tierBg || "#FEF3C7",
                              color: donor.tierColor || "#92400E",
                            }}
                          >
                            <span>{donor.tierIcon || "🎖️"}</span>
                            <span>{donor.tier || "Impact Hero"}</span>
                          </span>
                        </div>

                        {/* Coins */}
                        <div className="col-amount">
                          <div className="donor-coins-val">
                            <Coins size={14} color="#D4820A" />
                            <span>{(donor.totalCoinsDonated || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Contributions */}
                        <div className="col-count">
                          <span className="donor-count-val">
                            {donor.donationsCount || 1} donation{donor.donationsCount === 1 ? "" : "s"}
                          </span>
                        </div>

                        {/* Impact LKR */}
                        <div className="col-impact">
                          <span className="donor-impact-val">
                            LKR {((donor.totalCoinsDonated || 0) * 10).toLocaleString()}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="col-date">
                          <span className="donor-date-val">{formattedDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
