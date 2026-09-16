import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

import { createMockResponse } from "../helpers/http.js";
import { mockEmailTransport } from "../helpers/email.js";
import User from "../../../src/models/User.js";
import Post from "../../../src/models/Post.js";
import Like from "../../../src/models/Like.js";
import Follow from "../../../src/models/Follow.js";
import Notification from "../../../src/models/Notification.js";
import Story from "../../../src/models/Story.js";
import StoryCollection from "../../../src/models/StoryCollection.js";
import UserBadge from "../../../src/models/UserBadge.js";
import Product from "../../../src/models/Product.js";
import OtpResendRecord from "../../../src/models/OtpResendRecord.js";
import crypto from "crypto";
import {
  updateProfileSettings,
  requestEmailChange,
  resendEmailChangeOtp,
  verifyEmailChange,
  updateSecuritySettings,
  requestEnable2FA,
  verifyEnable2FA,
  disable2FA,
  changePassword,
  updatePrivacySettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateLanguageSettings,
  deleteAccount,
} from "../../../src/controllers/settings.controller.js";

mockEmailTransport();

const baseReq = (overrides = {}) => ({
  user: { _id: "user1" },
  body: {},
  ...overrides,
});

// ==========================================
// PROFILE SETTINGS
// ==========================================
test("updateProfileSettings only forwards fields that were actually sent", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { firstName: "Jane", profileBio: "Hello" } });
  const res = createMockResponse();

  await updateProfileSettings(req, res, () => {});

  assert.equal(update.mock.calls.length, 1);
  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { firstName: "Jane", profileBio: "Hello" });
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.data.user.firstName, "Jane");
});

test("updateProfileSettings falls back to the avatarUrl string when there is no uploaded file", async (t) => {
  t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { avatarUrl: "https://example.com/pic.jpg" } });
  const res = createMockResponse();

  await updateProfileSettings(req, res, () => {});

  assert.equal(res.payload.data.user.avatarUrl, "https://example.com/pic.jpg");
  assert.equal(res.payload.data.user.profileImageUrl, "https://example.com/pic.jpg");
});

// ==========================================
// SECURITY SETTINGS
// ==========================================
test("updateSecuritySettings only sets fields that are actual booleans", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { loginActivityAlerts: true } });
  const res = createMockResponse();

  await updateSecuritySettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { loginActivityAlerts: true });
  assert.equal(res.statusCode, 200);
});

test("updateSecuritySettings ignores twoFactorEnabled — that's only settable via the OTP-gated 2FA endpoints", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { twoFactorEnabled: true, loginActivityAlerts: "not-a-boolean" } });
  const res = createMockResponse();

  await updateSecuritySettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, {});
  assert.equal(res.statusCode, 200);
});

// ==========================================
// EMAIL CHANGE (OTP re-verification)
// ==========================================
test("requestEmailChange rejects an incorrect current password", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ _id: "user1", email: "old@example.com", password: "hashed-old" }),
  }));
  t.mock.method(bcrypt, "compare", async () => false);

  const req = baseReq({ body: { newEmail: "new@example.com", currentPassword: "wrong" } });
  const res = createMockResponse();

  await assert.rejects(
    () => requestEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "INVALID_PASSWORD");
      return true;
    }
  );
});

test("requestEmailChange rejects when the new email matches the current one", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ _id: "user1", email: "same@example.com", password: "hashed" }),
  }));
  t.mock.method(bcrypt, "compare", async () => true);

  const req = baseReq({ body: { newEmail: "same@example.com", currentPassword: "correct" } });
  const res = createMockResponse();

  await assert.rejects(
    () => requestEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "SAME_EMAIL");
      return true;
    }
  );
});

test("requestEmailChange rejects an email already taken by another account", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ _id: "user1", email: "old@example.com", password: "hashed" }),
  }));
  t.mock.method(bcrypt, "compare", async () => true);
  t.mock.method(User, "findOne", async () => ({ _id: "user2", email: "new@example.com" }));

  const req = baseReq({ body: { newEmail: "new@example.com", currentPassword: "correct" } });
  const res = createMockResponse();

  await assert.rejects(
    () => requestEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "EMAIL_TAKEN");
      return true;
    }
  );
});

