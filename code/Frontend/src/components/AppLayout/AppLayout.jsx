import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "../TopNavbar/TopNavbar";
import Sidebar from "../Sidebar/Sidebar";
import { useAuth } from "../../context/Context";
import { useTheme } from "../../context/ThemeContext";
import "../../pages/Home/Home.css";

const defaultProfile = {
  firstName: "Guest",
  lastName: "User",
  userName: "guest",
};

export default function AppLayout({ children }) {
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const [profileData, setProfileData] = useState(defaultProfile);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData(user);
    }
  }, [user]);

  return (
    <div
      className={`luminous-app min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
      data-theme={resolvedTheme}
    >
      <TopNavbar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        profileData={profileData}
        activeTab="feed"
      />

      <div className="lum-layout">
        <Sidebar
          profileData={profileData}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <main className="lum-main-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}