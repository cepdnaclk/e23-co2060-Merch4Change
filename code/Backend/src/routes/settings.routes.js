import { Router } from "express";
import protect from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js"; // <-- Add this import
import validateRequest from "../middlewares/validateRequest.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";
import {
  validateProfileSettingsBody,
  validateSecuritySettingsBody,
  validateChangePasswordBody,
  validatePrivacySettingsBody,
  validateNotificationSettingsBody,
  validateAppearanceSettingsBody,
  validateLanguageSettingsBody,
  validateDeleteAccountBody,
  validateRequestEmailChangeBody,
  validateVerifyEmailChangeBody,
  validateVerifyEnable2FABody,
  validateDisable2FABody,
} from "../validators/settings.validator.js";
import {
  updateProfileSettings,
  requestEmailChange,
  resendEmailChangeOtp,
  verifyEmailChange,
  updateSecuritySettings,
  requestEnable2FA,
  verifyEnable2FA,
  disable2FA,
  updatePrivacySettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateLanguageSettings,
  changePassword,
  deleteAccount,
} from "../controllers/settings.controller.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Profile endpoint with optional single file upload (field name: 'avatar')
router.put(
  "/profile",
  upload.single("avatar"),
  validateRequest({ body: validateProfileSettingsBody }),
  updateProfileSettings
);

// Email re-verification endpoints (OTP)
router.post(
  "/email/request-change",
  authRateLimiter,
  validateRequest({ body: validateRequestEmailChangeBody }),
  requestEmailChange
);
router.post(
  "/email/resend-otp",
  authRateLimiter,
  resendEmailChangeOtp
);
router.post(
  "/email/verify",
  authRateLimiter,
  validateRequest({ body: validateVerifyEmailChangeBody }),
  verifyEmailChange
);

// Security endpoints
router.put(
  "/security",
  validateRequest({ body: validateSecuritySettingsBody }),
  updateSecuritySettings
);
router.post(
  "/change-password",
  authRateLimiter,
  validateRequest({ body: validateChangePasswordBody }),
  changePassword
);

// Two-factor authentication (OTP-gated enable, password-gated disable)
router.post(
  "/security/2fa/request-enable",
  authRateLimiter,
  requestEnable2FA
);
router.post(
  "/security/2fa/verify-enable",
  authRateLimiter,
  validateRequest({ body: validateVerifyEnable2FABody }),
  verifyEnable2FA
);
router.post(
  "/security/2fa/disable",
  authRateLimiter,
  validateRequest({ body: validateDisable2FABody }),
  disable2FA
);

// Privacy endpoints
router.put(
  "/privacy",
  validateRequest({ body: validatePrivacySettingsBody }),
  updatePrivacySettings
);

// Notification endpoints
router.put(
  "/notifications",
  validateRequest({ body: validateNotificationSettingsBody }),
  updateNotificationSettings
);

// Appearance endpoints
router.put(
  "/appearance",
  validateRequest({ body: validateAppearanceSettingsBody }),
  updateAppearanceSettings
);

// Language endpoints
router.put(
  "/language",
  validateRequest({ body: validateLanguageSettingsBody }),
  updateLanguageSettings
);

// Account deletion
router.delete(
  "/account",
  authRateLimiter,
  validateRequest({ body: validateDeleteAccountBody }),
  deleteAccount
);

export default router;