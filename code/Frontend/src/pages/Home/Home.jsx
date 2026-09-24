import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./Home.css";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import Feed from "../../components/Feed/Feed";
import Sidebar from "../../components/Sidebar/Sidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";

const VALID_TABS = new Set(["feed"]);

function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileData, setProfileData] = useState({
    firstName: "Guest",
    lastName: "User", 
    userName: "guest",
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 992;
    }
    return false;
  });
  const currentTab = searchParams.get("tab");
  const activeTab = VALID_TABS.has(currentTab) ? currentTab : "feed";
  const effectiveSidebarCollapsed = isSidebarCollapsed;

  useEffect(() => {
    apiClient.get("/api/v1/profile/me")
      .then((res) => {
        if (res.data?.success && res.data.data?.user) {
          setProfileData(res.data.data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let wasMobile = typeof window !== "undefined" ? window.innerWidth <= 992 : false;
    const handleResize = () => {
      const isMobile = window.innerWidth <= 992;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        setIsSidebarCollapsed(isMobile);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleTabChange = useCallback((tab) => {
    if (tab === "marketplace") {
      navigate("/marketplace");
      return;
    }

    setSearchParams({});
    if (typeof window !== "undefined" && window.innerWidth <= 992) {
      setIsSidebarCollapsed(true);
    }
  }, [navigate, setSearchParams]);

  const handlePostCreated = useCallback((newPost) => {
    window.dispatchEvent(new CustomEvent("post-created", { detail: newPost }));
  }, []);

  return (
    <div className={`luminous-app ${effectiveSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <TopNavbar
        isSidebarCollapsed={effectiveSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        profileData={profileData}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <div className="lum-layout">
        <Sidebar
          profileData={profileData}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isSidebarCollapsed={effectiveSidebarCollapsed}
          onPostCreated={handlePostCreated}
        />

        <main className="lum-main-content home-main-content">
          <Feed />
        </main>

        <RightSidebar page="home" />
      </div>
    </div>
  );
}

export default Home;