test("requestEmailChange rejects a request made before the resend cooldown has elapsed", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ _id: "user1", email: "old@example.com", password: "hashed" }),
  }));
  t.mock.method(bcrypt, "compare", async () => true);
  t.mock.method(User, "findOne", async () => null);
  t.mock.method(OtpResendRecord, "findOne", async () => ({
    email: "new@example.com",
    count: 1, // one request already sent — next one is throttled for 120s
    lastRequestAt: new Date(), // just now
  }));

  const req = baseReq({ body: { newEmail: "new@example.com", currentPassword: "correct" } });
  const res = createMockResponse();

  await assert.rejects(
    () => requestEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "RATE_LIMIT_EXCEEDED");
      assert.equal(err.statusCode, 429);
      return true;
    }
  );
});

test("resendEmailChangeOtp rejects when there is no pending email change", async (t) => {
  t.mock.method(User, "findById", () => ({ select: async () => ({ pendingEmail: null }) }));

  const req = baseReq();
  const res = createMockResponse();

  await assert.rejects(
    () => resendEmailChangeOtp(req, res),
    (err) => {
      assert.equal(err.code, "NO_PENDING_EMAIL_CHANGE");
      return true;
    }
  );
});

test("verifyEmailChange rejects a missing OTP code", async () => {
  const req = baseReq({ body: {} });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("verifyEmailChange rejects when there is no pending email change", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ pendingEmail: null, pendingEmailOtp: null }),
  }));

  const req = baseReq({ body: { otp: "123456" } });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "NO_PENDING_EMAIL_CHANGE");
      return true;
    }
  );
});

test("verifyEmailChange rejects an expired code and clears the pending state", async (t) => {
  const savedUser = {
    pendingEmail: "new@example.com",
    pendingEmailOtp: "111111",
    pendingEmailOtpExpiresAt: new Date(Date.now() - 1000),
    save: async function () {},
  };
  t.mock.method(User, "findById", () => ({ select: async () => savedUser }));

  const req = baseReq({ body: { otp: "111111" } });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "OTP_EXPIRED");
      return true;
    }
  );
  assert.equal(savedUser.pendingEmail, null);
});

test("verifyEmailChange rejects an incorrect code", async (t) => {
  const savedUser = {
    pendingEmail: "new@example.com",
    pendingEmailOtp: "111111",
    pendingEmailOtpExpiresAt: new Date(Date.now() + 60000),
    save: async function () {},
  };
  t.mock.method(User, "findById", () => ({ select: async () => savedUser }));

  const req = baseReq({ body: { otp: "000000" } });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEmailChange(req, res),
    (err) => {
      assert.equal(err.code, "INVALID_OTP");
      return true;
    }
  );
});

test("verifyEmailChange commits the new email on a correct, unexpired code", async (t) => {
  const savedUser = {
    _id: "user1",
    pendingEmail: "new@example.com",
    pendingEmailOtp: crypto.createHash("sha256").update("111111").digest("hex"),
    pendingEmailOtpExpiresAt: new Date(Date.now() + 60000),
    save: async function () {},
  };
  t.mock.method(User, "findById", () => ({ select: async () => savedUser }));
  t.mock.method(User, "findOne", async () => null);

  const req = baseReq({ body: { otp: "111111" } });
  const res = createMockResponse();

  await verifyEmailChange(req, res, () => {});

  assert.equal(savedUser.email, "new@example.com");
  assert.equal(savedUser.pendingEmail, null);
  assert.equal(res.statusCode, 200);
});

// ==========================================
// TWO-FACTOR AUTHENTICATION (enable/disable)
// ==========================================
test("requestEnable2FA rejects when 2FA is already enabled", async (t) => {
  t.mock.method(User, "findById", async () => ({ twoFactorEnabled: true }));

  const req = baseReq();
  const res = createMockResponse();

  await assert.rejects(
    () => requestEnable2FA(req, res),
    (err) => {
      assert.equal(err.code, "2FA_ALREADY_ENABLED");
      return true;
    }
  );
});

