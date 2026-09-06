import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, TrendingUp } from "lucide-react";
import "./HelpAndSupport.css";

function HelpAndSupport() {
  const navigate = useNavigate();

  return (
    <div className="help-page">
      <div className="help-hero">
        <h1>How can we help you today?</h1>
        <div className="help-search-bar">
          <input
            type="text"
            placeholder="Search for articles, guides or FAQs..."
          />
          <button className="search-btn">Search</button>
        </div>
      </div>

      <div className="help-categories">
        <div className="help-card" onClick={() => navigate("/faq")}>
          <div className="card-icon">📚</div>
          <h3>Getting Started</h3>
          <p>
            Learn the basics of using Merch4Change and creating your account.
          </p>
        </div>

        <div className="help-card" onClick={() => navigate("/faq")}>
          <div className="card-icon">❓</div>
          <h3>FAQs</h3>
          <p>Find answers to the most frequently asked questions.</p>
        </div>

        <div className="help-card" onClick={() => navigate("/help/contact")}>
          <div className="card-icon">✉️</div>
          <h3>Contact Support</h3>
          <p>
            Can't find what you need? Reach out to our dedicated support team.
          </p>
        </div>
      </div>

      {/* SECTION — HOW IT WORKS */}
      <section id="how-it-works" className="help-how-it-works">
        <div className="help-section-header">
          <p className="help-eyebrow">How It Works</p>
          <h2 className="help-section-title">
            Three steps to shop with <em>purpose</em>
          </h2>
          <p className="help-section-desc">
            It's simple, transparent, and impactful.
          </p>
        </div>

        <div className="help-steps">
          <div className="help-step">
            <div className="help-step-number">01</div>
            <div className="help-step-icon-wrap">
              <ShoppingBag size={26} className="help-step-icon" />
            </div>
            <h3 className="help-step-title">Browse the marketplace</h3>
            <p className="help-step-desc">
              Discover thousands of impact products from verified
              organisations and creators across Sri Lanka.
            </p>
          </div>

          <div className="help-step-connector"></div>

          <div className="help-step">
            <div className="help-step-number">02</div>
            <div className="help-step-icon-wrap">
              <Heart size={26} className="help-step-icon" />
            </div>
            <h3 className="help-step-title">Support a cause</h3>
            <p className="help-step-desc">
              Every purchase directly funds a campaign or NGO of your choice.
              You decide where the impact goes.
            </p>
          </div>

          <div className="help-step-connector"></div>

          <div className="help-step">
            <div className="help-step-number">03</div>
            <div className="help-step-icon-wrap">
              <TrendingUp size={26} className="help-step-icon" />
            </div>
            <h3 className="help-step-title">Track your impact</h3>
            <p className="help-step-desc">
              Watch your contributions grow in real time. Earn ranks, badges,
              and rewards as you make a difference.
            </p>
          </div>
        </div>
      </section>

      <div className="help-guides">
        <h2>Popular Guides</h2>
        <ul className="guide-list">
          <li>How to setup your organization profile</li>
          <li>Connecting with partner brands</li>
          <li>Managing your charity campaigns</li>
          <li>Understanding shipping and delivery</li>
        </ul>
      </div>
    </div>
  );
}

export default HelpAndSupport;
