import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  ShoppingBag,
  Users,
  Sparkles,
} from "lucide-react";
import "./OurStory.css";

export default function OurStory() {
  return (
    <div className="our-story">
      <main>
        <div className="story-wrap story-topline">
          <Link to="/" className="story-back">
            Home <span>/</span> <span>About us</span>
          </Link>
          <nav className="story-tabs" aria-label="About Merch4Change">
            <Link to="/about/story" aria-current="page">
              Our story
            </Link>
            <Link to="/about/mission">Our mission</Link>
            <Link to="/about/team">Our team</Link>
          </nav>
        </div>

        <header className="story-intro story-wrap">
          <span className="story-eyebrow">
            <span /> Our Story
          </span>
          <h1>
            A little purpose.
            <br />A bigger <em>possibility.</em>
          </h1>
          <p>How a simple idea grew into a movement for change.</p>
          <a className="story-read-link" href="#the-beginning">
            This is how it started <ArrowRight size={17} />
          </a>
          <div className="story-intro-bottom">
            <span>PEOPLE. PURPOSE. POSSIBILITY.</span>
            <span>
              THE MERCH4CHANGE STORY <span aria-hidden="true">↙</span>
            </span>
          </div>
        </header>

        <section
          className="story-chapter story-wrap"
          id="the-beginning"
          aria-labelledby="story-beginning-title"
        >
          <div className="story-chapter-label">
            <span className="story-number">01</span>
            <span className="story-eyebrow">The Beginning</span>
          </div>
          <div className="story-chapter-body">
            <h2 id="story-beginning-title">
              What if the things we love
              <br />
              could do a little <em>good?</em>
            </h2>
            <div className="story-prose">
              <p>
                Merch4Change was born out of a desire to bridge the gap between
                impactful charity work and everyday consumerism. We realized
                that people love supporting their favorite brands, but also want
                to make a difference in the world.
              </p>
              <p>
                That simple connection became our starting point: bring people,
                brands, and causes together, and make room for more meaningful
                everyday choices.
              </p>
            </div>
          </div>
        </section>

        <section className="story-vision" aria-labelledby="story-vision-title">
          <div className="story-wrap">
            <div className="story-chapter-label">
              <span className="story-number">02</span>
              <span className="story-eyebrow">Our Vision</span>
            </div>
            <div className="story-vision-content">
              <h2 id="story-vision-title">
                Something you love.
                <br />
                <em>Something that matters.</em>
              </h2>
              <p>
                Our goal is to create a seamless platform where every purchase
                has a positive impact. By partnering with leading brands we are
                developing sustainable merchandise lines that directly fund
                community projects.
              </p>
            </div>
            <div
              className="story-connections"
              aria-label="Connecting shoppers, brands, and causes"
            >
              <div>
                <ShoppingBag size={25} strokeWidth={1.5} />
                <h3>Everyday people</h3>
                <p>A choice that reflects what you care about.</p>
              </div>
              <span className="story-connection-arrow" aria-hidden="true">
                <ArrowRight size={22} />
              </span>
              <div>
                <Sparkles size={25} strokeWidth={1.5} />
                <h3>Purposeful brands</h3>
                <p>Merchandise with a story worth sharing.</p>
              </div>
              <span className="story-connection-arrow" aria-hidden="true">
                <ArrowRight size={22} />
              </span>
              <div>
                <Heart size={25} strokeWidth={1.5} />
                <h3>Meaningful causes</h3>
                <p>Support for the work that makes a difference.</p>
              </div>
            </div>
          </div>
        </section>

        <section
          className="story-chapter story-wrap story-ahead"
          aria-labelledby="story-ahead-title"
        >
          <div className="story-chapter-label">
            <span className="story-number">03</span>
            <span className="story-eyebrow">The Journey Ahead</span>
          </div>
          <div className="story-chapter-body">
            <h2 id="story-ahead-title">
              The next chapter
              <br />
              starts <em>with us.</em>
            </h2>
            <div className="story-prose">
              <p>
                We are constantly expanding our network of charities and brands.
                Our story is just beginning, and we invite you to be a part of
                it.
              </p>
              <p>
                Whether you’re here to discover meaningful merchandise, share a
                cause, or build a community, there’s a place for you in this
                story.
              </p>
              <Link className="story-inline-link" to="/about/team">
                Meet the people behind the purpose <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="story-invitation story-wrap"
          aria-labelledby="story-invitation-title"
        >
          <div className="story-invitation-icon">
            <Users size={26} strokeWidth={1.5} />
          </div>
          <span className="story-eyebrow">
            GOOD GROWS WHEN WE COME TOGETHER
          </span>
          <h2 id="story-invitation-title">You’re part of the story, too.</h2>
          <p>
            Find your people. Discover your purpose. Make your next choice
            count.
          </p>
          <div className="story-actions">
            <Link className="story-button" to="/marketplace">
              Explore the marketplace <ArrowUpRight size={18} />
            </Link>
            <Link className="story-inline-link" to="/signup?type=org">
              Bring your organisation <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="story-footer">
        <div className="story-wrap">
          <span>© {new Date().getFullYear()} Merch4Change</span>
          <nav aria-label="Story footer">
            <Link to="/about/mission">Our mission</Link>
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
