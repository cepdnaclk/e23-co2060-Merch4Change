const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9._]+$/;
const passwordStrongPattern = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const urlPattern = /^https?:\/\/.+/i;

const trimIfString = (value) => (typeof value === "string" ? value.trim() : value);

// ==========================================
// PROFILE SETTINGS
// ==========================================
export const validateProfileSettingsBody = (payload = {}) => {
  const normalized = {
    ...payload,
    name: trimIfString(payload.name),
    firstName: trimIfString(payload.firstName),
    lastName: trimIfString(payload.lastName),
    userName: trimIfString(payload.userName),
    profileBio: trimIfString(payload.profileBio),
    userLink: trimIfString(payload.userLink),
    location: trimIfString(payload.location),
  };

  const errors = [];

  if (normalized.firstName !== undefined) {
    if (typeof normalized.firstName !== "string" || normalized.firstName.length < 2 || normalized.firstName.length > 120) {
      errors.push("firstName must be a string between 2 and 120 characters.");
    }
  }

  if (normalized.lastName !== undefined) {
    if (typeof normalized.lastName !== "string" || normalized.lastName.length < 2 || normalized.lastName.length > 120) {
      errors.push("lastName must be a string between 2 and 120 characters.");
    }
  }

  if (normalized.userName !== undefined) {
    if (typeof normalized.userName !== "string" || normalized.userName.length < 2 || normalized.userName.length > 30) {
      errors.push("userName must be a string between 2 and 30 characters.");
    } else if (!usernamePattern.test(normalized.userName)) {
      errors.push("userName can only contain letters, numbers, periods, and underscores.");
    }
  }

  if (normalized.profileBio !== undefined && normalized.profileBio.length > 500) {
    errors.push("profileBio must not exceed 500 characters.");
  }

  if (normalized.userLink && !urlPattern.test(normalized.userLink)) {
    errors.push("userLink must be a valid URL starting with http:// or https://.");
  }

  return { value: normalized, errors };
};

// ==========================================
// SECURITY SETTINGS (toggles)
// ==========================================
export const validateSecuritySettingsBody = (payload = {}) => {
  const errors = [];

  if (payload.twoFactorEnabled !== undefined && typeof payload.twoFactorEnabled !== "boolean") {
    errors.push("twoFactorEnabled must be a boolean.");
  }
  if (payload.loginActivityAlerts !== undefined && typeof payload.loginActivityAlerts !== "boolean") {
    errors.push("loginActivityAlerts must be a boolean.");
  }

  return { value: payload, errors };
};

// ==========================================
// REQUEST EMAIL CHANGE
// ==========================================
export const validateRequestEmailChangeBody = (payload = {}) => {
  const normalized = {
    newEmail: typeof payload.newEmail === "string" ? payload.newEmail.toLowerCase().trim() : payload.newEmail,
    currentPassword: payload.currentPassword,
  };

  const errors = [];

  if (!normalized.newEmail || typeof normalized.newEmail !== "string" || !emailPattern.test(normalized.newEmail)) {
    errors.push("newEmail must be a valid email address.");
  }

  if (!normalized.currentPassword || typeof normalized.currentPassword !== "string") {
    errors.push("currentPassword is required.");
  }

  return { value: normalized, errors };
};

