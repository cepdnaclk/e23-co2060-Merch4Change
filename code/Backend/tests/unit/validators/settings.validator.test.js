import test from "node:test";
import assert from "node:assert/strict";

import {
  validateProfileSettingsBody,
  validateSecuritySettingsBody,
  validateChangePasswordBody,
  validatePrivacySettingsBody,
  validateNotificationSettingsBody,
  validateAppearanceSettingsBody,
  validateLanguageSettingsBody,
  validateDeleteAccountBody,
} from "../../../src/validators/settings.validator.js";

// ==========================================
// PROFILE SETTINGS
// ==========================================
test("validateProfileSettingsBody accepts a valid payload and trims/normalizes fields", () => {
  const result = validateProfileSettingsBody({
    firstName: "  Jane  ",
    lastName: "  Doe  ",
    userName: "  jane_doe.99  ",
    bio: "  Loves clean water projects  ",
    profileBio: "  Loves clean water projects  ",
    website: "https://example.com",
    userLink: "https://example.com",
    location: "  Colombo  ",
    email: "  JANE@EXAMPLE.COM  ",
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.value.firstName, "Jane");
  assert.equal(result.value.lastName, "Doe");
  assert.equal(result.value.userName, "jane_doe.99");
  assert.equal(result.value.email, "jane@example.com");
  assert.equal(result.value.location, "Colombo");
});

test("validateProfileSettingsBody allows a partial payload (all fields optional)", () => {
  const result = validateProfileSettingsBody({ bio: "Just updating my bio" });

  assert.deepEqual(result.errors, []);
});

test("validateProfileSettingsBody rejects invalid firstName/lastName length", () => {
  const result = validateProfileSettingsBody({ firstName: "J", lastName: "x".repeat(121) });

  assert.equal(result.errors.some((m) => m.includes("firstName must be a string between 2 and 120")), true);
  assert.equal(result.errors.some((m) => m.includes("lastName must be a string between 2 and 120")), true);
});

test("validateProfileSettingsBody rejects invalid userName characters and length", () => {
  const short = validateProfileSettingsBody({ userName: "a" });
  assert.equal(short.errors.some((m) => m.includes("userName must be a string between 2 and 30")), true);

  const badChars = validateProfileSettingsBody({ userName: "jane doe!" });
  assert.equal(
    badChars.errors.some((m) => m.includes("userName can only contain letters, numbers, periods, and underscores")),
    true
  );
});

test("validateProfileSettingsBody rejects an invalid email", () => {
  const result = validateProfileSettingsBody({ email: "not-an-email" });

  assert.equal(result.errors.some((m) => m.includes("email must be a valid email address")), true);
});

test("validateProfileSettingsBody rejects bio/profileBio over 500 characters", () => {
  const result = validateProfileSettingsBody({
    bio: "x".repeat(501),
    profileBio: "y".repeat(501),
  });

  assert.equal(result.errors.some((m) => m.includes("bio must not exceed 500 characters")), true);
  assert.equal(result.errors.some((m) => m.includes("profileBio must not exceed 500 characters")), true);
});

test("validateProfileSettingsBody rejects website/userLink without http(s) scheme", () => {
  const result = validateProfileSettingsBody({
    website: "example.com",
    userLink: "ftp://example.com",
  });

  assert.equal(result.errors.some((m) => m.includes("website must be a valid URL")), true);
  assert.equal(result.errors.some((m) => m.includes("userLink must be a valid URL")), true);
});

// ==========================================
// SECURITY SETTINGS
// ==========================================
test("validateSecuritySettingsBody accepts valid boolean toggles", () => {
  const result = validateSecuritySettingsBody({ twoFactorEnabled: true, loginActivityAlerts: false });

  assert.deepEqual(result.errors, []);
});

test("validateSecuritySettingsBody accepts an empty payload", () => {
  const result = validateSecuritySettingsBody({});

  assert.deepEqual(result.errors, []);
});

test("validateSecuritySettingsBody rejects non-boolean values", () => {
  const result = validateSecuritySettingsBody({ twoFactorEnabled: "yes", loginActivityAlerts: 1 });

  assert.equal(result.errors.some((m) => m.includes("twoFactorEnabled must be a boolean")), true);
  assert.equal(result.errors.some((m) => m.includes("loginActivityAlerts must be a boolean")), true);
});

// ==========================================
// CHANGE PASSWORD
// ==========================================
test("validateChangePasswordBody accepts a valid password change", () => {
  const result = validateChangePasswordBody({
    currentPassword: "OldPass123",
    newPassword: "NewPass456",
    confirmPassword: "NewPass456",
  });

  assert.deepEqual(result.errors, []);
});

test("validateChangePasswordBody rejects missing fields", () => {
  const result = validateChangePasswordBody({});

  assert.equal(result.errors.some((m) => m.includes("currentPassword is required")), true);
  assert.equal(result.errors.some((m) => m.includes("newPassword is required")), true);
  assert.equal(result.errors.some((m) => m.includes("confirmPassword is required")), true);
});

test("validateChangePasswordBody rejects a newPassword that is too short or too weak", () => {
  const tooShort = validateChangePasswordBody({
    currentPassword: "OldPass123",
    newPassword: "short1",
    confirmPassword: "short1",
  });
  assert.equal(tooShort.errors.some((m) => m.includes("newPassword must be at least 8 characters")), true);

  const noDigits = validateChangePasswordBody({
    currentPassword: "OldPass123",
    newPassword: "onlyletters",
    confirmPassword: "onlyletters",
  });
  assert.equal(
    noDigits.errors.some((m) => m.includes("newPassword must contain at least one letter and one number")),
    true
  );
});

test("validateChangePasswordBody rejects mismatched confirmPassword", () => {
  const result = validateChangePasswordBody({
    currentPassword: "OldPass123",
    newPassword: "NewPass456",
    confirmPassword: "Different789",
  });

  assert.equal(result.errors.some((m) => m.includes("confirmPassword must match newPassword")), true);
});

test("validateChangePasswordBody rejects newPassword equal to currentPassword", () => {
  const result = validateChangePasswordBody({
    currentPassword: "SamePass123",
    newPassword: "SamePass123",
    confirmPassword: "SamePass123",
  });

  assert.equal(result.errors.some((m) => m.includes("newPassword must be different from currentPassword")), true);
});

// ==========================================
// PRIVACY SETTINGS
// ==========================================
test("validatePrivacySettingsBody accepts a valid payload", () => {
  const result = validatePrivacySettingsBody({
    isPrivate: true,
    showActivityStatus: false,
    allowMessageRequests: true,
    hideReadReceipts: false,
    commentPermission: "followers",
  });

  assert.deepEqual(result.errors, []);
});

test("validatePrivacySettingsBody rejects non-boolean toggles", () => {
  const result = validatePrivacySettingsBody({ isPrivate: "true", hideReadReceipts: "no" });

  assert.equal(result.errors.some((m) => m.includes("isPrivate must be a boolean")), true);
  assert.equal(result.errors.some((m) => m.includes("hideReadReceipts must be a boolean")), true);
});

test("validatePrivacySettingsBody rejects an invalid commentPermission", () => {
  const result = validatePrivacySettingsBody({ commentPermission: "nobody" });

  assert.equal(result.errors.some((m) => m.includes("commentPermission must be one of")), true);
});

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================
test("validateNotificationSettingsBody accepts valid boolean toggles", () => {
  const result = validateNotificationSettingsBody({
    notifyOnLikes: true,
    notifyOnComments: false,
    notifyOnNewFollowers: true,
    notifyOnDMs: false,
    emailNotifications: true,
  });

  assert.deepEqual(result.errors, []);
});

test("validateNotificationSettingsBody rejects non-boolean fields", () => {
  const result = validateNotificationSettingsBody({ notifyOnLikes: "yes", emailNotifications: 0 });

  assert.equal(result.errors.some((m) => m.includes("notifyOnLikes must be a boolean")), true);
  assert.equal(result.errors.some((m) => m.includes("emailNotifications must be a boolean")), true);
});

// ==========================================
// APPEARANCE SETTINGS
// ==========================================
test("validateAppearanceSettingsBody accepts valid theme and font size", () => {
  const result = validateAppearanceSettingsBody({ appTheme: "dark", fontSize: "large" });

  assert.deepEqual(result.errors, []);
});

test("validateAppearanceSettingsBody rejects invalid theme and font size", () => {
  const result = validateAppearanceSettingsBody({ appTheme: "neon", fontSize: "huge" });

  assert.equal(result.errors.some((m) => m.includes("appTheme must be one of")), true);
  assert.equal(result.errors.some((m) => m.includes("fontSize must be one of")), true);
});

// ==========================================
// LANGUAGE SETTINGS
// ==========================================
test("validateLanguageSettingsBody accepts a supported language", () => {
  const result = validateLanguageSettingsBody({ appLanguage: "si" });

  assert.deepEqual(result.errors, []);
});

test("validateLanguageSettingsBody rejects a missing appLanguage", () => {
  const result = validateLanguageSettingsBody({});

  assert.equal(result.errors.some((m) => m.includes("appLanguage is required")), true);
});

test("validateLanguageSettingsBody rejects an unsupported appLanguage", () => {
  const result = validateLanguageSettingsBody({ appLanguage: "xx" });

  assert.equal(result.errors.some((m) => m.includes("appLanguage must be one of")), true);
});

// ==========================================
// DELETE ACCOUNT
// ==========================================
test("validateDeleteAccountBody accepts a payload with a password", () => {
  const result = validateDeleteAccountBody({ password: "MyPassword123" });

  assert.deepEqual(result.errors, []);
});

test("validateDeleteAccountBody rejects a missing password", () => {
  const result = validateDeleteAccountBody({});

  assert.equal(result.errors.some((m) => m.includes("password is required")), true);
});