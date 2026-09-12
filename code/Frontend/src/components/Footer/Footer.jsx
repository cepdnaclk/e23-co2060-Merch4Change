import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";
import BrandLogo from "../BrandLogo/BrandLogo";
import { useI18n } from "../../i18n/I18nContext";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <BrandLogo size={36} className="footer-logo" />
            <span className="footer-title">{t("common.appName")}</span>
          </div>
          <p className="footer-desc">{t("footer.tagline")}</p>
        </div>

        <div className="footer-links-section">
          <div className="footer-column">
            <h4>{t("footer.aboutUs")}</h4>
            <ul>
              <li onClick={() => navigate("/about/story")}>{t("footer.ourStory")}</li>
              <li onClick={() => navigate("/about/mission")}>{t("footer.ourMission")}</li>
              <li onClick={() => navigate("/about/team")}>{t("footer.teamAntigravity")}</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>{t("footer.support")}</h4>
            <ul>
              <li onClick={() => navigate("/help")}>{t("footer.helpCenter")}</li>
              <li onClick={() => navigate("/help#how-it-works")}>{t("footer.howItWorks")}</li>
              <li onClick={() => navigate("/faq")}>{t("footer.faqs")}</li>
              <li onClick={() => navigate("/help/contact")}>{t("footer.contactUs")}</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>{t("footer.legal")}</h4>
            <ul>
              <li>{t("footer.privacyPolicy")}</li>
              <li>{t("footer.termsOfService")}</li>
              <li>{t("footer.cookiePolicy")}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} {t("common.appName")}. {t("footer.rightsReserved")}
        </p>
        <div className="footer-socials">
          <span className="social-icon">IN</span>
          <span className="social-icon">TW</span>
          <span className="social-icon">FB</span>
          <span className="social-icon">IG</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;