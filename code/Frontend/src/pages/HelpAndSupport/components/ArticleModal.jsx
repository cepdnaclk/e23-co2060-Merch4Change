import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ShieldCheck, Hammer, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../context/Context";
import "./ArticleModal.css";

export default function ArticleModal({ article, onClose }) {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  return (
    <div className="m4c-article-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="m4c-article-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="m4c-article-header">
          <div className="m4c-article-meta-row">
            <span className="m4c-article-category-badge">{article.categoryTitle}</span>
            <span className="m4c-article-read-time">
              <Clock size={13} />
              <span>{article.readTime}</span>
            </span>
          </div>

          <button
            type="button"
            className="m4c-article-close-btn"
            onClick={onClose}
            aria-label="Close article"
          >
            <X size={20} />
          </button>
        </div>

        {/* Article Body Container */}
        <div className="m4c-article-content">
          <h1 className="m4c-article-title">{article.title}</h1>
          <p className="m4c-article-summary">{article.summary}</p>

          {/* Authenticated Context Block */}
          {accessToken && user ? (
            <div className="m4c-article-auth-box authenticated">
              <div className="auth-box-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="auth-box-text">
                <strong>Active Session</strong>
                <span>
                  Logged in as <em>{user.userName || user.email}</em> ({user.accountType || "Supporter"})
                </span>
              </div>
            </div>
          ) : (
            <div className="m4c-article-auth-box guest">
              <div className="auth-box-icon">
                <ShieldCheck size={18} />
              </div>
              <div className="auth-box-text">
                <strong>Guest Mode</strong>
                <span>Sign in to view your live orders and authenticated impact statistics.</span>
              </div>
              <button
                type="button"
                className="auth-box-login-btn"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          )}

          {/* Under Construction Notice if Applicable */}
          {article.isUnderConstruction && (
            <div className="m4c-article-construction-alert">
              <div className="construction-alert-icon">
                <Hammer size={20} />
              </div>
              <div className="construction-alert-body">
                <h4>Feature in Active Development</h4>
                <p>
                  {article.constructionDetails ||
                    "This functionality is currently under construction for our upcoming sprint. Manual support is available in the interim."}
                </p>
              </div>
            </div>
          )}

          {/* Article Sections */}
          <div className="m4c-article-sections">
            {article.sections.map((sec, idx) => (
              <section key={idx} className="m4c-article-sec">
                <h3 className="m4c-article-sec-heading">{sec.heading}</h3>
                <div className="m4c-article-sec-text">
                  {sec.content.split("\n").map((line, pIdx) => (
                    <p key={pIdx}>{line}</p>
                  ))}
                </div>

                {sec.steps && sec.steps.length > 0 && (
                  <ol className="m4c-article-steps-list">
                    {sec.steps.map((step, sIdx) => (
                      <li key={sIdx}>
                        <span className="step-num-pill">{sIdx + 1}</span>
                        <span className="step-text">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            ))}
          </div>

          {/* Feedback & Escalation Box */}
          <div className="m4c-article-footer-box">
            <div className="feedback-section">
              <span>Was this article helpful?</span>
              <div className="feedback-buttons">
                <button type="button" className="feedback-btn" aria-label="Yes">
                  <ThumbsUp size={14} />
                  <span>Yes</span>
                </button>
                <button type="button" className="feedback-btn" aria-label="No">
                  <ThumbsDown size={14} />
                  <span>No</span>
                </button>
              </div>
            </div>

            <div className="escalation-prompt">
              <span>Still have questions?</span>
              <button
                type="button"
                className="escalation-contact-btn"
                onClick={() => navigate("/help/contact")}
              >
                <MessageSquare size={14} />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