test("verifyEnable2FA rejects a missing OTP code", async () => {
  const req = baseReq({ body: {} });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEnable2FA(req, res),
    (err) => {
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("verifyEnable2FA turns on 2FA for a correct code", async (t) => {
  const savedUser = {
    twoFactorSetupOtp: crypto.createHash("sha256").update("222222").digest("hex"),
    twoFactorSetupOtpExpiresAt: new Date(Date.now() + 60000),
    twoFactorEnabled: false,
    save: async function () {},
  };
  t.mock.method(User, "findById", () => ({ select: async () => savedUser }));

  const req = baseReq({ body: { otp: "222222" } });
  const res = createMockResponse();

  await verifyEnable2FA(req, res, () => {});

  assert.equal(savedUser.twoFactorEnabled, true);
  assert.equal(savedUser.twoFactorSetupOtp, null);
  assert.equal(res.statusCode, 200);
});

test("disable2FA rejects a missing current password", async () => {
  const req = baseReq({ body: {} });
  const res = createMockResponse();

  await assert.rejects(
    () => disable2FA(req, res),
    (err) => {
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("disable2FA rejects an incorrect password", async (t) => {
  t.mock.method(User, "findById", () => ({ select: async () => ({ password: "hashed" }) }));
  t.mock.method(bcrypt, "compare", async () => false);

  const req = baseReq({ body: { currentPassword: "wrong" } });
  const res = createMockResponse();

  await assert.rejects(
    () => disable2FA(req, res),
    (err) => {
      assert.equal(err.code, "INVALID_PASSWORD");
      return true;
    }
  );
});

test("disable2FA turns off 2FA on a correct password", async (t) => {
  const savedUser = { password: "hashed", twoFactorEnabled: true, save: async function () {} };
  t.mock.method(User, "findById", () => ({ select: async () => savedUser }));
  t.mock.method(bcrypt, "compare", async () => true);

  const req = baseReq({ body: { currentPassword: "correct" } });
  const res = createMockResponse();

  await disable2FA(req, res, () => {});

  assert.equal(savedUser.twoFactorEnabled, false);
  assert.equal(res.statusCode, 200);
});

// ==========================================
// CHANGE PASSWORD
// ==========================================
test("changePassword rejects when a field is missing", async () => {
  const req = baseReq({ body: { currentPassword: "old", newPassword: "newpass1" } });
  const res = createMockResponse();

  await assert.rejects(
    () => changePassword(req, res),
    (err) => {
      assert.equal(err.name, "AppError");
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("changePassword rejects when new and confirm passwords differ", async () => {
  const req = baseReq({
    body: { currentPassword: "oldpass1", newPassword: "newpass1", confirmPassword: "different1" },
  });
  const res = createMockResponse();

  await assert.rejects(
    () => changePassword(req, res),
    (err) => {
      assert.equal(err.code, "PASSWORD_MISMATCH");
      return true;
    }
  );
});

test("changePassword rejects a new password shorter than 8 characters", async () => {
  const req = baseReq({
    body: { currentPassword: "oldpass1", newPassword: "short1", confirmPassword: "short1" },
  });
  const res = createMockResponse();

  await assert.rejects(
    () => changePassword(req, res),
    (err) => {
      assert.equal(err.code, "WEAK_PASSWORD");
      return true;
    }
  );
});

test("changePassword rejects when currentPassword does not match the stored hash", async (t) => {
  t.mock.method(User, "findById", () => ({
    select: async () => ({ password: "hashed-old" }),
  }));
  t.mock.method(bcrypt, "compare", async () => false);

  const req = baseReq({
    body: { currentPassword: "wrongpass1", newPassword: "newpass123", confirmPassword: "newpass123" },
  });
  const res = createMockResponse();

  await assert.rejects(
    () => changePassword(req, res),
    (err) => {
      assert.equal(err.code, "INVALID_PASSWORD");
      return true;
    }
  );
});

test("changePassword hashes and saves the new password on success", async (t) => {
  let savedPassword;
  const fakeUser = {
    _id: "user1",
    password: "hashed-old",
    save: async function () {
      savedPassword = this.password;
    },
  };

  t.mock.method(User, "findById", () => ({ select: async () => fakeUser }));
  t.mock.method(bcrypt, "compare", async () => true);
  t.mock.method(bcrypt, "genSalt", async () => "salt");
  t.mock.method(bcrypt, "hash", async () => "hashed-new");

  const req = baseReq({
    body: { currentPassword: "oldpass1", newPassword: "newpass123", confirmPassword: "newpass123" },
  });
  const res = createMockResponse();

  await changePassword(req, res, () => {});

  assert.equal(savedPassword, "hashed-new");
  assert.ok(fakeUser.passwordChangedAt instanceof Date);
  assert.ok(res.payload.data.accessToken);
  assert.ok(res.cookies.refreshToken);
  assert.equal(res.statusCode, 200);
});

// ==========================================
// EMAIL CHANGE OTP
// ==========================================
test("verifyEmailChange verifies hashed OTP and updates email", async (t) => {
  const rawOtp = "123456";
  const hashedOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");
  const fakeUser = {
    _id: "user1",
    pendingEmail: "new@example.com",
    pendingEmailOtp: hashedOtp,
    pendingEmailOtpExpiresAt: new Date(Date.now() + 60000),
    pendingEmailOtpAttempts: 0,
    save: async function () {},
  };

  t.mock.method(User, "findById", () => ({ select: async () => fakeUser }));
  t.mock.method(User, "findOne", async () => null);

  const req = baseReq({ body: { otp: rawOtp } });
  const res = createMockResponse();

  await verifyEmailChange(req, res, () => {});

  assert.equal(fakeUser.email, "new@example.com");
  assert.equal(fakeUser.pendingEmail, null);
  assert.equal(fakeUser.pendingEmailOtp, null);
  assert.equal(fakeUser.pendingEmailOtpAttempts, 0);
  assert.equal(res.statusCode, 200);
});

test("verifyEmailChange locks out after 5 failed attempts", async (t) => {
  const fakeUser = {
    _id: "user1",
    pendingEmail: "new@example.com",
    pendingEmailOtp: crypto.createHash("sha256").update("123456").digest("hex"),
    pendingEmailOtpExpiresAt: new Date(Date.now() + 60000),
    pendingEmailOtpAttempts: 4, // 5th attempt will fail
    save: async function () {},
  };

  t.mock.method(User, "findById", () => ({ select: async () => fakeUser }));

  const req = baseReq({ body: { otp: "999999" } });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEmailChange(req, res),
    (err) => {
      assert.equal(err.statusCode, 429);
      assert.equal(err.code, "TOO_MANY_ATTEMPTS");
      return true;
    }
  );

  assert.equal(fakeUser.pendingEmail, null);
  assert.equal(fakeUser.pendingEmailOtp, null);
  assert.equal(fakeUser.pendingEmailOtpAttempts, 0);
});

// ==========================================
// 2FA ENABLE OTP
// ==========================================
test("verifyEnable2FA verifies hashed OTP and enables 2FA", async (t) => {
  const rawOtp = "654321";
  const hashedOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");
  const fakeUser = {
    _id: "user1",
    twoFactorEnabled: false,
    twoFactorSetupOtp: hashedOtp,
    twoFactorSetupOtpExpiresAt: new Date(Date.now() + 60000),
    twoFactorSetupOtpAttempts: 0,
    save: async function () {},
  };

  t.mock.method(User, "findById", () => ({ select: async () => fakeUser }));

  const req = baseReq({ body: { otp: rawOtp } });
  const res = createMockResponse();

  await verifyEnable2FA(req, res, () => {});

  assert.equal(fakeUser.twoFactorEnabled, true);
  assert.equal(fakeUser.twoFactorSetupOtp, null);
  assert.equal(fakeUser.twoFactorSetupOtpAttempts, 0);
  assert.equal(res.statusCode, 200);
});

test("verifyEnable2FA locks out after 5 failed attempts", async (t) => {
  const fakeUser = {
    _id: "user1",
    twoFactorEnabled: false,
    twoFactorSetupOtp: crypto.createHash("sha256").update("654321").digest("hex"),
    twoFactorSetupOtpExpiresAt: new Date(Date.now() + 60000),
    twoFactorSetupOtpAttempts: 4, // 5th attempt will fail
    save: async function () {},
  };

  t.mock.method(User, "findById", () => ({ select: async () => fakeUser }));

  const req = baseReq({ body: { otp: "000000" } });
  const res = createMockResponse();

  await assert.rejects(
    () => verifyEnable2FA(req, res),
    (err) => {
      assert.equal(err.statusCode, 429);
      assert.equal(err.code, "TOO_MANY_ATTEMPTS");
      return true;
    }
  );

  assert.equal(fakeUser.twoFactorSetupOtp, null);
  assert.equal(fakeUser.twoFactorSetupOtpAttempts, 0);
  assert.equal(fakeUser.twoFactorEnabled, false);
});

// ==========================================
// PRIVACY SETTINGS
// ==========================================
test("updatePrivacySettings forwards booleans and commentPermission only", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({
    body: { isPrivate: true, commentPermission: "followers", showActivityStatus: "nope" },
  });
  const res = createMockResponse();

  await updatePrivacySettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { isPrivate: true, commentPermission: "followers" });
});

// ==========================================
// NOTIFICATION SETTINGS
// ==========================================
test("updateNotificationSettings forwards only boolean fields", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { notifyOnLikes: false, notifyOnDMs: true, notifyOnComments: "x" } });
  const res = createMockResponse();

  await updateNotificationSettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { notifyOnLikes: false, notifyOnDMs: true });
});

// ==========================================
// APPEARANCE SETTINGS
// ==========================================
test("updateAppearanceSettings forwards appTheme and fontSize when present", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { appTheme: "dark" } });
  const res = createMockResponse();

  await updateAppearanceSettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { appTheme: "dark" });
});

