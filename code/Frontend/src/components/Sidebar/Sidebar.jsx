import React, { memo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import CreatePostModal from "../CreatePostModal/CreatePostModal";
import BrandLogo from "../BrandLogo/BrandLogo";
import { useAuth } from "../../context/Context";
import { fetchNotifications } from "../../services/notificationService";
import { useI18n } from "../../i18n/I18nContext";
import {
  Home,
  MessageSquare,
  Search,
  Bell,
  Store,
  Layers,
  BarChart2,
  Settings,
  Plus,
  Heart,
  ShieldCheck,
  ClipboardList,
  Trophy,
  Users,
  X,
} from "lucide-react";

function Sidebar({ profileData, setIsSidebarCollapsed, isSidebarCollapsed, onPostCreated }) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const navigate = useNavigate();
  const { user: storedUser } = useAuth();
  const { t } = useI18n();
  const userRole = profileData?.role || storedUser?.role;
  const userAccountType = profileData?.accountType || storedUser?.accountType;
  const isAdmin = userRole === "admin";
  const showAddProjectLink = userAccountType === "organization";

  const closeMobileSidebar = () => {
    setIsSidebarCollapsed?.(true);
  };

  const handleSelectOption = (value) => {
    setSelectedOption(value);
    closeMobileSidebar();
  };

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;
    if (!storedUser) return; // Wait until auth is resolved

    fetchNotifications()
      .then((response) => {
        if (!active) return;
        const rawNotifications = Array.isArray(response?.data?.notifications) ? response.data.notifications : (Array.isArray(response) ? response : []);
        const items = rawNotifications.filter(item => item != null).map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setNotifications(items);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [storedUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div
        className="lum-sidebar-backdrop"
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />
      <aside className="lum-sidebar-left">
        <div className="lum-logo">
          <BrandLogo size={34} className="lp-navbar-icon" />
          <h2 className="lp-navbar-text">Merch4Change</h2>
          <button
            type="button"
            className="lum-sidebar-close-btn"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="lum-sidebar-nav">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
            onClick={() => handleSelectOption(1)}
          >
          <div className="lum-nav-icon"><Home size={20} /></div> <span className="lum-nav-text">{t("nav.home")}</span>
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption('search')}
        >
          <div className="lum-nav-icon"><Search size={20} /></div> <span className="lum-nav-text">{t("nav.search")}</span>
        </NavLink>
        <NavLink
          to="/messaging"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption(2)}
        >
          <div className="lum-nav-icon"><MessageSquare size={20} /></div> <span className="lum-nav-text">{t("nav.messages")}</span>
        </NavLink>
        <NavLink
          to="/notification"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption('notification')}
        >
          <div className="lum-nav-icon" style={{ position: 'relative' }}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="lum-notif-badge">{unreadCount}</span>
            )}
          </div> 
          <span className="lum-nav-text">{t("nav.notifications")}</span>
        </NavLink>
        <NavLink
          to="/marketplace"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption('marketplace')}
        >
          <div className="lum-nav-icon"><Store size={20} /></div> <span className="lum-nav-text">{t("nav.marketplace")}</span>
        </NavLink>
        {userAccountType !== "organization" && (
          <div
            className={selectedOption === 3 ? "lum-nav-item active" : "lum-nav-item"}
            onClick={() => {
              handleSelectOption(3);
              navigate("/under-construction");
            }}
          >
            <div className="lum-nav-icon"><Layers size={20} /></div> <span className="lum-nav-text">{t("nav.collections")}</span>
          </div>
        )}
        <div
          className={selectedOption === 4 ? "lum-nav-item active" : "lum-nav-item"}
          onClick={() => {
            handleSelectOption(4);
            navigate("/under-construction");
          }}
        >
          <div className="lum-nav-icon"><BarChart2 size={20} /></div> <span className="lum-nav-text">{t("nav.analytics")}</span>
        </div>
        <NavLink
          to="/donations"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption(5)}
        >
          <div className="lum-nav-icon"><Heart size={20} /></div> <span className="lum-nav-text">{t("nav.donations")}</span>
        </NavLink>
        <NavLink
          to="/leaderboard"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption('leaderboard')}
        >
          <div className="lum-nav-icon"><Trophy size={20} /></div> <span className="lum-nav-text">{t("nav.leaderboard")}</span>
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin/charities"
            className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
            onClick={() => handleSelectOption(8)}
          >
            <div className="lum-nav-icon"><ClipboardList size={20} /></div> <span className="lum-nav-text">{t("nav.charityVerification")}</span>
          </NavLink>
        )}
        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
          onClick={() => handleSelectOption(6)}
        >
          <div className="lum-nav-icon"><Settings size={20} /></div> <span className="lum-nav-text">{t("nav.settings")}</span>
        </NavLink>
        
        {showAddProjectLink && (
          <NavLink
            to={`/profile/${storedUser?.userName || profileData?.userName}/projects`}
            className={({ isActive }) => (isActive ? "lum-nav-item active" : "lum-nav-item")}
            onClick={() => handleSelectOption('add-project')}
          >
            <div className="lum-nav-icon"><Plus size={20} /></div> <span className="lum-nav-text">{t("nav.addProject")}</span>
          </NavLink>
        )}
        <div 
          className="lum-nav-item"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <div className="lum-nav-icon"><Plus size={20} /></div> <span className="lum-nav-text">{t("nav.createPost")}</span>
        </div>
      </div>

      <div className="lum-sidebar-footer">
        <NavLink to="/profile/me" className="lum-sidebar-profile-link" onClick={closeMobileSidebar}>
          <div className="lum-nav-icon">
            <img 
              src={profileData?.profileImageUrl || storedUser?.profileImageUrl || "/src/assets/user.svg"} 
              alt="Profile" 
              className="lum-sidebar-profile-img"
            />
          </div>
          <span className="lum-nav-text">{profileData?.userName || storedUser?.userName}</span>
        </NavLink>
      </div>

      <CreatePostModal 
        isOpen={isCreatePostOpen} 
        onClose={() => setIsCreatePostOpen(false)} 
        onSuccess={(newPost) => {
          if (typeof onPostCreated === "function") {
            onPostCreated(newPost);
          }
        }}
      />
    </aside>
    </>
  );
}

export default memo(Sidebar);