import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient, { setAccessToken } from "../../../api/apiClient.js";
import { useTheme } from "../../../context/ThemeContext";
import { useI18n } from "../../../i18n/I18nContext";
import "./SettingsSection.css";

// Re-export ProfileSection from ProfileSection.jsx to maintain single source of truth
export { default as ProfileSection } from "./ProfileSection";

function ToastBanner({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`s-toast s-toast--${toast.type}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  );
}

function Toggle({ label, desc, badge, checked, onChange, disabled }) {
  return (
    <div className={`s-toggle-row ${disabled ? "s-toggle-row--disabled" : ""}`}>
      <div className="s-toggle-row__info">
        <span className="s-toggle-row__label">
          {label}
          {badge && <span className="s-toggle-row__badge">{badge}</span>}
        </span>
        {desc && <span className="s-toggle-row__desc">{desc}</span>}
      </div>
      <label className="s-switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <span className="s-switch__slider" />
      </label>
    </div>
  );
}

// ==========================================
// SECURITY SECTION
// ==========================================
export function SecuritySection({ profileData, onUpdate }) {
  const [twoFA, setTwoFA] = useState(profileData?.twoFactorEnabled ?? false);
  const [alerts, setAlerts] = useState(profileData?.loginActivityAlerts ?? true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingToggle, setSavingToggle] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  // ----- 2FA enable flow (OTP sent to the account's email) -----
  const [twoFAStep, setTwoFAStep] = useState("idle"); // idle | awaiting-otp
  const [enableOtp, setEnableOtp] = useState("");
  const [confirmingOtp, setConfirmingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // ----- 2FA disable flow (requires current password) -----
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  useEffect(() => {
    if (profileData) {
      if (profileData.twoFactorEnabled !== undefined) {
        setTwoFA(profileData.twoFactorEnabled);
      }
      if (profileData.loginActivityAlerts !== undefined) {
        setAlerts(profileData.loginActivityAlerts);
      }
    }
  }, [profileData]);

  const handleAlertsToggle = async () => {
    const prevAlerts = alerts;
    const value = !alerts;
    setAlerts(value);
    setSavingToggle(true);

    try {
      const res = await apiClient.put("/api/v1/settings/security", {
        loginActivityAlerts: value,
      });
      if (res.data?.success) {
        onUpdate?.({ ...profileData, loginActivityAlerts: value });
        showToast("Security settings updated!", "success");
      }
    } catch (err) {
      setAlerts(prevAlerts);
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSavingToggle(false);
    }
  };

  // Turning the 2FA switch ON sends an OTP instead of flipping it directly.
  const handleTwoFAToggleClick = () => {
    if (twoFA) {
      setShowDisableConfirm(true);
      return;
    }
    handleRequestEnable2FA();
  };

  const handleRequestEnable2FA = async () => {
    setSavingToggle(true);
    try {
      const res = await apiClient.post("/api/v1/settings/security/2fa/request-enable");
      if (res.data?.success) {
        setTwoFAStep("awaiting-otp");
        showToast("Verification code sent to your email.", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSavingToggle(false);
    }
  };

  const handleResendEnable2FA = async () => {
    setResendingOtp(true);
    try {
      const res = await apiClient.post("/api/v1/settings/security/2fa/request-enable");
      if (res.data?.success) {
        showToast("A new code has been sent.", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleConfirmEnable2FA = async () => {
    if (!enableOtp.trim()) {
      showToast("Please enter the verification code.", "error");
      return;
    }
    setConfirmingOtp(true);
    try {
      const res = await apiClient.post("/api/v1/settings/security/2fa/verify-enable", {
        otp: enableOtp.trim(),
      });
      if (res.data?.success) {
        setTwoFA(true);
        setTwoFAStep("idle");
        setEnableOtp("");
        onUpdate?.({ ...profileData, twoFactorEnabled: true });
        showToast("Two-factor authentication enabled!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setConfirmingOtp(false);
    }
  };

  const handleCancelEnable2FA = () => {
    setTwoFAStep("idle");
    setEnableOtp("");
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      showToast("Please enter your password to confirm.", "error");
      return;
    }
    setDisabling(true);
    try {
      const res = await apiClient.post("/api/v1/settings/security/2fa/disable", {
        currentPassword: disablePassword,
      });
      if (res.data?.success) {
        setTwoFA(false);
        setShowDisableConfirm(false);
        setDisablePassword("");
        onUpdate?.({ ...profileData, twoFactorEnabled: false });
        showToast("Two-factor authentication disabled.", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setDisabling(false);
    }
  };

  const handlePasswordChange = async () => {
    setSavingPassword(true);
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast("All password fields are required", "error");
        setSavingPassword(false);
        return;
      }

      const res = await apiClient.post("/api/v1/settings/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        if (res.data?.data?.accessToken) {
          setAccessToken(res.data.data.accessToken);
        }
        showToast("Password changed successfully!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
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
        desc="Require a code sent to your email when logging in"
        badge="Recommended"
        checked={twoFA}
        disabled={savingToggle || twoFAStep === "awaiting-otp"}
        onChange={handleTwoFAToggleClick}
      />

      {twoFAStep === "awaiting-otp" && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f0f6ff",
            border: "1px solid #b6d4fe",
            borderRadius: "4px",
            marginTop: "-6px",
            marginBottom: "18px",
          }}
        >
          <p style={{ marginBottom: "10px" }}>
            Enter the verification code we just emailed you to finish turning on 2FA.
          </p>
          <input
            className="s-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={enableOtp}
            onChange={(e) => setEnableOtp(e.target.value.replace(/\D/g, ""))}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="s-btn s-btn--primary"
              onClick={handleConfirmEnable2FA}
              disabled={confirmingOtp}
            >
              {confirmingOtp ? "Confirming..." : "Confirm code"}
            </button>
            <button
              className="s-btn s-btn--ghost"
              onClick={handleResendEnable2FA}
              disabled={resendingOtp}
            >
              {resendingOtp ? "Resending..." : "Resend code"}
            </button>
            <button className="s-btn s-btn--ghost" onClick={handleCancelEnable2FA}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDisableConfirm && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "4px",
            marginTop: "-6px",
            marginBottom: "18px",
          }}
        >
          <p style={{ color: "#856404", marginBottom: "10px" }}>
            Enter your password to turn off two-factor authentication:
          </p>
          <input
            type="password"
            className="s-input"
            placeholder="Enter your password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
          />
          <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
            <button
              className="s-btn s-btn--danger"
              onClick={handleDisable2FA}
              disabled={disabling}
            >
              {disabling ? "Disabling..." : "Disable 2FA"}
            </button>
            <button
              className="s-btn s-btn--ghost"
              onClick={() => {
                setShowDisableConfirm(false);
                setDisablePassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Toggle
        label="Login activity alerts"
        desc="Get notified when your account is accessed from a new location"
        checked={alerts}
        disabled={savingToggle}
        onChange={handleAlertsToggle}
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

// ==========================================
// PRIVACY SECTION
// ==========================================
export function PrivacySection({ profileData, onUpdate }) {
  const [s, setS] = useState({
    private: profileData?.isPrivate ?? false,
    activity: profileData?.showActivityStatus ?? true,
    messages: profileData?.allowMessageRequests ?? true,
    receipts: profileData?.hideReadReceipts ?? false,
    commentPermission: profileData?.commentPermission ?? "following",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  useEffect(() => {
    if (profileData) {
      setS({
        private: profileData.isPrivate ?? false,
        activity: profileData.showActivityStatus ?? true,
        messages: profileData.allowMessageRequests ?? true,
        receipts: profileData.hideReadReceipts ?? false,
        commentPermission: profileData.commentPermission ?? "following",
      });
    }
  }, [profileData]);

  const tog = (k) => {
    const prev = s[k];
    const newState = { ...s, [k]: !prev };
    setS(newState);
    handleSave(newState, k, prev);
  };

  const handleCommentPermissionChange = (e) => {
    const prev = s.commentPermission;
    const newState = { ...s, commentPermission: e.target.value };
    setS(newState);
    handleSave(newState, "commentPermission", prev);
  };

  const handleSave = async (stateData, rollbackKey, rollbackVal) => {
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
        onUpdate?.({
          ...profileData,
          isPrivate: stateData.private,
          showActivityStatus: stateData.activity,
          allowMessageRequests: stateData.messages,
          hideReadReceipts: stateData.receipts,
          commentPermission: stateData.commentPermission,
        });
        showToast("Privacy settings updated!", "success");
      }
    } catch (err) {
      if (rollbackKey) {
        setS((prev) => ({ ...prev, [rollbackKey]: rollbackVal }));
      }
      showToast(err.response?.data?.message || "Error updating privacy", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
      <h2 className="s-section__title">Privacy</h2>
      <p className="s-section__desc">Control who can see your content and interact with you.</p>
      <Toggle
        label="Private account"
        desc="Only approved followers can see your posts"
        checked={s.private}
        disabled={saving}
        onChange={() => tog("private")}
      />
      <Toggle
        label="Show activity status"
        desc="Let people see when you were last active"
        checked={s.activity}
        disabled={saving}
        onChange={() => tog("activity")}
      />
      <Toggle
        label="Allow message requests"
        desc="Let people you don't follow send message requests"
        checked={s.messages}
        disabled={saving}
        onChange={() => tog("messages")}
      />
      <Toggle
        label="Hide read receipts"
        desc="Others won't know when you've read their messages"
        checked={s.receipts}
        disabled={saving}
        onChange={() => tog("receipts")}
      />
      <div className="s-divider" />
      <div className="s-row">
        <label className="s-label">Who can comment on your posts</label>
        <select
          className="s-input s-input--select"
          value={s.commentPermission}
          onChange={handleCommentPermissionChange}
          disabled={saving}
        >
          <option value="everyone">Everyone</option>
          <option value="followers">Followers only</option>
          <option value="following">People you follow</option>
          <option value="none">No one</option>
        </select>
      </div>
    </div>
  );
}

// ==========================================
// NOTIFICATIONS SECTION
// ==========================================
export function NotificationsSection({ profileData, onUpdate }) {
  const [s, setS] = useState({
    likes: profileData?.notifyOnLikes ?? true,
    comments: profileData?.notifyOnComments ?? true,
    followers: profileData?.notifyOnNewFollowers ?? true,
    dms: profileData?.notifyOnDMs ?? true,
    email: profileData?.emailNotifications ?? false,
  });
  const [savingKey, setSavingKey] = useState(null);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  useEffect(() => {
    if (profileData) {
      setS({
        likes: profileData.notifyOnLikes ?? true,
        comments: profileData.notifyOnComments ?? true,
        followers: profileData.notifyOnNewFollowers ?? true,
        dms: profileData.notifyOnDMs ?? true,
        email: profileData.emailNotifications ?? false,
      });
    }
  }, [profileData]);

  const tog = async (k) => {
    const previousValue = s[k];
    const nextValue = !previousValue;

    const updatedState = { ...s, [k]: nextValue };
    setS(updatedState);
    setSavingKey(k);

    try {
      const res = await apiClient.put("/api/v1/settings/notifications", {
        notifyOnLikes: updatedState.likes,
        notifyOnComments: updatedState.comments,
        notifyOnNewFollowers: updatedState.followers,
        notifyOnDMs: updatedState.dms,
        emailNotifications: updatedState.email,
      });

      if (res.data?.success) {
        onUpdate?.({
          ...profileData,
          notifyOnLikes: updatedState.likes,
          notifyOnComments: updatedState.comments,
          notifyOnNewFollowers: updatedState.followers,
          notifyOnDMs: updatedState.dms,
          emailNotifications: updatedState.email,
        });
        showToast("Notification preference updated!", "success");
      }
    } catch (err) {
      setS((prev) => ({ ...prev, [k]: previousValue }));
      showToast(err.response?.data?.message || "Failed to update notification. Reverted.", "error");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
      <h2 className="s-section__title">Notifications</h2>
      <p className="s-section__desc">Choose what you get notified about.</p>

      <Toggle
        label="Likes"
        desc="When someone likes your posts"
        checked={s.likes}
        disabled={savingKey === "likes"}
        onChange={() => tog("likes")}
      />
      <Toggle
        label="Comments"
        desc="When someone comments on your posts"
        checked={s.comments}
        disabled={savingKey === "comments"}
        onChange={() => tog("comments")}
      />
      <Toggle
        label="New followers"
        desc="When someone starts following you"
        checked={s.followers}
        disabled={savingKey === "followers"}
        onChange={() => tog("followers")}
      />
      <Toggle
        label="Direct messages"
        desc="When you receive a new message"
        checked={s.dms}
        disabled={savingKey === "dms"}
        onChange={() => tog("dms")}
      />
      <Toggle
        label="Email notifications"
        desc="Receive a summary of activity to your email"
        checked={s.email}
        disabled={savingKey === "email"}
        onChange={() => tog("email")}
      />
    </div>
  );
}

// ==========================================
// APPEARANCE SECTION
// ==========================================
export function AppearanceSection({ profileData, onUpdate }) {
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [appTheme, setAppTheme] = useState(profileData?.appTheme ?? theme);
  const [localFontSize, setLocalFontSize] = useState(profileData?.fontSize ?? fontSize);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  // Sync from parent whenever profileData is refreshed (e.g. initial load)
  useEffect(() => {
    if (profileData?.appTheme) setAppTheme(profileData.appTheme);
    if (profileData?.fontSize) setLocalFontSize(profileData.fontSize);
  }, [profileData]);

  const handleThemeChange = (e) => {
    const next = e.target.value;
    setAppTheme(next);
    // ThemeContext.setTheme auto-persists via PUT /api/v1/settings/appearance
    setTheme(next);

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

    onUpdate?.({ ...profileData, appTheme: next });
  };

  const handleFontSizeChange = (e) => {
    const next = e.target.value;
    setLocalFontSize(next);
    // ThemeContext.setFontSize auto-persists via PUT /api/v1/settings/appearance
    setFontSize(next);
    onUpdate?.({ ...profileData, fontSize: next });
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
      <h2 className="s-section__title">Appearance</h2>
      <p className="s-section__desc">Customize how the app looks for you.</p>
      <div className="s-row">
        <label className="s-label">Theme</label>
        <select
          className="s-input s-input--select"
          value={appTheme}
          onChange={handleThemeChange}
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
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <p className="s-section__desc" style={{ margin: "-8px 0 18px" }}>
        ✓ Changes are saved automatically.
      </p>
    </div>
  );
}

// ==========================================
// LANGUAGE SECTION
// ==========================================
export function LanguageSection({ profileData, onUpdate }) {
  const { language, setLanguage, t, languages } = useI18n();
  // Local draft value so the dropdown can be changed without affecting the
  // live app until the user hits Save (matches the rest of Settings' pattern).
  const [appLanguage, setAppLanguage] = useState(profileData?.appLanguage ?? language);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  // Sync from parent whenever profileData is refreshed (e.g. initial load)
  useEffect(() => {
    if (profileData?.appLanguage) {
      setAppLanguage(profileData.appLanguage);
      setLanguage(profileData.appLanguage);
    }
  }, [profileData, setLanguage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/v1/settings/language", {
        appLanguage,
      });

      if (res.data?.success) {
        // Apply immediately across the whole app (nav, sidebar, settings, etc.)
        setLanguage(appLanguage);
        onUpdate?.({ ...profileData, appLanguage });
        showToast(t("settings.language.updateSuccess"), "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
      <h2 className="s-section__title">{t("settings.language.title")}</h2>
      <p className="s-section__desc">{t("settings.language.description")}</p>
      <div className="s-row">
        <label className="s-label">{t("settings.language.appLanguage")}</label>
        <select
          className="s-input s-input--select"
          value={appLanguage}
          onChange={(e) => setAppLanguage(e.target.value)}
          disabled={saving}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div className="s-divider" />
      <button className="s-btn s-btn--primary" onClick={handleSave} disabled={saving}>
        {saving ? t("common.saving") : t("common.save")}
      </button>
    </div>
  );
}


// ==========================================
// HELP & SUPPORT SECTION
// ==========================================
export function HelpSection() {
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast("Please enter your password to confirm deletion.", "error");
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
        showToast("Account deleted. Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 1200);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
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