// ==========================================
// VERIFY EMAIL CHANGE
// ==========================================
export const validateVerifyEmailChangeBody = (payload = {}) => {
  const normalized = {
    otp: typeof payload.otp === "string" ? payload.otp.trim() : payload.otp,
    otpCode: typeof payload.otpCode === "string" ? payload.otpCode.trim() : payload.otpCode,
  };

  const errors = [];

  if (!normalized.otp && !normalized.otpCode) {
    errors.push("otp is required.");
  }

  return { value: normalized, errors };
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const validateChangePasswordBody = (payload = {}) => {
  const normalized = {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  };

  const errors = [];

  if (!normalized.currentPassword || typeof normalized.currentPassword !== "string") {
    errors.push("currentPassword is required and must be a string.");
  }

  if (!normalized.newPassword || typeof normalized.newPassword !== "string") {
    errors.push("newPassword is required and must be a string.");
  } else if (normalized.newPassword.length < 8) {
    errors.push("newPassword must be at least 8 characters.");
  } else if (normalized.newPassword.length > 128) {
    errors.push("newPassword must not exceed 128 characters.");
  } else if (!passwordStrongPattern.test(normalized.newPassword)) {
    errors.push("newPassword must contain at least one letter and one number.");
  }

  if (!normalized.confirmPassword || typeof normalized.confirmPassword !== "string") {
    errors.push("confirmPassword is required and must be a string.");
  } else if (normalized.newPassword && normalized.confirmPassword !== normalized.newPassword) {
    errors.push("confirmPassword must match newPassword.");
  }

  if (
    normalized.currentPassword &&
    normalized.newPassword &&
    normalized.currentPassword === normalized.newPassword
  ) {
    errors.push("newPassword must be different from currentPassword.");
  }

  return { value: normalized, errors };
};

// ==========================================
// PRIVACY SETTINGS
// ==========================================
const COMMENT_PERMISSIONS = ["everyone", "followers", "following", "none"];

export const validatePrivacySettingsBody = (payload = {}) => {
  const errors = [];

  if (payload.isPrivate !== undefined && typeof payload.isPrivate !== "boolean") {
    errors.push("isPrivate must be a boolean.");
  }
  if (payload.showActivityStatus !== undefined && typeof payload.showActivityStatus !== "boolean") {
    errors.push("showActivityStatus must be a boolean.");
  }
  if (payload.allowMessageRequests !== undefined && typeof payload.allowMessageRequests !== "boolean") {
    errors.push("allowMessageRequests must be a boolean.");
  }
  if (payload.hideReadReceipts !== undefined && typeof payload.hideReadReceipts !== "boolean") {
    errors.push("hideReadReceipts must be a boolean.");
  }
  if (
    payload.commentPermission !== undefined &&
    !COMMENT_PERMISSIONS.includes(payload.commentPermission)
  ) {
    errors.push(`commentPermission must be one of: ${COMMENT_PERMISSIONS.join(", ")}.`);
  }

  return { value: payload, errors };
};

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================
export const validateNotificationSettingsBody = (payload = {}) => {
  const errors = [];
  const booleanFields = [
    "notifyOnLikes",
    "notifyOnComments",
    "notifyOnNewFollowers",
    "notifyOnDMs",
    "emailNotifications",
  ];

  booleanFields.forEach((field) => {
    if (payload[field] !== undefined && typeof payload[field] !== "boolean") {
      errors.push(`${field} must be a boolean.`);
    }
  });

  return { value: payload, errors };
};

// ==========================================
// APPEARANCE SETTINGS
// ==========================================
const APP_THEMES = ["system", "light", "dark"];
const FONT_SIZES = ["small", "medium", "large"];

export const validateAppearanceSettingsBody = (payload = {}) => {
  const errors = [];

  if (payload.appTheme !== undefined && !APP_THEMES.includes(payload.appTheme)) {
    errors.push(`appTheme must be one of: ${APP_THEMES.join(", ")}.`);
  }
  if (payload.fontSize !== undefined && !FONT_SIZES.includes(payload.fontSize)) {
    errors.push(`fontSize must be one of: ${FONT_SIZES.join(", ")}.`);
  }

  return { value: payload, errors };
};

// ==========================================
// LANGUAGE SETTINGS
// ==========================================
const APP_LANGUAGES = ["en-US", "en-UK", "si", "ta", "es", "fr", "de", "ja"];

export const validateLanguageSettingsBody = (payload = {}) => {
  const errors = [];

  if (!payload.appLanguage || typeof payload.appLanguage !== "string") {
    errors.push("appLanguage is required and must be a string.");
  } else if (!APP_LANGUAGES.includes(payload.appLanguage)) {
    errors.push(`appLanguage must be one of: ${APP_LANGUAGES.join(", ")}.`);
  }

  return { value: payload, errors };
};

// ==========================================
// DELETE ACCOUNT
// ==========================================
export const validateDeleteAccountBody = (payload = {}) => {
  const errors = [];

  if (!payload.password || typeof payload.password !== "string") {
    errors.push("password is required and must be a string.");
  }

  return { value: payload, errors };
};