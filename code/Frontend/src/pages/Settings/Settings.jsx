import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import SettingsSidebar from "./components/SettingsSidebar";
import {
  ProfileSection,
  SecuritySection,
  PrivacySection,
  NotificationsSection,
  AppearanceSection,
  LanguageSection,
  HelpSection,
} from "./sections/Sections";
import OrganizationVerificationSection from "./sections/OrganizationVerificationSection";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/Context";
import "./Settings.css";

const SECTIONS = {
  profile: ProfileSection,
  security: SecuritySection,
  privacy: PrivacySection,
  notifications: NotificationsSection,
  appearance: AppearanceSection,
  language: LanguageSection,
  help: HelpSection,
  organization: OrganizationVerificationSection,
};

function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: "Guest",
    lastName: "User",
    userName: "guest",
  });

  const sectionParam = searchParams.get("section") || "profile";
  const isValidSection = SECTIONS[sectionParam];
  const isOrgAllowed = profileData.accountType === "organization";
  const activeSection =
    sectionParam === "organization" && !isOrgAllowed
      ? "profile"
      : isValidSection
      ? sectionParam
      : "profile";

  useEffect(() => {
    apiClient
      .get("/api/v1/profile/me")
      .then((res) => {
        const data = res.data;
        if (data?.success && data.data?.user) {
          setProfileData(data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Do you want to logout?")) return;

    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch {
      // Clear client-side state even if request fails
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleSelect = (id) => {
    if (id === "logout") {
      handleLogout();
      return;
    }
    setSearchParams({ section: id });
  };

  const ActiveSection = SECTIONS[activeSection] || ProfileSection;

  return (
    <div className="settings-page">
      <Sidebar profileData={profileData} />
      <div className="settings-body">
        <SettingsSidebar
          activeSection={activeSection}
          onSelect={handleSelect}
          showOrganization={profileData.accountType === "organization"}
        />
        <main className="settings-content">
          <ActiveSection profileData={profileData} onUpdate={setProfileData} />
        </main>
      </div>
    </div>
  );
}

export default Settings;