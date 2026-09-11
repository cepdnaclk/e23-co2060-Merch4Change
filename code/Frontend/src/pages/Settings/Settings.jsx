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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();
  const initialSection = searchParams.get("section") || "profile";
  const [activeSection, setActiveSection] = useState(initialSection);
  const [profileData, setProfileData] = useState({
    firstName: "Guest",
    lastName: "User",
    userName: "guest",
  });

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

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    try {
      await fetch(`${apiUrl}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
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
    setActiveSection(id);
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