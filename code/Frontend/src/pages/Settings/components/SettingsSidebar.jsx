import React from "react";
import { User, Lock, Shield, Bell, Sun, Globe, HelpCircle, LogOut } from "lucide-react";
import { useI18n } from "../../../i18n/I18nContext";
import "./SettingsSidebar.css";

function SettingsSidebar({ activeSection, onSelect, showOrganization }) {
  const { t } = useI18n();

  const GROUPS = [
    {
      key: "account",
      label: t("settings.sidebar.account"),
      items: [
        { id: "profile", icon: <User size={16} />, label: t("settings.sidebar.editProfile") },
        { id: "security", icon: <Lock size={16} />, label: t("settings.sidebar.accountSecurity") },
        { id: "privacy", icon: <Shield size={16} />, label: t("settings.sidebar.privacy") },
      ],
    },
    {
      key: "preferences",
      label: t("settings.sidebar.preferences"),
      items: [
        { id: "notifications", icon: <Bell size={16} />, label: t("settings.sidebar.notifications") },
        { id: "appearance", icon: <Sun size={16} />, label: t("settings.sidebar.appearance") },
        { id: "language", icon: <Globe size={16} />, label: t("settings.sidebar.language") },
      ],
    },
    {
      key: "more",
      label: t("settings.sidebar.more"),
      items: [
        { id: "help", icon: <HelpCircle size={16} />, label: t("settings.sidebar.help") },
        { id: "logout", icon: <LogOut size={16} />, label: t("settings.sidebar.logout"), isDanger: true },
      ],
    },
  ];

  const groups = GROUPS.map((group) => {
    if (group.key !== "account" || !showOrganization) return group;
    return {
      ...group,
      items: [
        ...group.items,
        { id: "organization", icon: <Shield size={16} />, label: t("settings.sidebar.organizationVerification") },
      ],
    };
  });

  return (
    <aside className="ss-nav">
      <div className="ss-nav__header">{t("settings.sidebar.header")}</div>
      {groups.map((group) => (
        <div key={group.key} className="ss-nav__group">
          <span className="ss-nav__group-label">{group.label}</span>
          {group.items.map((item) => (
            <button
              key={item.id}
              className={`ss-nav__item${activeSection === item.id ? " ss-nav__item--active" : ""}${
                item.isDanger ? " ss-nav__item--danger" : ""
              }`}
              onClick={() => onSelect(item.id)}
            >
              <span className="ss-nav__icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

export default SettingsSidebar;