import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/appError.js";
import { successResponse } from "../utils/apiResponse.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import Follow from "../models/Follow.js";
import Notification from "../models/Notification.js";
import Story from "../models/Story.js";
import StoryCollection from "../models/StoryCollection.js";
import UserBadge from "../models/UserBadge.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";
import sendOtpEmail from "../utils/sendOtpEmail.js";
import sendEmailChangeAlertEmail from "../utils/sendEmailChangeAlertEmail.js";
import OtpResendRecord from "../models/OtpResendRecord.js";

const OTP_EXPIRE_MIN = Number(process.env.OTP_EXPIRE_MIN) || 5;

// ==========================================
// PROFILE SETTINGS CONTROLLER
// ==========================================
export const updateProfileSettings = asyncHandler(async (req, res) => {
  const {
    name,
    firstName,
    lastName,
    userName,
    profileBio,
    userLink,
    location,
    avatarUrl,
  } = req.body;

  // NOTE: email is intentionally NOT accepted here. Changing the email on
  // the account requires OTP re-verification — see requestEmailChange /
  // verifyEmailChange below.

  const updateData = {};

  // Form field mappings
  if (name !== undefined) updateData.name = name;
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (userName !== undefined) updateData.userName = userName;
  if (profileBio !== undefined) updateData.profileBio = profileBio;
  if (userLink !== undefined) updateData.userLink = userLink;
  if (location !== undefined) updateData.location = location;

  // Handle image upload from multipart form or fallback URL string
  if (req.file) {
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "avatars");
    updateData.avatarUrl = uploadResult.secure_url;
    updateData.profileImageUrl = uploadResult.secure_url;
  } else if (avatarUrl !== undefined) {
    updateData.avatarUrl = avatarUrl;
    updateData.profileImageUrl = avatarUrl;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Profile settings updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// REQUEST EMAIL CHANGE (starts OTP re-verification)
// ==========================================
export const requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail, currentPassword } = req.body;

  if (!newEmail || !currentPassword) {
    throw new AppError(
      "New email and current password are required.",
      400,
      "VALIDATION_ERROR"
    );
  }

  const normalizedNewEmail = String(newEmail).toLowerCase().trim();

  // Get user with password field to confirm identity before starting the change.
  const user = await User.findById(req.user._id).select(
    "+password +pendingEmailOtp +pendingEmailOtpExpiresAt"
  );

  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Current password is incorrect.", 401, "INVALID_PASSWORD");
  }

  if (normalizedNewEmail === user.email) {
    throw new AppError(
      "That's already your current email address.",
      400,
      "SAME_EMAIL"
    );
  }

  const emailTaken = await User.findOne({ email: normalizedNewEmail });
  if (emailTaken) {
    throw new AppError("That email address is already in use.", 409, "EMAIL_TAKEN");
  }

  // Resend-style cooldown, same pattern as registration OTP, keyed by the
  // new email so repeated attempts to verify the same address are throttled.
  let record = await OtpResendRecord.findOne({ email: normalizedNewEmail });
  if (!record) {
    record = new OtpResendRecord({ email: normalizedNewEmail, count: 0 });
  }

  let cooldownSeconds = 60;
  if (record.count === 1) cooldownSeconds = 120;
  else if (record.count === 2) cooldownSeconds = 300;
  else if (record.count >= 3) cooldownSeconds = 600;

  const now = Date.now();
  const lastRequestTime = record.lastRequestAt ? record.lastRequestAt.getTime() : 0;
  const elapsedSeconds = Math.floor((now - lastRequestTime) / 1000);

  if (elapsedSeconds < cooldownSeconds && record.count > 0) {
    const remainingSeconds = cooldownSeconds - elapsedSeconds;
    throw new AppError(
      `Please wait ${remainingSeconds} seconds before requesting another code.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { remainingSeconds }
    );
  }

  const otpCode = crypto.randomInt(100000, 1000000).toString();

  user.pendingEmail = normalizedNewEmail;
  user.pendingEmailOtp = otpCode;
  user.pendingEmailOtpExpiresAt = new Date(now + OTP_EXPIRE_MIN * 60 * 1000);
  await user.save();

  await sendOtpEmail(normalizedNewEmail, otpCode);

  // Heads-up to the OLD address — doesn't block the flow if it fails.
  try {
    await sendEmailChangeAlertEmail(user.email, normalizedNewEmail);
  } catch (error) {
    console.error("Failed to send email-change alert:", error.message);
  }

  record.count += 1;
  record.lastRequestAt = new Date();
  await record.save();

  let nextCooldown = 60;
  if (record.count === 1) nextCooldown = 120;
  else if (record.count === 2) nextCooldown = 300;
  else if (record.count >= 3) nextCooldown = 600;

  return successResponse(res, 200, "A verification code has been sent to your new email.", {
    pendingEmail: normalizedNewEmail,
    nextCooldownSeconds: nextCooldown,
  });
});

// ==========================================
// RESEND EMAIL CHANGE OTP
// ==========================================
export const resendEmailChangeOtp = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "+pendingEmailOtp +pendingEmailOtpExpiresAt"
  );

  if (!user.pendingEmail) {
    throw new AppError(
      "No pending email change found. Please start again.",
      400,
      "NO_PENDING_EMAIL_CHANGE"
    );
  }

  let record = await OtpResendRecord.findOne({ email: user.pendingEmail });
  if (!record) {
    record = new OtpResendRecord({ email: user.pendingEmail, count: 0 });
  }

  let cooldownSeconds = 60;
  if (record.count === 1) cooldownSeconds = 120;
  else if (record.count === 2) cooldownSeconds = 300;
  else if (record.count >= 3) cooldownSeconds = 600;

  const now = Date.now();
  const lastRequestTime = record.lastRequestAt ? record.lastRequestAt.getTime() : 0;
  const elapsedSeconds = Math.floor((now - lastRequestTime) / 1000);

  if (elapsedSeconds < cooldownSeconds && record.count > 0) {
    const remainingSeconds = cooldownSeconds - elapsedSeconds;
    throw new AppError(
      `Please wait ${remainingSeconds} seconds before requesting another code.`,
      429,
      "RATE_LIMIT_EXCEEDED",
      { remainingSeconds }
    );
  }

  const otpCode = crypto.randomInt(100000, 1000000).toString();
  user.pendingEmailOtp = otpCode;
  user.pendingEmailOtpExpiresAt = new Date(now + OTP_EXPIRE_MIN * 60 * 1000);
  await user.save();

  await sendOtpEmail(user.pendingEmail, otpCode);

  record.count += 1;
  record.lastRequestAt = new Date();
  await record.save();

  let nextCooldown = 60;
  if (record.count === 1) nextCooldown = 120;
  else if (record.count === 2) nextCooldown = 300;
  else if (record.count >= 3) nextCooldown = 600;

  return successResponse(res, 200, "A new verification code has been sent.", {
    nextCooldownSeconds: nextCooldown,
  });
});

// ==========================================
// VERIFY EMAIL CHANGE OTP (commits the change)
// ==========================================
export const verifyEmailChange = asyncHandler(async (req, res) => {
  const { otp, otpCode } = req.body;
  const finalOtp = otp || otpCode;

  if (!finalOtp) {
    throw new AppError("OTP code is required.", 400, "VALIDATION_ERROR");
  }

  const user = await User.findById(req.user._id).select(
    "+pendingEmailOtp +pendingEmailOtpExpiresAt"
  );

  if (!user.pendingEmail || !user.pendingEmailOtp) {
    throw new AppError(
      "No pending email change found. Please start again.",
      400,
      "NO_PENDING_EMAIL_CHANGE"
    );
  }

  if (user.pendingEmailOtpExpiresAt && user.pendingEmailOtpExpiresAt.getTime() < Date.now()) {
    user.pendingEmail = null;
    user.pendingEmailOtp = null;
    user.pendingEmailOtpExpiresAt = null;
    await user.save();
    throw new AppError(
      "This verification code has expired. Please request a new one.",
      400,
      "OTP_EXPIRED"
    );
  }

  if (user.pendingEmailOtp !== String(finalOtp).trim()) {
    throw new AppError("Invalid verification code.", 400, "INVALID_OTP");
  }

  // Guard against a race where someone else claimed the address in the meantime.
  const emailTaken = await User.findOne({
    email: user.pendingEmail,
    _id: { $ne: user._id },
  });
  if (emailTaken) {
    user.pendingEmail = null;
    user.pendingEmailOtp = null;
    user.pendingEmailOtpExpiresAt = null;
    await user.save();
    throw new AppError("That email address is already in use.", 409, "EMAIL_TAKEN");
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.pendingEmailOtp = null;
  user.pendingEmailOtpExpiresAt = null;
  await user.save();

  return successResponse(res, 200, "Email address updated successfully.", {
    user,
  });
});

// ==========================================
// SECURITY SETTINGS CONTROLLER
// ==========================================
export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const { twoFactorEnabled, loginActivityAlerts } = req.body;

  const updateData = {};
  if (typeof twoFactorEnabled === "boolean") {
    updateData.twoFactorEnabled = twoFactorEnabled;
  }
  if (typeof loginActivityAlerts === "boolean") {
    updateData.loginActivityAlerts = loginActivityAlerts;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Security settings updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// CHANGE PASSWORD CONTROLLER
// ==========================================
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError("All password fields are required.", 400, "VALIDATION_ERROR");
  }

  if (newPassword !== confirmPassword) {
    throw new AppError("New passwords do not match.", 400, "PASSWORD_MISMATCH");
  }

  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters.", 400, "WEAK_PASSWORD");
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Current password is incorrect.", 401, "INVALID_PASSWORD");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  return successResponse(res, 200, "Password changed successfully.", {
    message: "Your password has been updated.",
  });
});

// ==========================================
// PRIVACY SETTINGS CONTROLLER
// ==========================================
export const updatePrivacySettings = asyncHandler(async (req, res) => {
  const {
    isPrivate,
    showActivityStatus,
    allowMessageRequests,
    hideReadReceipts,
    commentPermission,
  } = req.body;

  const updateData = {};
  if (typeof isPrivate === "boolean") updateData.isPrivate = isPrivate;
  if (typeof showActivityStatus === "boolean") updateData.showActivityStatus = showActivityStatus;
  if (typeof allowMessageRequests === "boolean") updateData.allowMessageRequests = allowMessageRequests;
  if (typeof hideReadReceipts === "boolean") updateData.hideReadReceipts = hideReadReceipts;
  if (commentPermission) updateData.commentPermission = commentPermission;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Privacy settings updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// NOTIFICATION SETTINGS CONTROLLER
// ==========================================
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const {
    notifyOnLikes,
    notifyOnComments,
    notifyOnNewFollowers,
    notifyOnDMs,
    emailNotifications,
  } = req.body;

  const updateData = {};
  if (typeof notifyOnLikes === "boolean") updateData.notifyOnLikes = notifyOnLikes;
  if (typeof notifyOnComments === "boolean") updateData.notifyOnComments = notifyOnComments;
  if (typeof notifyOnNewFollowers === "boolean") updateData.notifyOnNewFollowers = notifyOnNewFollowers;
  if (typeof notifyOnDMs === "boolean") updateData.notifyOnDMs = notifyOnDMs;
  if (typeof emailNotifications === "boolean") updateData.emailNotifications = emailNotifications;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Notification settings updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// APPEARANCE SETTINGS CONTROLLER
// ==========================================
export const updateAppearanceSettings = asyncHandler(async (req, res) => {
  const { appTheme, fontSize } = req.body;

  const updateData = {};
  if (appTheme) updateData.appTheme = appTheme;
  if (fontSize) updateData.fontSize = fontSize;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  return successResponse(res, 200, "Appearance settings updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// LANGUAGE SETTINGS CONTROLLER
// ==========================================
export const updateLanguageSettings = asyncHandler(async (req, res) => {
  const { appLanguage } = req.body;

  if (!appLanguage) {
    throw new AppError("Language is required.", 400, "VALIDATION_ERROR");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { appLanguage },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, "Language preference updated successfully.", {
    user: updatedUser,
  });
});

// ==========================================
// DELETE ACCOUNT CONTROLLER
// ==========================================
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError("Password is required to delete account.", 400, "VALIDATION_ERROR");
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select("+password");

  // Verify password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Incorrect password. Account not deleted.", 401, "INVALID_PASSWORD");
  }

  const userId = req.user._id;

  // Content the user owns outright — safe to hard-delete.
  await Post.deleteMany({ userId });
  await Like.deleteMany({ userId });
  await Story.deleteMany({ userId });
  await StoryCollection.deleteMany({ userId });
  await UserBadge.deleteMany({ userId });
  await Product.deleteMany({ ownerUserId: userId });

  // Notifications addressed to this user.
  await Notification.deleteMany({ userId });

  // Follow relationships in either direction.
  await Follow.deleteMany({ $or: [{ followerId: userId }, { followingId: userId }] });

  // Remove the user's footprint from other people's posts (likes + comments)
  // instead of deleting those posts, since the post itself still belongs to
  // someone else.
  await Post.updateMany(
    { likes: userId },
    { $pull: { likes: userId } }
  );
  await Post.updateMany(
    { "comments.author": userId },
    { $pull: { comments: { author: userId } } }
  );

  // Note: Donation, CoinTransaction, Order, Auction, Bid, Review, Message/
  // Conversation, and OrganizationProfile/Charity/Brand records are
  // intentionally left untouched. Those carry financial, audit, or other
  // users' data (e.g. a charity's donation total, another user's purchase
  // history) and deleting them here could corrupt shared records. Handling
  // them requires a separate product decision (hard delete vs. anonymize)
  // rather than a blanket cascade.

  // Finally, delete the user account itself.
  await User.findByIdAndDelete(userId);

  return successResponse(res, 200, "Account deleted successfully.", {
    message: "Your account has been permanently deleted.",
  });
});