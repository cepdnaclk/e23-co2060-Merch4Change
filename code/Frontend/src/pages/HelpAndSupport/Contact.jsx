import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  ShoppingBag,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  ChevronRight,
  ChevronDown,
  Headphones,
} from "lucide-react";
import { useAuth } from "../../context/Context";
import "./Contact.css";

const PRIMARY_EMAIL = "support.merch4change@gmail.com";

const TOPICS = [
  {
    id: "orders",
    label: "Orders, Shipping & Delivery",
    desc: "Tracking, order status, island-wide delivery timelines, returns",
    icon: ShoppingBag,
  },
  {
    id: "billing",
    label: "Payments & Inquiries",
    desc: "Card transactions, payment issues, donation receipts",
    icon: FileText,
  },
  {
    id: "impact",
    label: "Causes, NGOs & Impact Coins",
    desc: "Escrow funds release, coin balance, cause verification transparency",
    icon: Sparkles,
  },
  {
    id: "charity",
    label: "Charity Onboarding & Vetting",
    desc: "NGO Secretariat registration, Form 20, NGO profile assistance",
    icon: Building2,
  },
  {
    id: "csr",
    label: "Corporate CSR & Bulk Merch",
    desc: "Custom merchandise runs, corporate donation matching",
    icon: Headphones,
  },
  {
    id: "security",
    label: "Account, Security & 2FA",
    desc: "Password reset, OTP delivery issues, account roles",
    icon: ShieldCheck,
  },
  {
    id: "other",
    label: "General Inquiry / Feedback",
    desc: "Partnership inquiries, platform feedback, press",
    icon: MessageSquare,
  },
];

const PRE_CONTACT_FAQS = [
  {
    q: "How fast do support agents respond?",
    a: `Our team reviews tickets 24/7. Urgent order issues and payment inquiries typically receive a response within 2–4 hours. Non-urgent inquiries receive a reply within 24 hours via ${PRIMARY_EMAIL}.`,
  },
  {
    q: "Can I track my delivery without opening a ticket?",
    a: "Yes! Check our Orders & Shipping knowledge base guide or refer to the dispatch SMS sent to your mobile phone with your tracking number.",
  },
];

// Automatically calculate urgency level in background logic based on ticket topic and message context
const getComputedUrgency = (topicId, messageText = "", subjectText = "") => {
  const content = `${subjectText} ${messageText}`.toLowerCase();

  // High-severity keyword overrides
  if (
    content.includes("fraud") ||
    content.includes("double deduction") ||
    content.includes("unauthorized") ||
    content.includes("hacked") ||
    content.includes("emergency")
  ) {
    return "urgent";
  }

  // Topic-based intelligent routing
  switch (topicId) {
    case "billing": // Financial disputes, payment issues
    case "security": // Account takeover, 2FA lockout
      return "urgent";

    case "orders": // In-transit package delays or returns
    case "charity": // NGO compliance & legal review
      return "high";

    case "impact":
    case "csr":
    case "other":
    default:
      return "normal";
  }
};