// ==========================================
// LANGUAGE SETTINGS
// ==========================================
test("updateLanguageSettings rejects a missing appLanguage", async () => {
  const req = baseReq({ body: {} });
  const res = createMockResponse();

  await assert.rejects(
    () => updateLanguageSettings(req, res),
    (err) => {
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("updateLanguageSettings updates appLanguage on success", async (t) => {
  const update = t.mock.method(User, "findByIdAndUpdate", async (id, data) => ({ _id: id, ...data }));

  const req = baseReq({ body: { appLanguage: "si" } });
  const res = createMockResponse();

  await updateLanguageSettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { appLanguage: "si" });
});

// ==========================================
// DELETE ACCOUNT
// ==========================================
test("deleteAccount rejects when no password is provided", async () => {
  const req = baseReq({ body: {} });
  const res = createMockResponse();

  await assert.rejects(
    () => deleteAccount(req, res),
    (err) => {
      assert.equal(err.code, "VALIDATION_ERROR");
      return true;
    }
  );
});

test("deleteAccount rejects an incorrect password and does not delete anything", async (t) => {
  t.mock.method(User, "findById", () => ({ select: async () => ({ password: "hashed" }) }));
  t.mock.method(bcrypt, "compare", async () => false);
  const postDelete = t.mock.method(Post, "deleteMany", async () => ({}));

  const req = baseReq({ body: { password: "wrong" } });
  const res = createMockResponse();

  await assert.rejects(
    () => deleteAccount(req, res),
    (err) => {
      assert.equal(err.code, "INVALID_PASSWORD");
      return true;
    }
  );
  assert.equal(postDelete.mock.calls.length, 0);
});

test("deleteAccount cascades deletes across owned content and removes the user on success", async (t) => {
  t.mock.method(User, "findById", () => ({ select: async () => ({ password: "hashed" }) }));
  t.mock.method(bcrypt, "compare", async () => true);

  const postDeleteMany = t.mock.method(Post, "deleteMany", async () => ({}));
  const likeDeleteMany = t.mock.method(Like, "deleteMany", async () => ({}));
  const storyDeleteMany = t.mock.method(Story, "deleteMany", async () => ({}));
  const storyCollectionDeleteMany = t.mock.method(StoryCollection, "deleteMany", async () => ({}));
  const userBadgeDeleteMany = t.mock.method(UserBadge, "deleteMany", async () => ({}));
  const productDeleteMany = t.mock.method(Product, "deleteMany", async () => ({}));
  const notificationDeleteMany = t.mock.method(Notification, "deleteMany", async () => ({}));
  const followDeleteMany = t.mock.method(Follow, "deleteMany", async () => ({}));
  const postUpdateMany = t.mock.method(Post, "updateMany", async () => ({}));
  const userFindByIdAndDelete = t.mock.method(User, "findByIdAndDelete", async () => ({}));

  const req = baseReq({ body: { password: "correct" } });
  const res = createMockResponse();

  await deleteAccount(req, res, () => {});

  assert.equal(postDeleteMany.mock.calls.length, 1);
  assert.equal(likeDeleteMany.mock.calls.length, 1);
  assert.equal(storyDeleteMany.mock.calls.length, 1);
  assert.equal(storyCollectionDeleteMany.mock.calls.length, 1);
  assert.equal(userBadgeDeleteMany.mock.calls.length, 1);
  assert.equal(productDeleteMany.mock.calls.length, 1);
  assert.equal(notificationDeleteMany.mock.calls.length, 1);
  assert.equal(followDeleteMany.mock.calls.length, 1);
  assert.equal(postUpdateMany.mock.calls.length, 2);
  assert.equal(userFindByIdAndDelete.mock.calls.length, 1);
  assert.equal(res.statusCode, 200);
});