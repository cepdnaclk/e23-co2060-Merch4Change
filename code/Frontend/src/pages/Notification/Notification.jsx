import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import TopNavbar from "../../components/TopNavbar/TopNavbar";
import NotificationDropDown from "../../components/Notifications/NotificationDropDown";
import { fetchNotifications, markNotificationRead } from "../../services/notificationService";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  useEffect(() => {
    fetchNotifications()
      .then((response) => {
        const rawNotifications = Array.isArray(response?.data?.notifications) ? response.data.notifications : (Array.isArray(response) ? response : []);
        const items = rawNotifications.filter(item => item != null).map((item) => ({
          ...item,
          id: item._id || item.id,
        }));
        setNotifications(items);
      })
      .catch((error) => console.error("Error fetching notifications:", error));
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className={`luminous-app ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <TopNavbar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />
      <div className="lum-layout">
        <Sidebar 
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="lum-main-content">
          <div className="p-3 sm:p-6 flex justify-center w-full min-h-screen">
            <NotificationDropDown 
              notifications={notifications} 
              onMarkAsRead={handleMarkAsRead}
              containerClassName="bg-white dark:bg-[#1b1b1f] rounded-xl shadow-sm border border-gray-100 dark:border-[#2c2c33] w-full max-w-3xl p-4 sm:p-6 h-fit mt-2 sm:mt-4"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
