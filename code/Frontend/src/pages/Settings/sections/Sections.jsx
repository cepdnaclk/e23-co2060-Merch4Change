import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/apiClient.js";
import { useTheme } from "../../../context/ThemeContext";
import "./SettingsSection.css";

function Toggle({ label, desc, badge, checked, onChange }) {
  return (
    <div className="s-toggle-row">
      <div className="s-toggle-row__info">
        <span className="s-toggle-row__label">
          {label}
          {badge && <span className="s-toggle-row__badge">{badge}</span>}
        </span>
        {desc && <span className="s-toggle-row__desc">{desc}</span>}
      </div>
      <label className="s-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="s-switch__slider" />
      </label>
    </div>
  );
}

export function SecuritySection() {
  const [twoFA, setTwoFA] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
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
  const [s, setS] = useState({
    private: false,
    activity: true,
    messages: true,
    receipts: false,
    commentPermission: "following",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
            commentPermission: user.commentPermission ?? "following",
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
  const [s, setS] = useState({
    likes: true,
    comments: true,
    followers: true,
    dms: true,
    email: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
            email: user.emailNotifications ?? false,
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
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [appTheme, setAppTheme] = useState(theme);
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAppTheme(theme);
  }, [theme]);

  useEffect(() => {
    setLocalFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          const backendTheme = user.appTheme;
          const backendFontSize = user.fontSize;

          const storedLocalTheme = localStorage.getItem("m4c-theme");
          const storedLocalFont = localStorage.getItem("m4c-font-size");

          // Do not overwrite user choice if already stored locally
          if (!storedLocalTheme && backendTheme) {
            setAppTheme(backendTheme);
            setTheme(backendTheme);
          }
          if (!storedLocalFont && backendFontSize) {
            setLocalFontSize(backendFontSize);
            setFontSize(backendFontSize);
          }
        }
      } catch (err) {
        console.error("Failed to load appearance settings:", err);
      } finally {
        setLoaded(true);
      }
    };
    loadSettings();
  }, [setTheme, setFontSize]);

  const handleThemeChange = (e) => {
    const next = e.target.value;
    setAppTheme(next);
    setTheme(next);

    // Synchronous immediate DOM reflection to avoid delayed paint
    const isDark =
      next === "dark" ||
      (next === "system" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    if (document.body) {
      document.body.classList.toggle("dark", isDark);
      document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    }
  };

  const handleFontSizeChange = (e) => {
    const next = e.target.value;
    setLocalFontSize(next);
    setFontSize(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/appearance", {
        appTheme,
        fontSize: localFontSize,
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
          onChange={handleThemeChange}
          disabled={!loaded}
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
          value={localFontSize}
          onChange={handleFontSizeChange}
          disabled={!loaded}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <p className="s-section__desc" style={{ margin: "-8px 0 18px" }}>
        Changes preview instantly — click save to keep them on your other devices.
      </p>
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
  const [appLanguage, setAppLanguage] = useState("en-US");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiClient.get("/api/v1/profile/me");
        if (res.data?.data?.user) {
          const user = res.data.data.user;
          setAppLanguage(user.appLanguage ?? "en-US");
        }
      } catch (err) {
        console.error("Failed to load language settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/language", {
        appLanguage,
      });

      if (res.data?.success) {
        alert("Language preference updated!");
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Language</h2>
      <p className="s-section__desc">Choose your preferred language for the app.</p>
      <div className="s-row">
        <label className="s-label">App language</label>
        <select
          className="s-input s-input--select"
          value={appLanguage}
          onChange={(e) => setAppLanguage(e.target.value)}
        >
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
      <button
        className="s-btn s-btn--primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export function HelpSection() {
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter your password to confirm account deletion.");
      return;
    }

    if (!window.confirm("⚠️ Are you sure? This action is permanent and cannot be undone!")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await apiClient.delete("/api/v1/settings/account", {
        data: { password: deletePassword },
      });

      if (res.data?.success) {
        alert("Your account has been permanently deleted.");
        window.location.href = "/";
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="s-section">
      <h2 className="s-section__title">Help & support</h2>
      <p className="s-section__desc">Find answers or get in touch with the support team.</p>
      <Link to="/help" className="s-list-row">
        <span>Help center</span>
        <span className="s-list-row__chevron">›</span>
      </Link>
      <Link to="/help/contact" className="s-list-row">
        <span>Report a problem</span>
        <span className="s-list-row__chevron">›</span>
      </Link>
      <Link to="/privacy" className="s-list-row">
        <span>Privacy policy</span>
        <span className="s-list-row__chevron">›</span>
      </Link>
      <div className="s-divider" />

      {!showDeleteConfirm && (
        <button
          className="s-btn s-btn--danger"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete account
        </button>
      )}

      {showDeleteConfirm && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            marginTop: "10px",
          }}
        >
          <p style={{ color: "#856404", marginBottom: "10px" }}>
            ⚠️ Enter your password to permanently delete your account:
          </p>
          <input
            type="password"
            className="s-input"
            placeholder="Enter your password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              className="s-btn s-btn--danger"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Confirm deletion"}
            </button>
            <button
              className="s-btn s-btn--ghost"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletePassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}