import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Coins,
  CreditCard,
  Heart,
  ShieldCheck,
  Sparkles,
  Trophy,
  Building2,
  Check,
  FolderHeart,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import apiClient from "../../api/apiClient";
import { createVerifiedDonation } from "../../api/donationsService";
import { listDonationProjects } from "../../services/charityApi";
import "./DonatePage.css";

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000];

export default function DonatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Layout & Profile state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [userCoins, setUserCoins] = useState(0);

  // Projects list & loading
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Selected Project State (Dynamic)
  const initialProjectId = searchParams.get("projectId") || "";
  const initialProjectName = searchParams.get("projectName") || "";
  const initialCharityId = searchParams.get("charityId") || "";
  const initialCharityName = searchParams.get("charityName") || "";
  const initialGoal = Number(searchParams.get("goal")) || 0;
  const initialCollected = Number(searchParams.get("collected")) || 0;

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedProject, setSelectedProject] = useState(null);

  // Payment Mode: "coins" | "money"
  const [paymentMode, setPaymentMode] = useState("coins");

  // Coin Form State
  const [coinAmount, setCoinAmount] = useState(100);
  const [customInput, setCustomInput] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successReceipt, setSuccessReceipt] = useState(null);

  // 1. Fetch user profile & latest coin balance
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, coinsRes] = await Promise.all([
          apiClient.get("/api/v1/profile/me").catch(() => null),
          apiClient.get("/api/v1/profile/me/coins").catch(() => null),
        ]);

        if (profileRes?.data?.success) {
          setProfileData(profileRes.data.data.user || {});
        }
        if (coinsRes?.data?.success) {
          setUserCoins(Number(coinsRes.data.data.coinBalance ?? 0));
        } else if (profileRes?.data?.data?.user?.coinBalance !== undefined) {
          setUserCoins(Number(profileRes.data.data.user.coinBalance));
        }
      } catch (err) {
        console.error("Error loading user data in DonatePage:", err);
      }
    };

    fetchUserData();
  }, []);

  // 2. Fetch Active Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await listDonationProjects();
        const rawProjects = res?.data?.projects || [];
        setProjects(rawProjects);

        // Resolve active project
        let targetProj = null;
        if (selectedProjectId) {
          targetProj = rawProjects.find((p) => (p.id || p._id) === selectedProjectId);
        } else if (initialProjectName) {
          targetProj = rawProjects.find((p) => p.title?.toLowerCase() === initialProjectName.toLowerCase());
        } else if (initialCharityId) {
          targetProj = rawProjects.find((p) => String(p.charityId) === String(initialCharityId));
        }

        // If not found in API list but provided via query params or charityId provided, build fallback object
        if (!targetProj && (initialProjectId || initialProjectName || initialCharityId)) {
          targetProj = {
            id: initialProjectId || (initialCharityId ? `charity-fund-${initialCharityId}` : "custom-project"),
            _id: initialProjectId || (initialCharityId ? `charity-fund-${initialCharityId}` : "custom-project"),
            title: initialProjectName || (initialCharityName ? `${initialCharityName} Impact Fund` : "Selected Cause Initiative"),
            description: "Direct community impact initiative funded by Merch4Change contributions.",
            goalAmount: initialGoal || 10000,
            collectedAmount: initialCollected || 0,
            charityId: initialCharityId,
            charityName: initialCharityName || "Verified Partner Non-Profit",
          };
        } else if (!targetProj && rawProjects.length > 0) {
          targetProj = rawProjects[0];
        }

        if (targetProj) {
          setSelectedProjectId(targetProj.id || targetProj._id);
          setSelectedProject(targetProj);
        }
      } catch (err) {
        console.error("Error fetching donation projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle Project Switcher
  const handleProjectSelect = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);
    const found = projects.find((p) => (p.id || p._id) === projId);
    if (found) {
      setSelectedProject(found);
    }
    setErrorMsg("");
  };

  // Handle Preset selection
  const handlePresetSelect = (amt) => {
    setCoinAmount(amt);
    setCustomInput(String(amt));
    setErrorMsg("");
  };

  // Handle Custom Input
  const handleCustomInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomInput(val);
    const parsed = parseInt(val, 10) || 0;
    setCoinAmount(parsed);
    setErrorMsg("");
  };

  // Handle Coin Donation Submit
  const handleCoinDonationSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedProject && !selectedProjectId) {
      setErrorMsg("Please select an active project to support.");
      return;
    }

    if (coinAmount < 1) {
      setErrorMsg("Please enter at least 1 coin to donate.");
      return;
    }

    if (coinAmount > userCoins) {
      setErrorMsg(`Insufficient coin balance. You have ${userCoins.toLocaleString()} coins.`);
      return;
    }

    setSubmitting(true);
    try {
      const effectiveProjId = selectedProjectId || selectedProject?.id || selectedProject?._id;
      const isCustomProject =
        !effectiveProjId ||
        String(effectiveProjId).startsWith("custom-") ||
        String(effectiveProjId).startsWith("charity-fund-") ||
        !/^[0-9a-fA-F]{24}$/.test(String(effectiveProjId));

      const payload = {
        charityProjectId: isCustomProject ? undefined : effectiveProjId,
        charityId: selectedProject?.charityId || initialCharityId || undefined,
        coinAmount,
      };

      const res = await createVerifiedDonation(payload);
      if (res?.data?.success) {
        const remaining = res.data.data.coinBalance ?? (userCoins - coinAmount);
        setUserCoins(remaining);

        // Update local collected amount dynamically
        if (selectedProject) {
          setSelectedProject((prev) => ({
            ...prev,
            collectedAmount: (prev.collectedAmount || 0) + coinAmount,
          }));
        }

        setSuccessReceipt({
          projectName: selectedProject?.title || "Community Project Initiative",
          charityName: selectedProject?.charityName || "Verified Non-Profit",
          coinsDonated: coinAmount,
          remainingCoins: remaining,
          transactionId: res.data.data.donation?._id || `TX-${Date.now().toString(36).toUpperCase()}`,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.details?.[0]?.message ||
        "Donation failed. Please check your connection.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const remainingCoinsAfterDonation = Math.max(0, userCoins - (coinAmount || 0));
  const goalAmt = selectedProject?.goalAmount || 0;
  const collectedAmt = selectedProject?.collectedAmount || 0;
  const progressPercent = goalAmt > 0 ? Math.min(100, Math.floor((collectedAmt / goalAmt) * 100)) : 0;

  return (
    <div className={`luminous-app ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <TopNavbar profileData={profileData} isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} />
      <div className="lum-layout">
        <Sidebar profileData={profileData} setIsSidebarCollapsed={setIsSidebarCollapsed} />

        <main className="donate-page-main">
          <div className="donate-container">

            {/* Back to Explore */}
            <Link to="/donations" className="donate-back-btn">
              <ArrowLeft size={18} />
              <span>Back to Causes & Projects</span>
            </Link>

            {/* Page Header */}
            <div className="donate-header">
              <span className="donate-header-tag">Project Giving Portal</span>
              <h1 className="donate-header-title">Contribute to a Project</h1>
              <p className="donate-header-subtitle">
                Every coin donated goes directly to funding your chosen project's verified milestones with transparent impact tracking.
              </p>
            </div>

            {/* ── SUCCESS RECEIPT STATE ── */}
            {successReceipt ? (
              <div className="donate-receipt-card">
                <div className="donate-receipt-icon">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h2 className="donate-receipt-title">Thank You For Your Support!</h2>
                <p className="donate-receipt-subtitle">
                  Your donation of <strong>{successReceipt.coinsDonated.toLocaleString()} coins</strong> was successfully transferred to <strong>{successReceipt.projectName}</strong>.
                </p>

                <div className="donate-receipt-details">
                  <div className="donate-receipt-row">
                    <span style={{ color: "#6B6560" }}>Supported Project:</span>
                    <strong style={{ color: "#1A1A1A" }}>{successReceipt.projectName}</strong>
                  </div>
                  <div className="donate-receipt-row">
                    <span style={{ color: "#6B6560" }}>Organizing Body:</span>
                    <strong style={{ color: "#1A1A1A" }}>{successReceipt.charityName}</strong>
                  </div>
                  <div className="donate-receipt-row">
                    <span style={{ color: "#6B6560" }}>Impact Contribution:</span>
                    <strong style={{ color: "#D4820A" }}>{successReceipt.coinsDonated.toLocaleString()} Coins</strong>
                  </div>
                  <div className="donate-receipt-row">
                    <span style={{ color: "#6B6560" }}>Remaining Balance:</span>
                    <strong style={{ color: "#0D6B5E" }}>{successReceipt.remainingCoins.toLocaleString()} Coins</strong>
                  </div>
                  <div className="donate-receipt-row">
                    <span style={{ color: "#6B6560" }}>Transaction Reference:</span>
                    <code style={{ fontSize: "12px", background: "#EAE5DC", padding: "2px 6px", borderRadius: "4px" }}>
                      {successReceipt.transactionId}
                    </code>
                  </div>
                </div>

                <div className="donate-receipt-actions">
                  <button
                    onClick={() => {
                      setSuccessReceipt(null);
                      setCoinAmount(100);
                      setCustomInput("100");
                    }}
                    style={{
                      background: "#0D6B5E",
                      color: "#FFFFFF",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      border: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Donate to Another Project
                  </button>
                  <button
                    onClick={() => navigate("/leaderboard")}
                    style={{
                      background: "transparent",
                      color: "#D4820A",
                      border: "1.5px solid #D4820A",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Trophy size={16} />
                    <span>View Donor Leaderboard</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── DYNAMIC PROJECT CONTEXT & SELECTOR CARD ── */}
                <div className="donate-summary-card">
                  <div className="donate-project-header-row">
                    <div style={{ flex: 1 }}>
                      <div className="donate-project-badges-row">
                        <span className="donate-charity-badge">
                          <ShieldCheck size={14} /> Verified Project
                        </span>
                        {selectedProject?.charityName && (
                          <span className="donate-org-badge">
                            <Building2 size={13} />
                            <span>Organized by <strong>{selectedProject.charityName}</strong></span>
                          </span>
                        )}
                      </div>

                      <h2 className="donate-project-title">
                        {selectedProject?.title || "Choose a Project to Support"}
                      </h2>

                      {selectedProject?.description && (
                        <p className="donate-project-desc">
                          {selectedProject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Project Selector Dropdown */}
                  {projects.length > 0 && (
                    <div className="donate-project-switcher-box">
                      <label className="donate-select-label">
                        <FolderHeart size={14} style={{ display: "inline", marginRight: "4px" }} />
                        Select / Switch Project
                      </label>
                      <div className="donate-select-wrapper">
                        <select
                          value={selectedProjectId}
                          onChange={handleProjectSelect}
                          className="donate-select-input"
                          disabled={loadingProjects}
                        >
                          {projects.map((p) => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.title} {p.charityName ? `(${p.charityName})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Progress Bar */}
                  {goalAmt > 0 && (
                    <div className="donate-progress-container">
                      <div className="donate-progress-labels">
                        <span>
                          <strong>LKR {collectedAmt.toLocaleString()}</strong> raised of LKR {goalAmt.toLocaleString()} goal
                        </span>
                        <strong style={{ color: "#D4820A" }}>{progressPercent}% Funded</strong>
                      </div>
                      <div className="donate-progress-track">
                        <div className="donate-progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── PAYMENT METHOD SELECTOR TABS ── */}
                <div className="donate-tabs-wrapper">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("coins")}
                    className={`donate-tab-btn ${paymentMode === "coins" ? "active-tab" : ""}`}
                  >
                    <Coins size={18} color="#D4820A" />
                    <span>Pay by Coins</span>
                    <span className="donate-tab-tag donate-tab-tag-active">Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode("money")}
                    className={`donate-tab-btn ${paymentMode === "money" ? "active-tab" : ""}`}
                  >
                    <CreditCard size={18} color="#6B6560" />
                    <span>Pay by Money</span>
                    <span className="donate-tab-tag donate-tab-tag-construction">Under Construction 🚧</span>
                  </button>
                </div>

                {/* ── TAB 1: PAY BY COINS ── */}
                {paymentMode === "coins" && (
                  <div className="donate-checkout-card">
                    <form onSubmit={handleCoinDonationSubmit}>
                      {/* Live Coin Balance Card */}
                      <div className="donate-balance-row">
                        <div>
                          <div className="donate-balance-title">Your Impact Coin Balance</div>
                          <div style={{ fontSize: "12px", color: "#8C5305" }}>
                            Coins earned via marketplace purchases & participation
                          </div>
                        </div>
                        <div className="donate-balance-amount">
                          <Coins size={22} color="#D4820A" />
                          <span>{userCoins.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Presets */}
                      <label className="donate-select-label" style={{ display: "block", marginBottom: "10px" }}>
                        Select Donation Amount (Coins)
                      </label>
                      <div className="donate-presets-grid">
                        {PRESET_AMOUNTS.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => handlePresetSelect(amt)}
                            className={`donate-preset-chip ${coinAmount === amt ? "selected" : ""}`}
                          >
                            +{amt}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handlePresetSelect(userCoins > 0 ? userCoins : 100)}
                          className={`donate-preset-chip ${coinAmount === userCoins && userCoins > 0 ? "selected" : ""}`}
                        >
                          All In ({userCoins})
                        </button>
                      </div>

                      {/* Custom Input */}
                      <div className="donate-input-wrapper">
                        <label className="donate-select-label" style={{ display: "block", marginBottom: "8px" }}>
                          Or Enter Custom Coin Amount
                        </label>
                        <div className="donate-coin-input-box">
                          <span className="donate-coin-symbol">🪙</span>
                          <input
                            type="text"
                            value={customInput}
                            onChange={handleCustomInputChange}
                            placeholder="0"
                            className="donate-coin-input"
                          />
                        </div>
                      </div>

                      {/* Summary Breakdown */}
                      <div className="donate-breakdown-box">
                        <div className="donate-breakdown-row">
                          <span>Target Project:</span>
                          <strong style={{ color: "#1A1A1A" }}>{selectedProject?.title || "Selected Project"}</strong>
                        </div>
                        <div className="donate-breakdown-row">
                          <span>Donation Amount:</span>
                          <strong style={{ color: "#D4820A" }}>{coinAmount.toLocaleString()} Coins</strong>
                        </div>
                        <div className="donate-breakdown-row">
                          <span>Est. Real-world Value:</span>
                          <span>≈ LKR {(coinAmount * 10).toLocaleString()} value</span>
                        </div>
                        <div className="donate-breakdown-row">
                          <span>Remaining Balance:</span>
                          <strong style={{ color: remainingCoinsAfterDonation >= 0 ? "#0D6B5E" : "#DC2626" }}>
                            {remainingCoinsAfterDonation.toLocaleString()} Coins
                          </strong>
                        </div>
                      </div>

                      {/* Error Alert */}
                      {errorMsg && (
                        <div style={{ background: "#FEE2E2", border: "1px solid #EF4444", borderRadius: "12px", padding: "12px 16px", color: "#B91C1C", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                          <AlertTriangle size={18} />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        disabled={submitting || coinAmount < 1 || coinAmount > userCoins || (!selectedProject && !selectedProjectId)}
                        className="donate-submit-btn"
                      >
                        <Sparkles size={18} />
                        <span>
                          {submitting
                            ? "Processing Donation..."
                            : `Donate ${coinAmount.toLocaleString()} Coins to ${selectedProject?.title || "Project"}`}
                        </span>
                      </button>

                      {coinAmount > userCoins && (
                        <p style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#DC2626", marginTop: "12px" }}>
                          You need {(coinAmount - userCoins).toLocaleString()} more coins. Shop on the Marketplace to earn coins!
                        </p>
                      )}
                    </form>
                  </div>
                )}

                {/* ── TAB 2: PAY BY MONEY (UNDER CONSTRUCTION) ── */}
                {paymentMode === "money" && (
                  <div className="construction-card">
                    <div className="construction-icon-wrap">
                      <CreditCard size={36} color="#D4820A" />
                    </div>
                    <h3 className="construction-title">Direct Currency Giving Coming Soon</h3>
                    <p className="construction-desc">
                      We are currently establishing verified low-fee fiat payment rails with institutional bank partners (Credit/Debit cards, Apple Pay, Google Pay, and direct wire transfer) for <strong>{selectedProject?.title || "our initiatives"}</strong>.
                    </p>

                    <div className="construction-gateways-row">
                      <div className="gateway-badge">
                        <span>💳 Visa / Mastercard</span>
                        <span style={{ fontSize: "10px", background: "#FEF3DC", padding: "2px 6px", borderRadius: "4px" }}>In Review</span>
                      </div>
                      <div className="gateway-badge">
                        <span>📱 Apple &amp; Google Pay</span>
                        <span style={{ fontSize: "10px", background: "#FEF3DC", padding: "2px 6px", borderRadius: "4px" }}>Integration</span>
                      </div>
                      <div className="gateway-badge">
                        <span>🏦 Bank Transfer</span>
                        <span style={{ fontSize: "10px", background: "#FEF3DC", padding: "2px 6px", borderRadius: "4px" }}>Planned</span>
                      </div>
                    </div>

                    <div style={{ background: "#FAF7F2", border: "1px solid #E2DAD0", borderRadius: "16px", padding: "24px", maxWidth: "480px", margin: "0 auto 28px", textAlign: "left" }}>
                      <h4 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: "#1A1A1A", margin: "0 0 8px" }}>
                        Why not donate with Impact Coins today?
                      </h4>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#6B6560", lineHeight: 1.6, margin: 0 }}>
                        Every purchase you make on Merch4Change earns you 100% redeemable Impact Coins that transfer directly to verified causes with 0 platform fees.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPaymentMode("coins")}
                      style={{
                        background: "#0D6B5E",
                        color: "#FFFFFF",
                        padding: "14px 28px",
                        borderRadius: "14px",
                        border: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Coins size={18} />
                      <span>Switch to Pay with Impact Coins</span>
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
