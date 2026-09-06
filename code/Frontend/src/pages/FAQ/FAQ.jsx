import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ArrowLeft,
  Mail,
  HelpCircle,
  Sparkles,
  ShoppingBag,
  Heart,
  ShieldCheck,
  FileText,
  Lock,
  X,
  Send,
} from "lucide-react";
import "./FAQ.css";

const PRIMARY_EMAIL = "support.merch4change@gmail.com";

const CATEGORIES = [
  { id: "all", label: "All Questions", icon: Sparkles },
  { id: "orders", label: "Orders & Shipping", icon: ShoppingBag },
  { id: "causes", label: "Causes & Impact", icon: Heart },
  { id: "charity", label: "Charity Verification", icon: ShieldCheck },
  { id: "payments", label: "Payments & Billing", icon: FileText },
  { id: "account", label: "Account & Security", icon: Lock },
];

const FAQS = [
  // Orders & Shipping
  {
    id: "orders-1",
    category: "orders",
    categoryLabel: "Orders & Shipping",
    q: "How long does delivery take across Sri Lanka?",
    a: "Deliveries within the Western Province (Colombo, Gampaha, Kalutara) typically arrive in 1 to 2 business days. Deliveries to Central, Southern, Northern, Eastern, and other outstation districts arrive in 3 to 5 business days via trusted island-wide courier services.",
  },
  {
    id: "orders-2",
    category: "orders",
    categoryLabel: "Orders & Shipping",
    q: "How can I track my delivery status?",
    a: "Once your merchandise is packed and handed over to our courier partner, you will receive an SMS and email notification containing your unique tracking reference number. You can also view live order milestones directly from your account order history.",
  },
  {
    id: "orders-3",
    category: "orders",
    categoryLabel: "Orders & Shipping",
    q: "What is your return and exchange policy?",
    a: "We offer a 7-day exchange window for apparel sizing issues or manufacturing defects. Items must be unwashed, unworn, and have original tags intact. Contact our support team with your order reference to initiate an exchange.",
  },
  {
    id: "orders-4",
    category: "orders",
    categoryLabel: "Orders & Shipping",
    q: "How are delivery charges calculated?",
    a: "Delivery charges are computed based on parcel weight and destination district. Standard rates start from Rs. 350 within Colombo and Rs. 450 for outstation districts. Free delivery promotions apply periodically for qualifying orders.",
  },

  // Causes & Impact
  {
    id: "causes-1",
    category: "causes",
    categoryLabel: "Causes & Impact",
    q: "How do merchandise purchases fund charities?",
    a: "Every product in our marketplace is directly linked to a vetted charity campaign. Proceeds (from a pre-set percentage up to 100% of campaign profits) are held in transparent escrow and disbursed directly to the verified non-profit to fund their designated project milestones.",
  },
  {
    id: "causes-2",
    category: "causes",
    categoryLabel: "Causes & Impact",
    q: "What are Impact Coins and how do I earn them?",
    a: "Impact Coins are platform rewards earned on every purchase (1 Impact Coin for every Rs. 100 spent). You can use your Impact Coins to unlock exclusive discounts on future merchandise drops, access limited-edition charity collections, or boost campaign visibility on the community leaderboard.",
  },
  {
    id: "causes-3",
    category: "causes",
    categoryLabel: "Causes & Impact",
    q: "How can I verify that funds reached the cause?",
    a: "Transparency is our foundational principle. Partner charities are required to submit milestone reports, photographic proof, and project financial updates. All updates are published directly on the campaign page and logged in your personal donation dashboard.",
  },
  {
    id: "causes-4",
    category: "causes",
    categoryLabel: "Causes & Impact",
    q: "Can I make a direct donation without buying merchandise?",
    a: "Yes! You can donate directly to any verified charity campaign via our 'Donate' portal using card payments or LankaQR, with 100% of your voluntary contribution transferring directly to the designated cause.",
  },

  // Charity Verification
  {
    id: "charity-1",
    category: "charity",
    categoryLabel: "Charity Verification",
    q: "What legal documents are required for an NGO to get verified?",
    a: "To ensure complete legitimacy, organizations must provide proof of legal registration under the National Secretariat for Non-Governmental Organizations (Sri Lanka) or Trust Ordinance, Form 20 (Directors/Trustees listing), a registered non-profit bank account, and their most recent audited financial statements.",
  },
  {
    id: "charity-2",
    category: "charity",
    categoryLabel: "Charity Verification",
    q: "How long does NGO vetting take?",
    a: "Our verification and compliance team thoroughly inspects submitted legal documents and conducts background diligence within 3 to 5 business days. Once approved, the organization receives a 'Verified NGO' badge and can launch campaigns.",
  },
  {
    id: "charity-3",
    category: "charity",
    categoryLabel: "Charity Verification",
    q: "How do charities receive their donation payouts?",
    a: "Escrow funds are disbursed via direct Sri Lankan bank transfer (CEFT / SLIPS) to the organization's official registered bank account upon reaching specified campaign milestones or during month-end payout cycles.",
  },

  // Payments & Billing
  {
    id: "payments-1",
    category: "payments",
    categoryLabel: "Payments & Billing",
    q: "What payment options are supported at checkout?",
    a: "We accept Visa, Mastercard, Debit and Credit cards, LankaQR mobile payments, and direct bank transfers. All digital transactions are processed through secure, bank-grade payment gateways.",
  },
  {
    id: "payments-2",
    category: "payments",
    categoryLabel: "Payments & Billing",
    q: "Is my payment information secure?",
    a: "Yes. All transaction communications are encrypted using 256-bit SSL encryption. We never store credit or debit card numbers on our servers—payments are processed directly through certified financial gateways.",
  },
  {
    id: "payments-3",
    category: "payments",
    categoryLabel: "Payments & Billing",
    q: "Will I receive an official receipt for my order and donation?",
    a: "Yes. Immediately upon successful checkout, an official digital invoice and donation receipt is dispatched to your email address, including charity registration details and the exact donation split for your records.",
  },

  // Account & Security
  {
    id: "account-1",
    category: "account",
    categoryLabel: "Account & Security",
    q: "How does Two-Step OTP verification work?",
    a: "To protect your account and donations, sensitive actions (such as signing in from a new browser or updating profile information) trigger a secure 6-digit One-Time Password (OTP) sent to your registered mobile phone.",
  },
  {
    id: "account-2",
    category: "account",
    categoryLabel: "Account & Security",
    q: "How can I reset my password if I forget it?",
    a: "Click the 'Forgot Password' link on the login page, enter your registered email address, and you will receive a secure password reset link valid for 15 minutes.",
  },
  {
    id: "account-3",
    category: "account",
    categoryLabel: "Account & Security",
    q: "Can I switch between a Supporter and Charity account?",
    a: "Supporter profiles and Charity profiles have different legal permissions. If you are an individual wanting to register your NGO or charity foundation, you can apply for non-profit onboarding from your account settings.",
  },
  {
    id: "account-4",
    category: "account",
    categoryLabel: "Account & Security",
    q: "How can I update my communication preferences?",
    a: "You can manage notification settings, email preferences, and order alerts anytime from your Account Settings under the 'Notifications' tab.",
  },
];

