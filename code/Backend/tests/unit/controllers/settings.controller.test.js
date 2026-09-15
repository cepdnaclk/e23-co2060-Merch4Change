import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

import { createMockResponse } from "../helpers/http.js";
import User from "../../../src/models/User.js";
import Post from "../../../src/models/Post.js";
import Like from "../../../src/models/Like.js";
import Follow from "../../../src/models/Follow.js";
import Notification from "../../../src/models/Notification.js";
import Story from "../../../src/models/Story.js";
import StoryCollection from "../../../src/models/StoryCollection.js";
import UserBadge from "../../../src/models/UserBadge.js";
import Product from "../../../src/models/Product.js";
import {
  updateProfileSettings,
  updateSecuritySettings,
  changePassword,
  updatePrivacySettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateLanguageSettings,
  deleteAccount,
} from "../../../src/controllers/settings.controller.js";

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

  const req = baseReq({ body: { loginActivityAlerts: true, bogusField: "not-a-boolean" } });
  const res = createMockResponse();

  await updateSecuritySettings(req, res, () => {});

  const [, updateData] = update.mock.calls[0].arguments;
  assert.deepEqual(updateData, { loginActivityAlerts: true });
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
  assert.equal(res.statusCode, 200);
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