function Contact() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("orders");
  const [subject, setSubject] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [ngoRegNo, setNgoRegNo] = useState("");
  const [message, setMessage] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);

  // UI state
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  // Pre-fill fields if user is authenticated
  useEffect(() => {
    if (user) {
      if (user.userName && !fullName) {
        setFullName(user.userName);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PRIMARY_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  // Handle file attachment simulation
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit. Please attach a smaller file.");
        return;
      }
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
  };

  // Submit Support Ticket
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate reliable network dispatch
    setTimeout(() => {
      const generatedId = `M4C-${Math.floor(100000 + Math.random() * 900000)}`;
      const selectedTopicObj = TOPICS.find((t) => t.id === topic);
      const computedUrgency = getComputedUrgency(topic, message, subject);

      setSubmittedTicket({
        ticketId: generatedId,
        fullName,
        email,
        topic: selectedTopicObj?.label || "General Inquiry",
        urgency: computedUrgency,
        subject: subject || `${selectedTopicObj?.label} Inquiry`,
        message,
        orderRef: topic === "orders" ? orderRef : null,
        ngoRegNo: topic === "charity" ? ngoRegNo : null,
        fileName: attachedFile?.name || null,
        submittedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      setIsSubmitting(false);
      window.scrollTo({ top: 260, behavior: "smooth" });
    }, 1200);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setSubject("");
    setMessage("");
    setOrderRef("");
    setNgoRegNo("");
    setAttachedFile(null);
  };

  return (
    <div className="contact-redesign-page">
      {/* ─────────────────────────────────────────────────────────────────
          1. HERO HEADER WITH BACK NAV & PRIMARY EMAIL QUICK ACTION
         ───────────────────────────────────────────────────────────────── */}
      <section className="contact-hero">
        <div className="contact-hero-ambient" />
        <div className="contact-hero-container">
          <div className="contact-back-nav">
            <Link to="/help" className="contact-back-link">
              <ArrowLeft size={16} />
              <span>Back to Help & Knowledge Base</span>
            </Link>
          </div>

          <h1 className="contact-hero-title">
            We're here to help you shop with <em>purpose</em>
          </h1>
          <p className="contact-hero-sub">
            Have a question regarding your order, charity verification, or impact
            donations? Reach out directly to our team. Average reply
            time is under 4 hours.
          </p>

          {/* Quick Email Highlight Pill */}
          <div className="contact-quick-email-pill">
            <div className="quick-email-left">
              <Mail size={18} className="quick-email-icon" />
              <span className="quick-email-label">Primary Support:</span>
              <a
                href={`mailto:${PRIMARY_EMAIL}?subject=Merch4Change Support Inquiry`}
                className="quick-email-address"
              >
                {PRIMARY_EMAIL}
              </a>
            </div>
            <div className="quick-email-actions">
              <button
                type="button"
                className="quick-email-btn"
                onClick={handleCopyEmail}
                title="Copy email address"
              >
                {copiedEmail ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <a
                href={`mailto:${PRIMARY_EMAIL}?subject=Merch4Change Support Inquiry`}
                className="quick-email-btn compose"
              >
                <ExternalLink size={14} />
                <span>Open Mail App</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="contact-main-container">
        {/* ─────────────────────────────────────────────────────────────────
            2. INTERACTIVE TICKET DESK & SIDEBAR
           ───────────────────────────────────────────────────────────────── */}
        <section className="contact-desk-section">
          <div className="contact-desk-grid">
            {/* Left Column: Form or Success Card */}
            <div className="contact-form-column">
              {submittedTicket ? (
                /* SUCCESS CONFIRMATION VIEW */
                <div className="ticket-success-card">
                  <div className="ticket-success-icon-wrap">
                    <CheckCircle2 size={42} className="ticket-success-check" />
                  </div>
                  <span className="ticket-badge">Ticket Created Successfully</span>
                  <h2 className="ticket-heading">
                    We've received your message!
                  </h2>
                  <p className="ticket-sub">
                    A confirmation has been dispatched to <strong>{submittedTicket.email}</strong> and routed directly to our inbox at <strong>{PRIMARY_EMAIL}</strong>.
                  </p>

                  <div className="ticket-meta-receipt">
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-label">Ticket Reference</span>
                      <span className="ticket-meta-id">{submittedTicket.ticketId}</span>
                    </div>
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-label">Topic</span>
                      <span className="ticket-meta-val">{submittedTicket.topic}</span>
                    </div>
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-label">Priority Level</span>
                      <span className={`ticket-urgency-pill ${submittedTicket.urgency}`}>
                        {submittedTicket.urgency.toUpperCase()}
                      </span>
                    </div>
                    {submittedTicket.orderRef && (
                      <div className="ticket-meta-row">
                        <span className="ticket-meta-label">Order Ref</span>
                        <span className="ticket-meta-val">{submittedTicket.orderRef}</span>
                      </div>
                    )}
                    {submittedTicket.ngoRegNo && (
                      <div className="ticket-meta-row">
                        <span className="ticket-meta-label">NGO Reg No</span>
                        <span className="ticket-meta-val">{submittedTicket.ngoRegNo}</span>
                      </div>
                    )}
                    {submittedTicket.fileName && (
                      <div className="ticket-meta-row">
                        <span className="ticket-meta-label">Attachment</span>
                        <span className="ticket-meta-val">{submittedTicket.fileName}</span>
                      </div>
                    )}
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-label">Expected Response</span>
                      <span className="ticket-meta-val highlight-time">
                        Within 2 to 4 hours
                      </span>
                    </div>
                  </div>

                  <div className="ticket-actions-group">
                    <button
                      type="button"
                      className="ticket-btn-primary"
                      onClick={handleResetForm}
                    >
                      <Send size={15} />
                      <span>Send Another Inquiry</span>
                    </button>
                    <Link to="/help" className="ticket-btn-secondary">
                      <HelpCircle size={15} />
                      <span>Browse Knowledge Base</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* MAIN INTERACTIVE FORM */
                <div className="contact-form-card">
                  <div className="form-card-header">
                    <h2 className="form-title">Send us a message</h2>
                    <p className="form-subtitle">
                      Have a question or need a hand with an order or cause? Leave a message and our team will reply to your email directly.
                    </p>

                    {/* User Session Status */}
                    {user ? (
                      <div className="form-user-status">
                        <span className="user-status-dot" />
                        <span>
                          Signed in as <strong>{user.userName || user.email}</strong> ({user.email})
                        </span>
                      </div>
                    ) : (
                      <div className="form-guest-status">
                        <span>
                          Submitting as guest.{" "}
                          <Link to="/login" className="guest-login-link">
                            Sign in
                          </Link>{" "}
                          to track inquiries under your account.
                        </span>
                      </div>
                    )}
                  </div>

                  <form className="contact-form-body" onSubmit={handleSubmit}>
                    {/* Row 1: Name and Email */}
                    <div className="form-grid-2">
                      <div className="form-field-wrap">
                        <label className="field-label" htmlFor="fullName">
                          Your Name <span className="field-req">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          className="field-input"
                          placeholder="e.g. Kasun Perera"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-field-wrap">
                        <label className="field-label" htmlFor="emailAddress">
                          Email Address <span className="field-req">*</span>
                        </label>
                        <input
                          id="emailAddress"
                          type="email"
                          className="field-input"
                          placeholder="kasun@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Row 2: Topic Dropdown */}
                    <div className="form-field-wrap">
                      <label className="field-label" htmlFor="topicSelect">
                        What can we help you with? <span className="field-req">*</span>
                      </label>
                      <div className="field-select-wrapper">
                        <select
                          id="topicSelect"
                          className="field-select"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          required
                        >
                          {TOPICS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <span className="field-select-chevron" aria-hidden="true">
                          <ChevronDown size={18} />
                        </span>
                      </div>
                      {(() => {
                        const currentTopic = TOPICS.find((t) => t.id === topic);
                        return currentTopic?.desc ? (
                          <p className="field-topic-hint">
                            {currentTopic.desc}
                          </p>
                        ) : null;
                      })()}
                    </div>

                    {/* Conditional: Order Reference */}
                    {topic === "orders" && (
                      <div className="form-field-wrap form-field-fade">
                        <label className="field-label" htmlFor="orderRef">
                          Order Number <span className="field-hint">(Optional)</span>
                        </label>
                        <input
                          id="orderRef"
                          type="text"
                          className="field-input"
                          placeholder="e.g. #M4C-8912 (from your confirmation SMS or email)"
                          value={orderRef}
                          onChange={(e) => setOrderRef(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Conditional: Charity Reg Number */}
                    {topic === "charity" && (
                      <div className="form-field-wrap form-field-fade">
                        <label className="field-label" htmlFor="ngoReg">
                          NGO / Trust Registration Number{" "}
                          <span className="field-hint">(Optional)</span>
                        </label>
                        <input
                          id="ngoReg"
                          type="text"
                          className="field-input"
                          placeholder="e.g. GA-2041 or Secretariat Reg ID"
                          value={ngoRegNo}
                          onChange={(e) => setNgoRegNo(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Row 3: Subject */}
                    <div className="form-field-wrap">
                      <label className="field-label" htmlFor="subject">
                        Subject <span className="field-req">*</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        className="field-input"
                        placeholder="What is your message about?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    {/* Row 4: Message textarea */}
                    <div className="form-field-wrap">
                      <label className="field-label" htmlFor="messageContent">
                        Message <span className="field-req">*</span>
                      </label>
                      <textarea
                        id="messageContent"
                        rows="5"
                        className="field-textarea"
                        placeholder="Describe what you need help with. The more detail you provide, the quicker we can assist..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    {/* Row 5: File Attachment */}
                    <div className="form-field-wrap">
                      <label className="field-label">
                        Attachment <span className="field-hint">(Optional)</span>
                      </label>
                      {attachedFile ? (
                        <div className="file-attached-pill">
                          <div className="file-attached-info">
                            <Paperclip size={14} className="file-attached-icon" />
                            <span className="file-attached-name">{attachedFile.name}</span>
                            <span className="file-attached-size">
                              ({(attachedFile.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="file-remove-btn"
                            onClick={handleRemoveFile}
                            title="Remove attachment"
                            aria-label="Remove attachment"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="file-upload-row">
                          <label className="file-upload-btn" htmlFor="fileUploadInput">
                            <Paperclip size={15} />
                            <span>Attach file</span>
                          </label>
                          <span className="file-upload-hint">
                            Screenshots or docs (PNG, JPG, PDF up to 10MB)
                          </span>
                          <input
                            id="fileUploadInput"
                            type="file"
                            className="hidden-file-input"
                            onChange={handleFileChange}
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </div>
                      )}
                    </div>

                    {/* Submit Bar */}
                    <div className="form-submit-row">
                      <p className="form-disclaimer">
                        We will email a confirmation copy to{" "}
                        <strong>{email || "your address"}</strong> and reply directly from {PRIMARY_EMAIL}.
                      </p>
                      <button
                        type="submit"
                        className="form-submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="btn-spinner" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Send message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Support Context & Office Details */}
            <aside className="contact-sidebar-column">
              {/* Box 1: Support Promises */}
              <div className="sidebar-info-card">
                <h3 className="sidebar-card-title">Our Support Commitment</h3>
                <ul className="commitments-list">
                  <li>
                    <CheckCircle2 size={16} className="commit-check" />
                    <div>
                      <strong>Average Response &lt; 4 Hours</strong>
                      <p>24/7 dedicated support staff across Sri Lanka.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="commit-check" />
                    <div>
                      <strong>100% Impact Transparency</strong>
                      <p>Every rupee donated or earned through merch is traceable.</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="commit-check" />
                    <div>
                      <strong>Delivery Dispute Escalation</strong>
                      <p>Direct priority resolution for transit delays or damaged items.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Box 2: Working Hours */}
              <div className="sidebar-info-card">
                <h3 className="sidebar-card-title">Support Hours (IST)</h3>
                <div className="hours-grid">
                  <div className="hours-row">
                    <span className="hours-day">Urgent Orders & Delivery</span>
                    <span className="hours-val status-badge open">24/7 Live</span>
                  </div>
                  <div className="hours-row">
                    <span className="hours-day">Charity Verification & CSR</span>
                    <span className="hours-val">Mon – Fri: 9:00 AM – 5:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Self-Service Knowledge Base */}
              <div className="sidebar-info-card kb-sidebar-card">
                <div className="sidebar-kb-top">
                  <div className="channel-icon-wrap help">
                    <HelpCircle size={20} />
                  </div>
                  <span className="channel-tag">32 Guides</span>
                </div>
                <h4 className="sidebar-card-title">Knowledge Base</h4>
                <p className="sidebar-kb-desc">
                  Find instant step-by-step answers on shipping, payments, return policies, and causes without waiting.
                </p>
                <Link to="/help" className="channel-kb-btn">
                  <span>Browse 32 Guides</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            4. COMMON PRE-CONTACT FAQS ACCORDION
           ───────────────────────────────────────────────────────────────── */}
        <section className="contact-faqs-section">
          <div className="contact-faq-header">
            <span className="contact-faq-eyebrow">Quick Answers</span>
            <h2 className="contact-faq-heading">Frequently asked before contacting</h2>
            <p className="contact-faq-sub">
              Check if your question is answered below or explore our 32-article directory.
            </p>
          </div>

          <div className="contact-faq-accordion">
            {PRE_CONTACT_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`contact-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="contact-faq-trigger"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                  >
                    <span className="contact-faq-q">{faq.q}</span>
                    <span className={`contact-faq-arrow ${isOpen ? "open" : ""}`}>
                      ▾
                    </span>
                  </button>
                  {isOpen && (
                    <div className="contact-faq-ans">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="contact-faq-footer">
            <span>Looking for more detailed guides?</span>
            <Link to="/help" className="contact-more-guides-link">
              <span>View all 32 knowledge base articles</span>
              <ChevronRight size={15} />
            </Link>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            5. PAGE UPDATE FOOTER INDICATOR
           ───────────────────────────────────────────────────────────────── */}
        <footer className="contact-page-footer">
          <div className="contact-footer-content">
            <span className="contact-footer-badge">
              <span className="contact-footer-dot" />
              <span>Last updated: 2026</span>
            </span>
            <p className="contact-footer-note">
              Merch4Change Support Desk • All inquiries are routed directly to{" "}
              <strong>{PRIMARY_EMAIL}</strong>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Contact;

