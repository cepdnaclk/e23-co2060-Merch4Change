import React, { useState } from "react";
import "./SettingsSection.css";

function Toggle({ label, desc, badge, checked, onChange }) {
  return (
    <div className="s-toggle-row">
      <div className="s-toggle-row__info">
        <span className="s-toggle-row__label">{label}{badge && <span className="s-toggle-row__badge">{badge}</span>}</span>
        {desc && <span className="s-toggle-row__desc">{desc}</span>}
      </div>
      <label className="s-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="s-switch__slider" />
      </label>
    </div>
  );cd
}

import apiClient from "../../../api/apiClient.js";

export function SecuritySection() {
  const [twoFA, setTwoFA] = React.useState(false);
  const [alerts, setAlerts] = React.useState(true);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [savingToggle, setSavingToggle] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);

  // Load current settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          setTwoFA(user.twoFactorEnabled ?? false);
          setAlerts(user.loginActivityAlerts ?? true);
        }
      } catch (err) {
        console.error("Failed to load security settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleToggleSave = async (which, value) => {
    setSavingToggle(true);
    try {
      const payload = {
        twoFactorEnabled: which === "2fa" ? value : twoFA,
        loginActivityAlerts: which === "alerts" ? value : alerts,
      };
      
      const res = await apiClient.put("/api/v1/settings/security", payload);
      
      if (res.data?.success) {
        if (which === "2fa") setTwoFA(value);
        if (which === "alerts") setAlerts(value);
        alert("Security settings updated!");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingToggle(false);
    }
  };

  const handlePasswordChange = async () => {
    setSavingPassword(true);
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("All password fields are required");
        setSavingPassword(false);
        return;
      }

      const res = await apiClient.post("/api/v1/settings/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        alert("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Account security</h2>
      <p className="s-section__desc">Manage your password and keep your account safe.</p>
      <div className="s-row">
        <label className="s-label">Current password</label>
        <input 
          className="s-input" 
          type="password" 
          placeholder="Enter current password" 
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">New password</label>
        <input 
          className="s-input" 
          type="password" 
          placeholder="Enter new password" 
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Confirm new password</label>
        <input 
          className="s-input" 
          type="password" 
          placeholder="Confirm new password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="s-divider" />
      <Toggle 
        label="Two-factor authentication" 
        desc="Require a code when logging in from a new device" 
        badge="Recommended" 
        checked={twoFA} 
        onChange={() => handleToggleSave("2fa", !twoFA)} 
      />
      <Toggle 
        label="Login activity alerts" 
        desc="Get notified when your account is accessed from a new location" 
        checked={alerts} 
        onChange={() => handleToggleSave("alerts", !alerts)} 
      />
      <div className="s-divider" />
      <button 
        className="s-btn s-btn--primary" 
        onClick={handlePasswordChange}
        disabled={savingPassword || savingToggle}
      >
        {savingPassword ? "Updating..." : "Update password"}
      </button>
    </div>
  );
}

export function PrivacySection() {
  const [s, setS] = React.useState({ 
    private: false, 
    activity: true, 
    messages: true, 
    receipts: false,
    commentPermission: "following"
  });
  const [saving, setSaving] = React.useState(false);

  // Load current settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          setS({
            private: user.isPrivate ?? false,
            activity: user.showActivityStatus ?? true,
            messages: user.allowMessageRequests ?? true,
            receipts: user.hideReadReceipts ?? false,
            commentPermission: user.commentPermission ?? "following"
          });
        }
      } catch (err) {
        console.error("Failed to load privacy settings:", err);
      }
    };
    loadSettings();
  }, []);

  const tog = (k) => {
    const newState = { ...s, [k]: !s[k] };
    setS(newState);
    handleSave(newState);
  };

  const handleCommentPermissionChange = (e) => {
    const newState = { ...s, commentPermission: e.target.value };
    setS(newState);
    handleSave(newState);
  };

  const handleSave = async (stateData) => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/privacy", {
        isPrivate: stateData.private,
        showActivityStatus: stateData.activity,
        allowMessageRequests: stateData.messages,
        hideReadReceipts: stateData.receipts,
        commentPermission: stateData.commentPermission,
      });

      if (res.data?.success) {
        console.log("Privacy settings updated!");
      }
    } catch (err) {
      alert("Error updating privacy: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Privacy</h2>
      <p className="s-section__desc">Control who can see your content and interact with you.</p>
      <Toggle 
        label="Private account" 
        desc="Only approved followers can see your posts" 
        checked={s.private} 
        onChange={() => tog("private")} 
      />
      <Toggle 
        label="Show activity status" 
        desc="Let people see when you were last active" 
        checked={s.activity} 
        onChange={() => tog("activity")} 
      />
      <Toggle 
        label="Allow message requests" 
        desc="Let people you don't follow send message requests" 
        checked={s.messages} 
        onChange={() => tog("messages")} 
      />
      <Toggle 
        label="Hide read receipts" 
        desc="Others won't know when you've read their messages" 
        checked={s.receipts} 
        onChange={() => tog("receipts")} 
      />
      <div className="s-divider" />
      <div className="s-row">
        <label className="s-label">Who can comment on your posts</label>
        <select 
          className="s-input s-input--select" 
          value={s.commentPermission}
          onChange={handleCommentPermissionChange}
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Followers only</option>
          <option value="following">People you follow</option>
          <option value="none">No one</option>
        </select>
      </div>
      {saving && <p style={{ color: "#999", fontSize: "12px", marginTop: "10px" }}>Saving...</p>}
    </div>
  );
}

