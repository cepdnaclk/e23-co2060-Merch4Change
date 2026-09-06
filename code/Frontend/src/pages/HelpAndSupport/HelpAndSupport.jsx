import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Rocket,
  ShoppingBag,
  Heart,
  ShieldCheck,
  KeyRound,
  MessageSquare,
  ChevronDown,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Mail,
  ExternalLink,
} from "lucide-react";
import "./HelpAndSupport.css";

const CATEGORIES = [
  {
    id: "getting-started",
    icon: Rocket,
    title: "Getting Started",
    desc: "Platform basics, creating your account, and understanding how purchases fund causes.",
    count: "6 articles",
    filter: "account",
  },
  {
    id: "orders-shipping",
    icon: ShoppingBag,
    title: "Orders & Shipping",
    desc: "Island-wide delivery timelines, tracking orders, payment methods, and return policies.",
    count: "9 articles",
    filter: "shopping",
  },
  {
    id: "causes-donations",
    icon: Heart,
    title: "Causes & Impact",
    desc: "How funds reach NGOs, real-time donation tracking, and earning Impact Coins.",
    count: "8 articles",
    filter: "donations",
  },
  {
    id: "charity-verification",
    icon: ShieldCheck,
    title: "Charity Verification",
    desc: "Vetting standards, NGO legal requirements, and applying for verified non-profit status.",
    count: "5 articles",
    filter: "verification",
  },
  {
    id: "account-security",
    icon: KeyRound,
    title: "Account & Security",
    desc: "Password recovery, two-step OTP verification, and privacy preferences.",
    count: "4 articles",
    filter: "account",
  },
  {
    id: "contact-team",
    icon: MessageSquare,
    title: "Direct Support",
    desc: "Get in touch with our dedicated support agents. We respond within 24 hours.",
    count: "Online 24/7",
    link: "/help/contact",
  },
];

const FAQ_ITEMS = [
  {
    id: 1,
    category: "shopping",
    question: "How does my purchase support a charity?",
    answer:
      "Every merchandise product listed on Merch4Change is tied to a specific verified cause or campaign. When you complete checkout, a pre-set percentage (or 100% of campaign proceeds) is transferred directly to the organization. You receive instant impact proof in your dashboard.",
  },
  {
    id: 2,
    category: "donations",
    question: "How can I track where my donation goes?",
    answer:
      "Your personal Profile and Donations tab record every rupee funded in real time. We partner exclusively with verified organizations that submit milestone reports, photographic proof, and financial updates as projects advance.",
  },
  {
    id: 3,
    category: "shopping",
    question: "What are the delivery times and shipping costs across Sri Lanka?",
    answer:
      "Standard courier delivery takes 2–3 business days within the Western Province and 3–5 business days island-wide. Delivery fees are computed transparently at checkout based on package weight and district.",
  },
  {
    id: 4,
    category: "verification",
    question: "How does Merch4Change vet and verify organizations?",
    answer:
      "Our compliance team verifies registration documents with the National NGO Secretariat, tax records, and previous project execution before awarding the verified badge. Unverified campaigns cannot list merchandise.",
  },
  {
    id: 5,
    category: "account",
    question: "How do I create an Organization account to fundraise?",
    answer:
      "Select 'Create account as an Organization' on the signup page. Once registered, upload your official NGO documentation and profile to start publishing campaigns and receiving community support.",
  },
  {
    id: 6,
    category: "shopping",
    question: "What is your return and exchange policy?",
    answer:
      "If you receive an incorrect size or defective item, you can request an exchange or full refund within 7 days of delivery. Reach out via our Contact Support form with your Order ID and photo proof.",
  },
];

const FILTER_PILLS = [
  { id: "all", label: "All Topics" },
  { id: "shopping", label: "Shopping & Orders" },
  { id: "donations", label: "Donations & Impact" },
  { id: "verification", label: "NGO Verification" },
  { id: "account", label: "Account & Security" },
];

