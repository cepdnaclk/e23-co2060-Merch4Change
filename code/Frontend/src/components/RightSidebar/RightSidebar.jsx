import React from 'react';
import { Search, Flame, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import SearchDropdown from '../TopNavbar/search/SearchDropdown';
import './RightSidebar.css';
import defaultUserPic from '../../assets/user.svg';
import test from '../../assets/test.jpg';

import { useNavigate } from 'react-router-dom';
import { getSuggestedUsers, followUser } from '../../api/profileService';
import { getLiveAuctionFeed } from '../../services/auctionApi';
import toast from 'react-hot-toast';

function RightSidebarSearch() {
  const { query, setQuery, results, loading, open, setOpen } = useSearch();
  const containerRef = React.useRef(null);

  return (
    <div className="rs-search-container" style={{ position: 'relative' }} ref={containerRef}>
      <Search className="rs-search-icon" size={18} />
      <input 
        type="text" 
        className="rs-search-input" 
        placeholder="Search profiles, drops..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results) setOpen(true); }}
      />
      {loading && <div style={{ marginLeft: 8, fontSize: '12px' }}>⏳</div>}
      <SearchDropdown query={query} results={results} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function SuggestedSection({ showViewAll = false }) {
  const [suggestedUsers, setSuggestedUsers] = React.useState([]);
  const [followingMap, setFollowingMap] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const response = await getSuggestedUsers();
        if (response?.data?.suggestedUsers) {
          setSuggestedUsers(response.data.suggestedUsers);
        }
      } catch (error) {
        console.error("Failed to fetch suggested users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const handleFollow = async (e, user) => {
    e.stopPropagation(); // prevent navigation to profile
    if (followingMap[user._id]) return; // already following in UI

    // Optimistic UI update
    setFollowingMap(prev => ({ ...prev, [user._id]: true }));
    try {
      await followUser(user.userName);
      toast.success(`Followed ${user.firstName || user.userName}`);
    } catch (error) {
      toast.error("Failed to follow user");
      // Revert optimistic update
      setFollowingMap(prev => ({ ...prev, [user._id]: false }));
    }
  };

  const handleNavigate = (username) => {
    navigate(`/profile/${username}`);
  };

  if (loading) return null;
  if (suggestedUsers.length === 0) return null;

  return (
    <div className="rs-card">
      <div className="rs-header">
        <h3>Suggested for You</h3>
        {showViewAll ? <span className="rs-more">View All</span> : <span className="rs-more"></span>}
      </div>
      <div className="rs-users">
        {suggestedUsers.map((user) => (
          <div 
            className="rs-user" 
            key={user._id} 
            onClick={() => handleNavigate(user.userName)}
            style={{ cursor: 'pointer' }}
          >
            <img src={user.profileImageUrl || defaultUserPic} alt={user.userName} />
            <div className="rs-user-info">
              <h4>{user.firstName ? `${user.firstName} ${user.lastName}` : user.userName}</h4>
              <p>@{user.userName}</p>
            </div>
            <button 
              className="rs-follow-btn" 
              onClick={(e) => handleFollow(e, user)}
              style={followingMap[user._id] ? { background: '#f0f2f5', color: '#1a1a1a', border: '1px solid #ccc' } : {}}
            >
              {followingMap[user._id] ? 'Following' : 'Follow'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const LUXURY_TRENDING_TAGS = [
  { tag: "#LuxuryWatches", query: "Watch" },
  { tag: "#SustainableLuxury", query: "Luxury" },
  { tag: "#DesignerLeather", query: "Leather" },
  { tag: "#CashmereCollection", query: "Cashmere" },
  { tag: "#FineJewelry", query: "Jewelry" },
  { tag: "#SilkApparel", query: "Silk" },
  { tag: "#HandcraftedArt", query: "Crafted" },
];

function formatTimeLeft(endTime) {
  if (!endTime) return { label: "Ending soon", ended: false, urgent: false };
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) return { label: "Ended", ended: true, urgent: false };

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  const isUrgent = total < 3600 * 1000;

  if (days > 0) {
    return { label: `${days}d ${hours}h left`, ended: false, urgent: false };
  }
  if (hours > 0) {
    return { label: `${hours}h ${minutes}m left`, ended: false, urgent: isUrgent };
  }
  return {
    label: `${minutes}m ${seconds.toString().padStart(2, "0")}s left`,
    ended: false,
    urgent: true,
  };
}

function formatRelativeTime(dateString) {
  if (!dateString) return "Just now";
  const diffSec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function LiveCommunityAuctionsSection() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = React.useState([]);
  const [recentBids, setRecentBids] = React.useState([]);
  const [stats, setStats] = React.useState({ totalActive: 0, totalBids: 0 });
  const [, setCurrentTime] = React.useState(Date.now());

  // Curated realistic luxury charity auction drops fallback when database has no active drops
  const sampleAuctions = React.useMemo(() => [
    {
      _id: "sample-1",
      isSample: true,
      productId: {
        name: "Vintage Chronograph Gold",
        images: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80"],
        category: "Luxury Watches",
      },
      currentPrice: 850,
      currentBidder: { userName: "marcus_k" },
      endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    },
    {
      _id: "sample-2",
      isSample: true,
      productId: {
        name: "Artisan Full-Grain Leather Bag",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80"],
        category: "Designer Leather",
      },
      currentPrice: 420,
      currentBidder: { userName: "elena_v" },
      endTime: new Date(Date.now() + 115 * 60 * 1000).toISOString(),
    },
    {
      _id: "sample-3",
      isSample: true,
      productId: {
        name: "Sapphire Heritage Ring 1/1",
        images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80"],
        category: "Fine Jewelry",
      },
      currentPrice: 1250,
      currentBidder: { userName: "sophia_r" },
      endTime: new Date(Date.now() + 210 * 60 * 1000).toISOString(),
    },
  ], []);

  const sampleRecentBids = React.useMemo(() => [
    {
      id: "sb-1",
      userName: "marcus_k",
      amount: 850,
      itemName: "Vintage Chronograph Gold",
      timeAgo: "2m ago",
    },
    {
      id: "sb-2",
      userName: "elena_v",
      amount: 420,
      itemName: "Artisan Leather Bag",
      timeAgo: "8m ago",
    },
    {
      id: "sb-3",
      userName: "david_t",
      amount: 1250,
      itemName: "Sapphire Heritage Ring",
      timeAgo: "15m ago",
    },
  ], []);

  const fetchLiveFeed = React.useCallback(async () => {
    try {
      const data = await getLiveAuctionFeed();
      if (data?.success) {
        if (Array.isArray(data.auctions) && data.auctions.length > 0) {
          setAuctions(data.auctions);
        }
        if (Array.isArray(data.recentBids) && data.recentBids.length > 0) {
          setRecentBids(data.recentBids);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      // Retain sample / current feed gracefully
    }
  }, []);

  // Poll live feed every 12 seconds
  React.useEffect(() => {
    fetchLiveFeed();
    const pollTimer = setInterval(fetchLiveFeed, 12000);
    return () => clearInterval(pollTimer);
  }, [fetchLiveFeed]);

  // Tick timer every second for live countdown
  React.useEffect(() => {
    const secondTimer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(secondTimer);
  }, []);

  const displayedAuctions = (auctions.length > 0 ? auctions : sampleAuctions).slice(0, 3);
  const displayedBids = (recentBids.length > 0
    ? recentBids.slice(0, 3).map((b) => ({
        id: b._id,
        userName: b.userId?.userName || "bidder",
        amount: b.amount,
        itemName: b.auctionId?.productId?.name || "Drop Item",
        timeAgo: formatRelativeTime(b.createdAt),
      }))
    : sampleRecentBids
  );

  const handleAuctionClick = (item) => {
    if (item.isSample || !item._id || item._id.startsWith("sample")) {
      navigate("/marketplace");
    } else {
      navigate(`/marketplace/auction/${item._id}`);
    }
  };

  const totalActiveAuctions = stats.totalActive > 0 ? stats.totalActive : displayedAuctions.length;

  return (
    <div className="rs-card rs-live">
      <div className="rs-live-header">
        <div className="rs-live-title-wrap">
          <span className="live-dot" />
          <h3>Live Community</h3>
        </div>
        <span className="rs-live-badge">
          <Flame size={12} /> LIVE AUCTIONS
        </span>
      </div>

      {/* Live Active Auctions List */}
      <div className="rs-auctions-list">
        {displayedAuctions.map((auction) => {
          const product = auction.productId || {};
          const imageSrc = (product.images && product.images[0]) || test;
          const timeLeft = formatTimeLeft(auction.endTime);

          return (
            <div
              key={auction._id}
              className="rs-auction-item"
              onClick={() => handleAuctionClick(auction)}
              role="button"
              tabIndex={0}
              title={`View ${product.name || "Auction"}`}
            >
              <div className="rs-auction-img-wrap">
                <img
                  src={imageSrc}
                  alt={product.name || "Auction item"}
                  onError={(e) => { e.currentTarget.src = test; }}
                />
                <span className={`rs-auction-timer ${timeLeft.urgent ? "urgent" : ""}`}>
                  <Clock size={10} />
                  {timeLeft.label}
                </span>
              </div>

              <div className="rs-auction-info">
                <h4 className="rs-auction-name">{product.name || "Exclusive Luxury Drop"}</h4>
                <div className="rs-auction-bid-row">
                  <div className="rs-bid-price">
                    <span className="rs-bid-label">Bid</span>
                    <span className="rs-bid-val">${auction.currentPrice?.toLocaleString()}</span>
                  </div>
                  <div className="rs-bidder-pill">
                    {auction.currentBidder ? (
                      <span>🏆 @{auction.currentBidder.userName || "bidder"}</span>
                    ) : (
                      <span className="rs-no-bid">Starting bid</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="rs-auction-bid-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAuctionClick(auction);
                }}
              >
                Bid
              </button>
            </div>
          );
        })}
      </div>

      {/* Real-Time Bidding Activity Feed */}
      <div className="rs-live-activity">
        <div className="rs-activity-header">
          <TrendingUp size={13} className="rs-activity-icon" />
          <span>REAL-TIME BIDS</span>
        </div>
        <div className="rs-live-feed">
          {displayedBids.map((bid) => (
            <div key={bid.id} className="rs-live-item">
              <span className="rs-bid-avatar-dot">⚡</span>
              <p>
                <strong>@{bid.userName}</strong> placed{" "}
                <span className="highlight">${bid.amount?.toLocaleString()}</span> on{" "}
                <span className="rs-bid-item-name">{bid.itemName}</span>
                <span className="rs-bid-time"> • {bid.timeAgo}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Happening Now Summary & CTA */}
      <div className="rs-happening">
        <p className="happening-label">HAPPENING NOW</p>
        <h4>{totalActiveAuctions} Charity Auctions Live</h4>
        <button
          type="button"
          className="rs-explore-auctions-btn"
          onClick={() => navigate("/marketplace")}
        >
          Explore All Drops <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}

function RightSidebar({ page = "home" }) {
  const navigate = useNavigate();

  const handleTagClick = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (page === "profile") {
    return (
      <aside className="right-sidebar right-sidebar-profile">
        <RightSidebarSearch />
        <SuggestedSection showViewAll />

        <div className="rs-card">
          <div className="rs-header">
            <h3>USER'S TOP DROPS</h3>
          </div>
          <div className="widget-drops">
            <div className="drop-card">
              <div className="drop-img drop-bg-1"></div>
              <div className="drop-info">
                <h4>Chrome Essence</h4>
                <p>Ed. 1 of 50 &bull; $45.00</p>
              </div>
            </div>
            <div className="drop-card">
              <div className="drop-img drop-bg-2"></div>
              <div className="drop-info">
                <h4>Velocity Red V2</h4>
                <p>Exclusive &bull; $210.00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rs-card">
          <div className="rs-header">
            <h3>RECENT REVIEWS</h3>
          </div>
          <div className="widget-reviews">
            <div className="review-item">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"The quality of the digital assets is unmatched. Alex is a visionary."</p>
              <div className="reviewer">
                <img src={test} alt="user" />
                <span>@sasha_g &bull; 2d ago</span>
              </div>
            </div>
            <div className="review-item">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p>"Beautiful aesthetic, fast delivery on physical drops. 10/10 recommend."</p>
              <div className="reviewer">
                <img src={test} alt="user" />
                <span>@j_vose &bull; 4d ago</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="right-sidebar">
      <RightSidebarSearch />
      <SuggestedSection />

      <div className="rs-card">
        <div className="rs-header">
          <h3>Trending Topics</h3>
        </div>
        <div className="rs-tags">
          {LUXURY_TRENDING_TAGS.map((item) => (
            <button
              key={item.tag}
              type="button"
              className="rs-tag"
              onClick={() => handleTagClick(item.query)}
              title={`Search for ${item.query}`}
            >
              {item.tag}
            </button>
          ))}
        </div>
      </div>

      <LiveCommunityAuctionsSection />

      <div className="rs-footer">
        <a href="#">About</a>
        <a href="#">Accessibility</a>
        <a href="#">Help Center</a>
        <a href="#">Privacy & Terms</a>
        <a href="#">Advertising</a>
        <p>© 2026 Merch4Change</p>
      </div>
    </div>
  );
}

export default RightSidebar;
