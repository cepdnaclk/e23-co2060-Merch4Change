import React, { useEffect, useState, useRef } from "react";
import "./SettingsSection.css";
import apiClient from "../../../api/apiClient";

function ToastBanner({ toast }) {
  if (!toast.show) return null;
  return (
    <div className={`s-toast s-toast--${toast.type}`} role="status" aria-live="polite">
      {toast.text}
    </div>
  );
}

// Convert relative image paths to full backend URLs
const resolveImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const backendBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${backendBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};

function ProfileSection({ profileData = {}, onUpdate = () => {} }) {
  const [userName, setUserName] = useState(profileData.userName || "");
  const [fullName, setFullName] = useState(
    `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim()
  );
  const [bio, setBio] = useState(profileData.profileBio || "");
  const [website, setWebsite] = useState(profileData.userLink || "");
  const [location, setLocation] = useState(profileData.location || "");
  const [email, setEmail] = useState(profileData.email || "");

  // ── Email change (OTP re-verification) ──────────────────────────────
  const [emailEditing, setEmailEditing] = useState(false); // shows the new-email + password form
  const [emailStep, setEmailStep] = useState("form"); // "form" | "otp"
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [pendingEmail, setPendingEmail] = useState("");
  const [emailRequesting, setEmailRequesting] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailResending, setEmailResending] = useState(false);
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const emailOtpRefs = useRef([]);

  const [avatarUrl, setAvatarUrl] = useState(
    profileData.profileImageUrl || profileData.avatarUrl || ""
  );
  const [imageError, setImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });
  const fileInputRef = useRef(null);

  const showToast = (text, type = "info") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 3500);
  };

  useEffect(() => {
    setUserName(profileData.userName || "");
    setFullName(`${profileData.firstName || ""} ${profileData.lastName || ""}`.trim());
    setBio(profileData.profileBio || "");
    setWebsite(profileData.userLink || "");
    setLocation(profileData.location || "");
    setEmail(profileData.email || "");

    const resolved = profileData.profileImageUrl || profileData.avatarUrl || "";
    setAvatarUrl(resolved);
    setImageError(false);
  }, [profileData]);

  useEffect(() => {
    let interval;
    if (emailResendTimer > 0) {
      interval = setInterval(() => setEmailResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailResendTimer]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts.shift() || "";
      const lastName = parts.join(" ") || "";

      // Note: email is deliberately excluded — it's changed via its own
      // OTP-verified flow below, never through this general save.
      const body = {
        firstName,
        lastName,
        name: fullName.trim(),
        userName,
        profileBio: bio,
        userLink: website,
        location,
      };

      const res = await apiClient.put("/api/v1/settings/profile", body);

      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to update profile");

      if (data?.success && data.data?.user) {
        const updated = data.data.user;
        onUpdate(updated);
        setUserName(updated.userName || userName);
        setFullName(`${updated.firstName || ""} ${updated.lastName || ""}`.trim());
        setBio(updated.profileBio || bio);
        setWebsite(updated.userLink || website);
        setLocation(updated.location || location);
        setEmail(updated.email || email);
        showToast("Profile settings updated successfully!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Unable to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);

      const res = await apiClient.put("/api/v1/settings/profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to upload image");

      const updated = data.data?.user;
      if (updated) {
        onUpdate(updated);
        const newUrl = updated.profileImageUrl || updated.avatarUrl || "";
        setAvatarUrl(newUrl);
        setImageError(false);
        showToast("Profile photo updated successfully!", "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Unable to upload photo", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const resetEmailFlow = () => {
    setEmailEditing(false);
    setEmailStep("form");
    setNewEmail("");
    setEmailPassword("");
    setEmailOtp(["", "", "", "", "", ""]);
    setPendingEmail("");
    setEmailResendTimer(0);
  };

  const handleRequestEmailChange = async (e) => {
    if (e) e.preventDefault();
    if (!newEmail || !emailPassword) {
      showToast("Enter the new email and your current password", "error");
      return;
    }
    setEmailRequesting(true);
    try {
      const res = await apiClient.post("/api/v1/settings/email/request-change", {
        newEmail,
        currentPassword: emailPassword,
      });
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to request email change");

      setPendingEmail(data.data?.pendingEmail || newEmail);
      setEmailStep("otp");
      setEmailResendTimer(data.data?.nextCooldownSeconds || 60);
      showToast("A verification code has been sent to your new email.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Unable to start email change", "error");
    } finally {
      setEmailRequesting(false);
    }
  };

  const handleEmailOtpChange = (e, index) => {
    const value = e.target.value;
    if (value && isNaN(value)) return;
    const next = [...emailOtp];
    next[index] = value.slice(-1);
    setEmailOtp(next);
    if (value && index < 5 && emailOtpRefs.current[index + 1]) {
      emailOtpRefs.current[index + 1].focus();
    }
  };

  const handleEmailOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0 && emailOtpRefs.current[index - 1]) {
      emailOtpRefs.current[index - 1].focus();
    }
  };

  const handleVerifyEmailChange = async (e) => {
    if (e) e.preventDefault();
    const code = emailOtp.join("");
    if (code.length !== 6) {
      showToast("Enter the 6-digit code", "error");
      return;
    }
    setEmailVerifying(true);
    try {
      const res = await apiClient.post("/api/v1/settings/email/verify", { otp: code });
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Verification failed");

      const updated = data.data?.user;
      if (updated) {
        onUpdate(updated);
        setEmail(updated.email || pendingEmail);
      }
      showToast("Email address updated successfully!", "success");
      resetEmailFlow();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Invalid or expired code", "error");
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailResendTimer > 0 || emailResending) return;
    setEmailResending(true);
    try {
      const res = await apiClient.post("/api/v1/settings/email/resend-otp");
      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to resend code");
      setEmailResendTimer(data.data?.nextCooldownSeconds || 60);
      showToast("A new code has been sent.", "success");
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.error?.details?.remainingSeconds) {
        setEmailResendTimer(err.response.data.error.details.remainingSeconds);
      }
      showToast(err.response?.data?.message || err.message || "Unable to resend code", "error");
    } finally {
      setEmailResending(false);
    }
  };

  const resolvedSrc = resolveImageUrl(avatarUrl);

  return (
    <div className="s-section">
      <ToastBanner toast={toast} />
      <h2 className="s-section__title">Edit profile</h2>
      <p className="s-section__desc">Update your personal information and how it appears to others.</p>

      <div className="s-avatar-row">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />
        {resolvedSrc && !imageError ? (
          <img
            src={resolvedSrc}
            alt={userName || "avatar"}
            className="s-avatar"
            style={{ objectFit: "cover" }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="s-avatar">{(userName?.[0] || "U").toUpperCase()}</div>
        )}
        <div className="s-avatar-info">
          <span className="s-avatar-name">{userName || "unknown"}</span>
          <span className="s-avatar-sub">
            {profileData.accountType === "organization" ? "Organization Account" : "Member"}
          </span>
        </div>
        <button
          className="s-btn s-btn--ghost"
          onClick={handlePhotoClick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Change photo"}
        </button>
      </div>

      <div className="s-row">
        <label className="s-label">Username</label>
        <input
          className="s-input"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Full name</label>
        <input
          className="s-input"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Bio</label>
        <textarea
          className="s-input"
          rows="3"
          placeholder="Write something about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Location</label>
        <input
          className="s-input"
          type="text"
          placeholder="e.g. Colombo, Sri Lanka"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Website</label>
        <input
          className="s-input"
          type="url"
          placeholder="https://yourwebsite.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="s-row">
        <label className="s-label">Email</label>
        {!emailEditing ? (
          <div className="s-email-display">
            <span className="s-email-current">{email}</span>
            <button
              type="button"
              className="s-btn s-btn--ghost"
              onClick={() => setEmailEditing(true)}
            >
              Change email
            </button>
          </div>
        ) : emailStep === "form" ? (
          <div className="s-email-change-form">
            <input
              className="s-input"
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              className="s-input"
              type="password"
              placeholder="Current password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
            />
            <p className="s-section__desc">
              We'll send a 6-digit code to the new address to confirm it's yours.
            </p>
            <div className="s-email-change-actions">
              <button
                type="button"
                className="s-btn s-btn--primary"
                onClick={handleRequestEmailChange}
                disabled={emailRequesting}
              >
                {emailRequesting ? "Sending code..." : "Send code"}
              </button>
              <button type="button" className="s-btn s-btn--ghost" onClick={resetEmailFlow}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="s-email-otp-form">
            <p className="s-section__desc">
              Enter the code sent to <strong>{pendingEmail}</strong>
            </p>
            <div className="otp-inputs-container">
              {emailOtp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleEmailOtpChange(e, index)}
                  onKeyDown={(e) => handleEmailOtpKeyDown(e, index)}
                  ref={(el) => (emailOtpRefs.current[index] = el)}
                  className="otp-input"
                />
              ))}
            </div>
            <div className="s-email-change-actions">
              <button
                type="button"
                className="s-btn s-btn--primary"
                onClick={handleVerifyEmailChange}
                disabled={emailVerifying}
              >
                {emailVerifying ? "Verifying..." : "Confirm"}
              </button>
              <button type="button" className="s-btn s-btn--ghost" onClick={resetEmailFlow}>
                Cancel
              </button>
            </div>
            <p className="s-email-resend">
              Didn't get it?{" "}
              {emailResendTimer > 0 ? (
                <span>Resend in {emailResendTimer}s</span>
              ) : (
                <button
                  type="button"
                  className="s-btn s-btn--link"
                  onClick={handleResendEmailOtp}
                  disabled={emailResending}
                >
                  {emailResending ? "Sending..." : "Resend code"}
                </button>
              )}
            </p>
          </div>
        )}
      </div>
      <div className="s-divider" />
      <button
        className="s-btn s-btn--primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </div>
  );
}

export default ProfileSection;