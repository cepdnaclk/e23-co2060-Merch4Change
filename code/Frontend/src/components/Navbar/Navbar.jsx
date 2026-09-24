import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";
import BrandLogo from "../BrandLogo/BrandLogo";
import { useI18n } from "../../i18n/I18nContext";

function Navbar({ scrolled = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const { t } = useI18n();

  const isLandingPage = location.pathname === "/";

  const scrollTo = (id) => {
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`lp-navbar ${isLandingPage ? "lp-navbar--landing" : ""} ${scrolled ? "lp-navbar--scrolled" : ""}`}
      ref={navbarRef}
    >
      <div className="lp-navbar-container">
        {/* Left: Logo */}
        <button
          className="lp-navbar-brand"
          onClick={() => handleNavigation("/")}
          aria-label="Merch4Change"
        >
          <BrandLogo size={34} className="lp-navbar-icon" />
          <span className="lp-navbar-text">{t("common.appName")}</span>
        </button>

        {/* Center: Navigation (desktop only) */}
        {isLandingPage && (
          <div className="lp-navbar-center">
            <button
              className="lp-navbar-link"
              onClick={() => handleNavigation("/marketplace")}
            >
              {t("publicNav.marketplace")}
            </button>
            <button
              className="lp-navbar-link"
              onClick={() => scrollTo("for-organisations")}
            >
              {t("publicNav.forOrganisations")}
            </button>
            <button
              className="lp-navbar-link"
              onClick={() => scrollTo("impact-stats")}
            >
              {t("publicNav.impact")}
            </button>
          </div>
        )}

        {/* Right: Buttons */}
        <div className="lp-navbar-actions">
          <button
            className="lp-navbar-signin"
            onClick={() => handleNavigation("/login")}
          >
            {t("common.signIn")}
          </button>
          <button
            className="lp-navbar-getstarted"
            onClick={() => handleNavigation("/signup")}
          >
            {t("common.getStarted")}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lp-navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="public-mobile-menu"
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lp-navbar-mobile-menu" id="public-mobile-menu">
          <button
            className="lp-navbar-mobile-link"
            onClick={() => handleNavigation("/marketplace")}
          >
            {t("publicNav.marketplace")}
          </button>
          {isLandingPage ? (
            <>
              <button
                className="lp-navbar-mobile-link"
                onClick={() => scrollTo("for-organisations")}
              >
                {t("publicNav.forOrganisations")}
              </button>
              <button
                className="lp-navbar-mobile-link"
                onClick={() => scrollTo("impact-stats")}
              >
                {t("publicNav.impact")}
              </button>
            </>
          ) : (
            <>
              <button
                className="lp-navbar-mobile-link"
                onClick={() => handleNavigation("/faq")}
              >
                FAQ
              </button>
              <button
                className="lp-navbar-mobile-link"
                onClick={() => handleNavigation("/help")}
              >
                Help & Support
              </button>
              <button
                className="lp-navbar-mobile-link"
                onClick={() => handleNavigation("/about/story")}
              >
                About Us
              </button>
            </>
          )}

          <div className="lp-navbar-mobile-divider"></div>

          <div className="lp-navbar-mobile-buttons">
            <button
              className="lp-navbar-signin"
              onClick={() => handleNavigation("/login")}
            >
              {t("common.signIn")}
            </button>
            <button
              className="lp-navbar-getstarted"
              onClick={() => handleNavigation("/signup")}
            >
              {t("common.getStarted")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;