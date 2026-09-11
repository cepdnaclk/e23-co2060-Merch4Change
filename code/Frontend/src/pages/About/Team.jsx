import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  Code2,
  Users,
  GraduationCap,
} from "lucide-react";
import "./OurStory.css";
import "./Team.css";

// Names and roles from the project README's Team section.
const teamMembers = [
  {
    name: "R.A.J.C. Adhikari",
    role: "Tech Lead",
    initials: "JA",
    tone: "blue",
  },
  { name: "M.N.A. Fikry", role: "Scrum Master", initials: "AF", tone: "lilac" },
  {
    name: "S.D.M.P. Sandanayake",
    role: "Team Leader",
    initials: "MS",
    tone: "violet",
  },
  {
    name: "S.B.N.S. Samarawickrama",
    role: "Backend Developer",
    initials: "NS",
    tone: "lilac",
  },
  {
    name: "M.A.S. Dulshara",
    role: "Database Manager",
    initials: "SD",
    tone: "violet",
  },
  {
    name: "G.C. Damsiluni",
    role: "Frontend Developer",
    initials: "CD",
    tone: "blue",
  },
];

export default function Team() {
  return (
    <div className="our-story team-page">
      <main>
        <div className="story-wrap story-topline">
          <Link to="/" className="story-back">
            Home <span>/</span> <span>About us</span>
          </Link>
          <nav className="story-tabs" aria-label="About Merch4Change">
            <Link to="/about/story">Our story</Link>
            <Link to="/about/mission">Our mission</Link>
            <Link to="/about/team" aria-current="page">
              Our team
            </Link>
          </nav>
        </div>
        <header className="team-intro story-wrap">
          <span className="story-eyebrow">
            <span /> THE PEOPLE BEHIND THE PURPOSE
          </span>
          <h1>
            Different minds.
            <br />
            One shared <em>purpose.</em>
          </h1>
          <p>The passionate individuals driving Merch4Change.</p>
          <a href="#meet-the-team" className="team-meet-link">
            Meet Team Antigravity <ArrowRight size={17} />
          </a>
          <div className="team-origin">
            <GraduationCap size={18} strokeWidth={1.5} />
            <span>University of Peradeniya</span>
            <span className="team-origin-dot" aria-hidden="true">
              ·
            </span>
            <span>Sri Lanka</span>
          </div>
        </header>

        <section
          className="team-roster story-wrap"
          id="meet-the-team"
          aria-labelledby="team-roster-title"
        >
          <div className="team-section-heading">
            <div>
              <span className="story-eyebrow">MEET THE BUILDERS</span>
              <h2 id="team-roster-title">Team Antigravity</h2>
            </div>
            <p>
              A team of six, bringing our skills together to connect people,
              brands, and causes.
            </p>
          </div>
          <div className="team-member-grid">
            {teamMembers.map((member, index) => (
              <article
                className={`team-member team-member--${member.tone}`}
                key={member.name}
              >
                <div className="team-member-art" aria-hidden="true">
                  <span className="team-member-index">0{index + 1}</span>
                  <div className="team-member-orbit" />
                  <div className="team-member-monogram">{member.initials}</div>
                  <span className="team-member-mark">✳</span>
                </div>
                <div className="team-member-info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="team-principles"
          aria-labelledby="team-principles-title"
        >
          <div className="story-wrap">
            <div className="team-principles-heading">
              <span className="story-eyebrow">WHAT BRINGS US TOGETHER</span>
              <h2 id="team-principles-title">
                Built with curiosity.
                <br />
                <em>Guided by care.</em>
              </h2>
              <p>
                Merch4Change is our second-year CO2060 project at the Faculty of
                Engineering, University of Peradeniya. It’s a space to turn what
                we learn into something meaningful.
              </p>
            </div>
            <div className="team-principle-list">
              <article>
                <Code2 size={24} strokeWidth={1.5} />
                <div>
                  <h3>Keep learning. Keep building.</h3>
                  <p>
                    Explore ideas, ask better questions, and improve with every
                    iteration.
                  </p>
                </div>
              </article>
              <article>
                <Users size={24} strokeWidth={1.5} />
                <div>
                  <h3>Make room for every perspective.</h3>
                  <p>
                    Bring different skills to the same table and build something
                    together.
                  </p>
                </div>
              </article>
              <article>
                <Heart size={24} strokeWidth={1.5} />
                <div>
                  <h3>Remember who it’s for.</h3>
                  <p>
                    Keep the people and communities behind every cause at the
                    heart of our work.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          className="team-contact story-wrap"
          aria-labelledby="team-contact-title"
        >
          <div>
            <span className="story-eyebrow">LET'S START A CONVERSATION</span>
            <h2 id="team-contact-title">
              Good ideas grow <em>together.</em>
            </h2>
            <p>
              Have a question, a suggestion, or a cause you care about? We’d
              love to hear from you.
            </p>
          </div>
          <Link className="story-button" to="/help/contact">
            Get in touch <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="story-footer">
        <div className="story-wrap">
          <span>© {new Date().getFullYear()} Merch4Change</span>
          <nav aria-label="Team footer">
            <Link to="/about/story">Our story</Link>
            <Link to="/help">Help &amp; Support</Link>
            <Link to="/marketplace">
              Explore the marketplace <ArrowUpRight size={13} />
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
