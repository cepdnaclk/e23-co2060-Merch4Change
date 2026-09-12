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
  const [bio, setBio] = useState(profileData.profileBio || profileData.bio || "");
  const [website, setWebsite] = useState(profileData.userLink || profileData.website || "");
  const [location, setLocation] = useState(profileData.location || "");
  const [email, setEmail] = useState(profileData.email || "");
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
    setBio(profileData.profileBio || profileData.bio || "");
    setWebsite(profileData.userLink || profileData.website || "");
    setLocation(profileData.location || "");
    setEmail(profileData.email || "");

    const resolved = profileData.profileImageUrl || profileData.avatarUrl || "";
    setAvatarUrl(resolved);
    setImageError(false);
  }, [profileData]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts.shift() || "";
      const lastName = parts.join(" ") || "";

      const body = {
        firstName,
        lastName,
        name: fullName.trim(),
        userName,
        profileBio: bio,
        bio,
        userLink: website,
        website,
        location,
        email,
      };

      const res = await apiClient.put("/api/v1/settings/profile", body).catch(() => {
        return apiClient.put("/api/v1/profile/me", body);
      });

      const data = res.data;
      if (!data?.success) throw new Error(data?.message || "Failed to update profile");

      if (data?.success && data.data?.user) {
        const updated = data.data.user;
        onUpdate(updated);
        setUserName(updated.userName || userName);
        setFullName(`${updated.firstName || ""} ${updated.lastName || ""}`.trim());
        setBio(updated.profileBio || updated.bio || bio);
        setWebsite(updated.userLink || updated.website || website);
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
        <input
          className="s-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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