export default function HelpAndSupport() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(1); // first FAQ open by default

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  // Filter FAQs based on search and selected filter pill
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesFilter =
        activeFilter === "all" || item.category === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [searchQuery, activeFilter]);

  // Filter Categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return CATEGORIES;
    const query = searchQuery.toLowerCase().trim();
    return CATEGORIES.filter(
      (cat) =>
        cat.title.toLowerCase().includes(query) ||
        cat.desc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="help-page">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO & REAL-TIME SEARCH
         ───────────────────────────────────────────────────────────────── */}
      <section className="help-hero">
        <div className="help-hero-ambient" />
        <div className="help-hero-content">
          <div className="help-hero-badge">
            <Sparkles size={14} className="help-sparkle" />
            <span>Merch4Change Support Center</span>
          </div>

          <h1 className="help-hero-title">How can we help you today?</h1>
          <p className="help-hero-sub">
            Search our knowledge base, explore our step-by-step guides, or connect
            directly with our support team.
          </p>

          {/* Search bar */}
          <div className="help-search-container">
            <Search size={20} className="help-search-icon" />
            <input
              type="text"
              className="help-search-input"
              placeholder="Search questions, order help, verification guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search help articles"
            />
            {searchQuery && (
              <button
                type="button"
                className="help-search-clear"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="help-filter-pills">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`help-pill ${activeFilter === pill.id ? "active" : ""}`}
                onClick={() => setActiveFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="help-container">
        {/* ─────────────────────────────────────────────────────────────────
            2. CATEGORY BENTO GRID
           ───────────────────────────────────────────────────────────────── */}
        <section className="help-section">
          <div className="help-section-title-wrap">
            <span className="help-section-eyebrow">Browse by Category</span>
            <h2 className="help-section-heading">Support Topics</h2>
          </div>

          <div className="help-categories-grid">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="help-category-card"
                  onClick={() => {
                    if (cat.link) {
                      navigate(cat.link);
                    } else if (cat.filter) {
                      setActiveFilter(cat.filter);
                      document
                        .getElementById("faqs-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <div className="help-card-top">
                    <div className="help-card-icon-wrap">
                      <Icon size={22} className="help-card-icon" />
                    </div>
                    <span className="help-card-count">{cat.count}</span>
                  </div>

                  <h3 className="help-card-title">{cat.title}</h3>
                  <p className="help-card-desc">{cat.desc}</p>

                  <div className="help-card-action">
                    <span>{cat.link ? "Contact agent" : "View questions"}</span>
                    <ArrowRight size={14} className="help-arrow-icon" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            3. HOW IT WORKS SECTION (RETAINED & ELEVATED)
           ───────────────────────────────────────────────────────────────── */}
        <section id="how-it-works" className="help-how-it-works">
          <div className="help-section-title-wrap text-center">
            <span className="help-section-eyebrow">The Platform</span>
            <h2 className="help-section-heading">
              Three steps to shop with <em>purpose</em>
            </h2>
            <p className="help-section-sub">
              It's simple, 100% transparent, and directly impactful.
            </p>
          </div>

          <div className="help-steps">
            <div className="help-step-card">
              <div className="help-step-badge">01</div>
              <div className="help-step-icon-circle">
                <ShoppingBag size={24} />
              </div>
              <h3 className="help-step-heading">Browse the marketplace</h3>
              <p className="help-step-text">
                Explore thousands of conscious merchandise items created by
                partner brands, creators, and NGOs across Sri Lanka.
              </p>
            </div>

            <div className="help-step-card">
              <div className="help-step-badge">02</div>
              <div className="help-step-icon-circle">
                <Heart size={24} />
              </div>
              <h3 className="help-step-heading">Support a cause</h3>
              <p className="help-step-text">
                Every purchase automatically funds a verified campaign or
                charity of your choosing. You decide where the impact flows.
              </p>
            </div>

            <div className="help-step-card">
              <div className="help-step-badge">03</div>
              <div className="help-step-icon-circle">
                <TrendingUp size={24} />
              </div>
              <h3 className="help-step-heading">Track your impact</h3>
              <p className="help-step-text">
                Follow your contributions in real time on your dashboard.
                Earn impact badges, rank up on the leaderboard, and see real results.
              </p>
            </div>
          </div>

          <div className="help-how-cta">
            <button
              type="button"
              className="help-cta-btn"
              onClick={() => navigate("/marketplace")}
            >
              <span>Explore Marketplace</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            4. INTERACTIVE FAQ ACCORDION
           ───────────────────────────────────────────────────────────────── */}
        <section id="faqs-section" className="help-section">
          <div className="help-section-title-wrap">
            <span className="help-section-eyebrow">Quick Answers</span>
            <h2 className="help-section-heading">Frequently Asked Questions</h2>
            <p className="help-section-sub">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : "Answers to our most common shopper and organization inquiries."}
            </p>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="help-faq-accordion">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`help-faq-item ${isOpen ? "open" : ""}`}
                  >
                    <button
                      type="button"
                      className="help-faq-trigger"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="help-faq-q">{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`help-faq-icon ${isOpen ? "rotated" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="help-faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="help-faq-empty">
              <HelpCircle size={36} className="help-empty-icon" />
              <h3>No matching questions found</h3>
              <p>Try refining your search or reach out directly to our team.</p>
              <button
                type="button"
                className="help-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            5. SUPPORT ESCALATION CARD
           ───────────────────────────────────────────────────────────────── */}
        <section className="help-contact-banner">
          <div className="help-contact-inner">
            <div className="help-contact-text">
              <div className="help-status-pill">
                <span className="help-status-dot" />
                <span>Support Team Online</span>
              </div>
              <h3 className="help-contact-title">Still need assistance?</h3>
              <p className="help-contact-desc">
                Can't find what you're looking for? Our dedicated team in Sri Lanka
                is ready to help with orders, campaigns, and verification.
              </p>
            </div>

            <div className="help-contact-actions">
              <button
                type="button"
                className="help-btn-primary"
                onClick={() => navigate("/help/contact")}
              >
                <Mail size={16} />
                <span>Send a Message</span>
              </button>
              <button
                type="button"
                className="help-btn-secondary"
                onClick={() => navigate("/faq")}
              >
                <ExternalLink size={16} />
                <span>Full FAQ Page</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
