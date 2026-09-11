import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Users,
  Sparkles,
  LockKeyhole,
} from "lucide-react";
import BrandLogo from "../../BrandLogo/BrandLogo";
import "./GuestBlock.css";

export default function GuestBlock() {
  return (
    <div className="marketplace-welcome">
      <header className="mw-header mw-wrap">
        <Link className="mw-brand" to="/" aria-label="Merch4Change home">
          <BrandLogo size={32} />
          <span>Merch4Change</span>
        </Link>
        <Link className="mw-back" to="/">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to home
        </Link>
      </header>
      <main
        className="mw-main mw-wrap"
        aria-labelledby="marketplace-welcome-title"
      >
        <div className="mw-intro">
          <span className="mw-eyebrow">
            <span aria-hidden="true" /> THE MERCH4CHANGE MARKETPLACE
          </span>
          <h1 id="marketplace-welcome-title">
            Good finds.
            <br />
            <em>One sign-in away.</em>
          </h1>
          <p className="mw-description">
            Sign in to explore the marketplace, discover meaningful merchandise,
            and support the causes you care about.
          </p>
          <div className="mw-actions">
            <Link className="mw-signin" to="/login">
              Sign in <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <Link className="mw-signup" to="/signup">
              Create an account
            </Link>
          </div>
          <p className="mw-access-note">
            <LockKeyhole size={13} aria-hidden="true" /> A member account is
            required to browse the marketplace.
          </p>
        </div>
        <section className="mw-benefits" aria-labelledby="mw-benefits-title">
          <div className="mw-benefits-heading">
            <span />
            <h2 id="mw-benefits-title">A LITTLE MORE PURPOSE IN EVERY VISIT</h2>
            <span />
          </div>
          <div className="mw-benefit-grid">
            <article>
              <span className="mw-benefit-icon">
                <Sparkles size={21} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Find something meaningful.</h3>
              <p>Discover merchandise from brands with a story to share.</p>
            </article>
            <article>
              <span className="mw-benefit-icon">
                <Heart size={21} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Get behind a cause.</h3>
              <p>Connect your everyday choices to the things you care about.</p>
            </article>
            <article>
              <span className="mw-benefit-icon">
                <Users size={21} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3>Find your community.</h3>
              <p>Follow the people and organisations making a difference.</p>
            </article>
          </div>
        </section>
      </main>
      <footer className="mw-footer mw-wrap">
        <span>© {new Date().getFullYear()} Merch4Change</span>
        <Link to="/help">
          Help &amp; Support <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </footer>
    </div>
  );
}
