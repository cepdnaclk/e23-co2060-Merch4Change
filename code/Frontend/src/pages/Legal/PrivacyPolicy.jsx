import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./PrivacyPolicy.css";

const LAST_UPDATED = "September 2026";

const SECTIONS = [
  {
    title: "1. Information we collect",
    body:
      "When you create an account on Merch4Change, we collect information such as your name, username, email address, and account type (individual or organization). When you place an order, make a donation, or verify a charity, we may also collect payment details, delivery addresses, and verification documents.",
  },
  {
    title: "2. How we use your information",
    body:
      "We use your information to operate your account, process orders and donations, verify organizations, personalize your experience, and communicate with you about activity on the platform. We do not sell your personal information to third parties.",
  },
  {
    title: "3. Sharing your information",
    body:
      "We share information only where necessary to run the platform — for example, with payment processors to complete transactions, with courier partners to fulfil deliveries, and with verified charities when you choose to donate to them. Service providers are only given the data they need to perform their function.",
  },
  {
    title: "4. Your privacy controls",
    body:
      "You can control who sees your activity, whether your account is private, who can message or comment on your posts, and what notifications you receive, all from Settings → Privacy and Settings → Notifications.",
  },
  {
    title: "5. Data security",
    body:
      "We use industry-standard practices such as encrypted connections and hashed passwords to protect your account. You can add an extra layer of protection at any time from Settings → Account security.",
  },
  {
    title: "6. Account deletion",
    body:
      "You may permanently delete your account and associated personal data at any time from Settings → Help & support. This action is irreversible.",
  },
  {
    title: "7. Contact us",
    body:
      "If you have questions about this policy or how your data is handled, reach out through our Help & Support center and we'll get back to you.",
  },
];

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/settings");
    }
  };

  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="privacy-hero-container">
          <button type="button" className="privacy-back-link" onClick={handleBack}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <h1>Privacy Policy</h1>
          <p className="privacy-updated">Last updated: {LAST_UPDATED}</p>
          <p className="privacy-intro">
            This policy explains what information Merch4Change collects, how
            it's used, and the choices you have about your data.
          </p>
        </div>
      </div>

      <div className="privacy-content">
        {SECTIONS.map((section) => (
          <section key={section.title} className="privacy-section">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}

        <div className="privacy-footer-links">
          <Link to="/help">Help center</Link>
          <span aria-hidden="true">·</span>
          <Link to="/help/contact">Contact support</Link>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;