function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);

  // Always scroll to the top of the page on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Toggle single accordion
  const handleToggle = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  // Filter FAQs based on active category and search term
  const filteredFaqs = useMemo(() => {
    return FAQS.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: FAQS.length };
    FAQS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="faq-redesign-page">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO HEADER WITH LIVE SEARCH
         ───────────────────────────────────────────────────────────────── */}
      <section className="faq-hero">
        <div className="faq-hero-container">
          <div className="faq-back-nav">
            <Link to="/help" className="faq-back-link">
              <ArrowLeft size={16} />
              <span>Back to Help & Knowledge Base</span>
            </Link>
          </div>

          <h1 className="faq-hero-title">Frequently Asked Questions</h1>
          <p className="faq-hero-subtitle">
            Find clear, instant answers about island-wide delivery, verified charity campaigns, Impact Coins, and payments.
          </p>

          {/* Live Search Input */}
          <div className="faq-search-box">
            <Search size={18} className="faq-search-icon" />
            <input
              type="text"
              className="faq-search-input"
              placeholder="Search by keyword (e.g. delivery, tracking, coins, verification)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA: CATEGORY PILLS & ACCORDION
         ───────────────────────────────────────────────────────────────── */}
      <div className="faq-main-container">
        {/* Category Pills Navigation */}
        <div className="faq-categories-bar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                className={`faq-cat-pill ${isSelected ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setOpenFaqId(null);
                }}
              >
                <Icon size={15} />
                <span>{cat.label}</span>
                <span className="faq-cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter / Status */}
        <div className="faq-status-row">
          <span className="faq-status-text">
            {searchQuery ? (
              <>
                Found <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? "question" : "questions"} matching &ldquo;{searchQuery}&rdquo;
              </>
            ) : (
              <>
                Showing <strong>{filteredFaqs.length}</strong> {filteredFaqs.length === 1 ? "question" : "questions"}
              </>
            )}
          </span>
          {searchQuery && (
            <button
              type="button"
              className="faq-reset-filter-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="faq-accordion-list">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`faq-card-item ${isOpen ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => handleToggle(faq.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="faq-question-left">
                      <span className="faq-badge-tag">{faq.categoryLabel}</span>
                      <h3 className="faq-question-text">{faq.q}</h3>
                    </div>
                    <span className={`faq-chevron ${isOpen ? "rotate" : ""}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p className="faq-answer-text">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="faq-empty-card">
            <HelpCircle size={40} className="faq-empty-icon" />
            <h3 className="faq-empty-title">No matching questions found</h3>
            <p className="faq-empty-desc">
              We couldn&apos;t find any FAQs matching &ldquo;{searchQuery}&rdquo;. Try using different keywords or explore our direct support channels.
            </p>
            <button
              type="button"
              className="faq-empty-reset-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            3. "STILL HAVE QUESTIONS?" SUPPORT DESK BRIDGE
           ───────────────────────────────────────────────────────────────── */}
        <section className="faq-support-bridge">
          <div className="faq-bridge-content">
            <div className="faq-bridge-text">
              <span className="faq-bridge-eyebrow">Still have questions?</span>
              <h2 className="faq-bridge-title">Our support team is here to help</h2>
              <p className="faq-bridge-desc">
                Can&apos;t find the answer you&apos;re looking for? Reach out to our dedicated support desk directly via email or submit a support ticket.
              </p>
            </div>

            <div className="faq-bridge-actions">
              <Link to="/help/contact" className="faq-bridge-btn-primary">
                <Send size={15} />
                <span>Contact Support</span>
              </Link>
              <Link to="/help" className="faq-bridge-btn-secondary">
                <HelpCircle size={15} />
                <span>Browse 32 Guides</span>
              </Link>
            </div>
          </div>

          <div className="faq-bridge-footer">
            <Mail size={15} className="faq-bridge-mail-icon" />
            <span>
              Primary Support:{" "}
              <a
                href={`mailto:${PRIMARY_EMAIL}?subject=FAQ Inquiry`}
                className="faq-bridge-email-link"
              >
                {PRIMARY_EMAIL}
              </a>{" "}
              • Average reply time under 4 hours
            </span>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            4. PAGE UPDATE FOOTER INDICATOR
           ───────────────────────────────────────────────────────────────── */}
        <footer className="faq-page-footer">
          <div className="faq-footer-content">
            <span className="faq-footer-badge">
              <span className="faq-footer-dot" />
              <span>Last updated: 2026</span>
            </span>
            <p className="faq-footer-note">
              Merch4Change Support Desk • FAQs maintained for transparency and public impact verification
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default FAQ;
