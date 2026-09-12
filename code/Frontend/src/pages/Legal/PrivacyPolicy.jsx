import React from "react";
import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

const LAST_UPDATED = "September 12, 2026";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "When you create an account on Merch4Change, we collect personal identity details including your name, username, email address, contact number, and account category (individual or organization). When you make purchases, contribute donations, or complete organization verification, we securely collect payment details, billing and shipping addresses, and legal identification or verification documentation.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We process your data to maintain account security, process orders and donations, verify non-profit and organization authenticity, personalize platform engagement, and communicate critical updates regarding platform activities. We explicitly enforce a strict policy against selling or renting your personal data to third parties.",
  },
  {
    title: "3. Information Sharing and Disclosure",
    body: "We share necessary data solely with essential service providers operating under strict confidentiality protocols. This includes integrated payment gateways to process transactions, courier and fulfillment services to deliver merchandise, and verified charities when you direct donations to them.",
  },
  {
    title: "4. User Privacy & Access Controls",
    body: "You maintain control over your account settings and visibility. Through Settings → Privacy and Settings → Notifications, you can manage public profile visibility, set account privacy levels, configure messaging permissions, and customize notification preferences.",
  },
  {
    title: "5. Data Security & Storage Practices",
    body: "We employ industry-standard technical measures, including TLS/SSL encryption for data in transit and secure hashing algorithms for credential storage. Additional security options like Multi-Factor Authentication (MFA) can be enabled via Settings → Account Security.",
  },
  {
    title: "6. Account Deletion & Data Retention",
    body: "You retain the right to permanently delete your account and associated personal data at any time via Settings → Help & Support. Upon request, data deletion is executed permanently, preserving only anonymized transactional records where legally mandated.",
  },
  {
    title: "7. Contact Us",
    body: "If you have questions regarding this Privacy Policy or wish to exercise data subject rights, please reach out directly through our Help & Support center or submit an inquiry to our privacy team.",
  },
];

function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="privacy-hero-container">
          <h1>Privacy Policy</h1>
          <p className="privacy-updated">Last updated: {LAST_UPDATED}</p>
          <p className="privacy-intro">
            This policy outlines how Merch4Change collects, processes, and protects your personal data, along with your rights and privacy controls.
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