export function NotificationsSection() {
  const [s, setS] = React.useState({ 
    likes: true, 
    comments: true, 
    followers: true, 
    dms: true, 
    email: false 
  });
  const [saving, setSaving] = React.useState(false);

  // Load current settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          setS({
            likes: user.notifyOnLikes ?? true,
            comments: user.notifyOnComments ?? true,
            followers: user.notifyOnNewFollowers ?? true,
            dms: user.notifyOnDMs ?? true,
            email: user.emailNotifications ?? false
          });
        }
      } catch (err) {
        console.error("Failed to load notification settings:", err);
      }
    };
    loadSettings();
  }, []);

  const tog = (k) => {
    const newState = { ...s, [k]: !s[k] };
    setS(newState);
    handleSave(newState);
  };

  const handleSave = async (stateData) => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/notifications", {
        notifyOnLikes: stateData.likes,
        notifyOnComments: stateData.comments,
        notifyOnNewFollowers: stateData.followers,
        notifyOnDMs: stateData.dms,
        emailNotifications: stateData.email,
      });

      if (res.data?.success) {
        console.log("Notification settings updated!");
      }
    } catch (err) {
      alert("Error updating notifications: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Notifications</h2>
      <p className="s-section__desc">Choose what you get notified about.</p>
      <Toggle 
        label="Likes" 
        desc="When someone likes your posts" 
        checked={s.likes} 
        onChange={() => tog("likes")} 
      />
      <Toggle 
        label="Comments" 
        desc="When someone comments on your posts" 
        checked={s.comments} 
        onChange={() => tog("comments")} 
      />
      <Toggle 
        label="New followers" 
        desc="When someone starts following you" 
        checked={s.followers} 
        onChange={() => tog("followers")} 
      />
      <Toggle 
        label="Direct messages" 
        desc="When you receive a new message" 
        checked={s.dms} 
        onChange={() => tog("dms")} 
      />
      <Toggle 
        label="Email notifications" 
        desc="Receive a summary of activity to your email" 
        checked={s.email} 
        onChange={() => tog("email")} 
      />
      {saving && <p style={{ color: "#999", fontSize: "12px", marginTop: "10px" }}>Saving...</p>}
    </div>
  );
}

export function AppearanceSection() {
  const [appTheme, setAppTheme] = React.useState("system");
  const [fontSize, setFontSize] = React.useState("medium");
  const [saving, setSaving] = React.useState(false);

  // Load current settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          setAppTheme(user.appTheme ?? "system");
          setFontSize(user.fontSize ?? "medium");
        }
      } catch (err) {
        console.error("Failed to load appearance settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/appearance", {
        appTheme,
        fontSize,
      });

      if (res.data?.success) {
        alert("Appearance settings saved!");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Appearance</h2>
      <p className="s-section__desc">Customize how the app looks for you.</p>
      <div className="s-row">
        <label className="s-label">Theme</label>
        <select 
          className="s-input s-input--select" 
          value={appTheme}
          onChange={(e) => setAppTheme(e.target.value)}
        >
          <option value="system">System default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="s-row">
        <label className="s-label">Font size</label>
        <select 
          className="s-input s-input--select" 
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <div className="s-divider" />
      <button 
        className="s-btn s-btn--primary" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save preferences"}
      </button>
    </div>
  );
}

export function LanguageSection() {
  return (
    <div className="s-section">
      <h2 className="s-section__title">Language</h2>
      <p className="s-section__desc">Choose your preferred language for the app.</p>
      <div className="s-row">
        <label className="s-label">App language</label>
        <select className="s-input s-input--select" defaultValue="en-US">
          <option value="en-US">English (US)</option>
          <option value="en-UK">English (UK)</option>
          <option value="si">Sinhala</option>
          <option value="ta">Tamil</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
      </div>
      <div className="s-divider" />
      <button className="s-btn s-btn--primary">Save</button>
    </div>
  );
}

export function HelpSection() {
  return (
    <div className="s-section">
      <h2 className="s-section__title">Help & support</h2>
      <p className="s-section__desc">Find answers or get in touch with the support team.</p>
      <div className="s-list-row"><span>Help center</span><span className="s-list-row__chevron">›</span></div>
      <div className="s-list-row"><span>Report a problem</span><span className="s-list-row__chevron">›</span></div>
      <div className="s-list-row"><span>Privacy policy</span><span className="s-list-row__chevron">›</span></div>
      <div className="s-divider" />
      <button className="s-btn s-btn--danger">Delete account</button>
    </div>
  );
}
