import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  ShoppingBag,
  Sprout,
  Globe2,
  HandHeart,
  ShieldCheck,
  Users,
} from "lucide-react";
import "./LandingPage.css";

const steps = [
  {
    icon: ShoppingBag,
    title: "Find your kind of good.",
    text: "Discover merchandise from organisations and creators with a cause worth getting behind.",
  },
  {
    icon: Heart,
    title: "Make it mean more.",
    text: "Choose something you love and help support the work that matters to you.",
  },
  {
    icon: Sprout,
    title: "Be part of the change.",
    text: "Follow the organisations you support, connect with your community, and see their stories unfold.",
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <main id="main-content">
        <section
          className="landing-hero landing-wrap"
          aria-labelledby="landing-title"
        >
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              <span className="landing-status" /> LITTLE CHOICES. LASTING
              CHANGE.
            </span>
            <h1 id="landing-title">
              Good things.
              <br />
              Greater{" "}
              <span className="landing-impact-word">
                impact<span className="landing-impact-dot">.</span>
                <svg viewBox="0 0 330 18" aria-hidden="true">
                  <path d="M4 13Q155-6 325 9" />
                </svg>
              </span>
              <span className="landing-heading-shine" aria-hidden="true">
                Good things.
                <br />
                Greater <span className="landing-impact-word">impact.</span>
              </span>
            </h1>
            <p>
              Wear what you believe in. Shop meaningful merch, support causes
              you love, and turn everyday choices into something bigger.
            </p>
            <div className="landing-actions">
              <Link className="landing-button" to="/marketplace">
                Explore the marketplace <ArrowUpRight size={19} />
              </Link>
              <a className="landing-text-link" href="#how-it-works">
                How it works <ArrowRight size={17} />
              </a>
            </div>
            <div className="landing-community">
              <span className="landing-community-icons">
                <Heart size={16} />
                <Sprout size={16} />
                <Users size={16} />
              </span>
              <span>
                For people who care.
                <br />
                <strong>And want to do a little more.</strong>
              </span>
            </div>
          </div>
        </section>

        <div className="landing-values">
          <div className="landing-wrap">
            <span>
              <ShoppingBag /> Shop with purpose
            </span>
            <span className="landing-value-star" aria-hidden="true">
              ✳
            </span>
            <span>
              <HandHeart /> Support meaningful causes
            </span>
            <span className="landing-value-star" aria-hidden="true">
              ✳
            </span>
            <span>
              <Globe2 /> Change starts with us
            </span>
          </div>
        </div>

        <section className="landing-how landing-wrap" id="how-it-works">
          <div className="landing-section-heading">
            <div>
              <span className="landing-eyebrow">
                A SMALL START. A BIG DIFFERENCE.
              </span>
              <h2>
                Your everyday.
                <br />A little more meaningful.
              </h2>
            </div>
            <p>
              You don’t have to change everything to change something. Here’s
              where it starts.
            </p>
          </div>
          <div className="landing-steps">
            {steps.map((step, index) => (
              <article className="landing-step" key={step.title}>
                <div className="landing-step-top">
                  <step.icon size={27} strokeWidth={1.5} />
                  <span>0{index + 1}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-impact landing-wrap" id="impact-stats">
          <div className="landing-impact-art">
            <Globe2 strokeWidth={0.65} aria-hidden="true" />
            <span>
              Good grows
              <br />
              <em>together.</em>
            </span>
            <div className="landing-impact-label">
              <Sprout size={17} /> ROOTED IN COMMUNITY
            </div>
          </div>
          <div className="landing-impact-copy">
            <span className="landing-eyebrow">MORE THAN A MARKETPLACE</span>
            <h2>
              Behind every cause,
              <br />
              there’s a community.
            </h2>
            <p>
              Meet the people making a difference. Merch4Change brings shoppers,
              donors, and organisations together around the things they care
              about.
            </p>
            <div className="landing-feature">
              <ShieldCheck />
              <div>
                <h3>Discover the people behind the purpose</h3>
                <p>Explore organisation profiles and learn about their work.</p>
              </div>
            </div>
            <div className="landing-feature">
              <Users />
              <div>
                <h3>Stay connected to your causes</h3>
                <p>Follow updates, share stories, and find your people.</p>
              </div>
            </div>
            <Link className="landing-text-link" to="/about/story">
              Get to know Merch4Change <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>

        <section className="landing-org landing-wrap" id="for-organisations">
          <div>
            <span className="landing-eyebrow">FOR THE CHANGEMAKERS</span>
            <h2>
              You bring the cause.
              <br />
              Let’s grow the community.
            </h2>
            <p>
              Give your mission a home. Share your story, connect with
              supporters, and turn merchandise into meaningful support.
            </p>
            <Link
              className="landing-button landing-button-dark"
              to="/signup/orgsignup"
            >
              Get your organisation started <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className="landing-org-flower" aria-hidden="true">
            ✳
          </div>
          <span className="landing-org-footnote">
            BIG HEARTS. SHARED PURPOSE.
          </span>
        </section>
        <section className="landing-final landing-wrap">
          <span className="landing-eyebrow">
            YOUR NEXT SMALL ACT STARTS HERE
          </span>
          <h2>
            Find something you love.
            <br />
            <em>Do something that matters.</em>
          </h2>
          <Link className="landing-button" to="/marketplace">
            Shop for a little good <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-wrap">
          <div className="landing-footer-top">
            <div>
              <Link className="landing-brand" to="/">
                <span>M</span>Merch4Change
                <span className="landing-brand-dot">.</span>
              </Link>
              <p>Good things happen when we care.</p>
            </div>
            <div className="landing-footer-links">
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/about/story">Our story</Link>
              <Link to="/faq">FAQs</Link>
              <Link to="/help">Help &amp; Support</Link>
              <Link to="/help/contact">
                Get in touch <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <span>© {new Date().getFullYear()} Merch4Change</span>
            <span>
              Made for a world with a little more good. <Heart size={13} />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
