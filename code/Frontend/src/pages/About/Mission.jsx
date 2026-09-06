import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Handshake,
  Sprout,
  Heart,
  ShoppingBag,
  Users,
} from "lucide-react";
import "./OurStory.css";
import "./Mission.css";

const pillars = [
  {
    title: "Global Impact",
    icon: Globe2,
    caption: "START LOCAL. THINK BIGGER.",
    text: "Connecting local communities with global resources to solve pressing challenges such as education, healthcare, and environmental conservation.",
  },
  {
    title: "Empowering Connections",
    icon: Handshake,
    caption: "BETTER, TOGETHER.",
    text: "Fostering powerful partnerships between socially-conscious brands and dedicated charitable organizations to amplify their reach and impact.",
  },
  {
    title: "Sustainable Commerce",
    icon: Sprout,
    caption: "CARE IN EVERY CHOICE.",
    text: "Promoting eco-friendly and ethically sourced merchandise, ensuring that the products you love also care for the planet we live on.",
  },
];

export default function Mission() {
  return (
    <div className="our-story mission-page">
      <main>
        <div className="story-wrap story-topline">
          <Link className="story-back" to="/">
            Home <span>/</span>
            <span>About us</span>
          </Link>
          <nav className="story-tabs" aria-label="About Merch4Change">
            <Link to="/about/story">Our story</Link>
            <Link to="/about/mission" aria-current="page">
              Our mission
            </Link>
            <Link to="/about/team">Our team</Link>
          </nav>
        </div>
        <header className="mission-intro story-wrap">
          <span className="story-eyebrow">
            <span /> Our Mission
          </span>
          <h1>
            Make every choice{" "}
            <br />a chance for <em>change.</em>
          </h1>
          <p>Driving impact-led commerce globally.</p>
          <a className="mission-read-link" href="#our-priorities">
            Explore what drives us <ArrowRight size={17} />
          </a>
        </header>

        <section
          className="mission-statement story-wrap"
          aria-labelledby="mission-statement-title"
        >
          <div className="mission-statement-top">
            <span className="story-eyebrow">THE PURPOSE BEHIND IT ALL</span>
            <Heart size={25} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 id="mission-statement-title">
            Bring people, brands, and causes together.
            <br />
            <em>Make doing good part of the everyday.</em>
          </h2>
          <div className="mission-statement-bottom">
            <span>ONE PLATFORM. SHARED POSSIBILITY.</span>
            <p>
              We believe meaningful change grows when the things we buy, the
              communities we join, and the causes we support are connected.
            </p>
          </div>
        </section>

        <section
          className="mission-priorities story-wrap"
          id="our-priorities"
          aria-labelledby="mission-priorities-title"
        >
          <div className="mission-section-heading">
            <div>
              <span className="story-eyebrow">WHAT WE'RE WORKING TOWARDS</span>
              <h2 id="mission-priorities-title">
                Three priorities.
                <br />
                One shared <em>direction.</em>
              </h2>
            </div>
            <p>
              Our mission guides the platform we build and the connections we
              hope to make possible.
            </p>
          </div>
          <div className="mission-pillar-grid">
            {pillars.map((pillar, index) => (
              <article className="mission-pillar" key={pillar.title}>
                <div className="mission-pillar-top">
                  <pillar.icon size={28} strokeWidth={1.5} aria-hidden="true" />
                  <span>0{index + 1}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
                <span className="mission-pillar-caption">{pillar.caption}</span>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mission-participation story-wrap"
          aria-labelledby="mission-participation-title"
        >
          <div className="mission-participation-intro">
            <span className="story-eyebrow">A MISSION WE SHARE</span>
            <h2 id="mission-participation-title">
              There’s a place
              <br />
              for <em>you, too.</em>
            </h2>
            <p>
              Every community begins with people who care. Find your way to be
              part of ours.
            </p>
            <Link className="story-inline-link" to="/about/story">
              Read our story <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="mission-paths">
            <article>
              <ShoppingBag size={22} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3>Discover something meaningful.</h3>
                <p>
                  Explore merchandise and find brands that reflect the things
                  you care about.
                </p>
                <Link className="story-inline-link" to="/marketplace">
                  Explore the marketplace <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
            <article>
              <Users size={22} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <h3>Bring your purpose to the community.</h3>
                <p>
                  Share your organisation’s story and connect with people who
                  want to support your work.
                </p>
                <Link className="story-inline-link" to="/signup?type=org">
                  Get your organisation started <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          </div>
        </section>
        <div className="mission-closing story-wrap">
          <span>Small choices. Shared purpose. Lasting change.</span>
          <Heart size={18} strokeWidth={1.5} aria-hidden="true" />
        </div>
      </main>
      <footer className="story-footer">
        <div className="story-wrap">
          <span>© {new Date().getFullYear()} Merch4Change</span>
          <nav aria-label="Mission footer">
            <Link to="/about/team">Our team</Link>
            <Link to="/help">Help &amp; Support</Link>
            <Link to="/help/contact">
              Get in touch <ArrowUpRight size={13} />
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
