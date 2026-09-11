import { Router } from "express";
import protect from "../middlewares/auth.js";
import {
  updateSecuritySettings,
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

// Security endpoints
router.put("/security", updateSecuritySettings);
router.post("/change-password", changePassword);

// Privacy endpoints
router.put("/privacy", updatePrivacySettings);

// Notification endpoints
router.put("/notifications", updateNotificationSettings);

// Appearance endpoints
router.put("/appearance", updateAppearanceSettings);

// Language endpoints
router.put("/language", updateLanguageSettings);

// Account deletion
router.delete("/account", deleteAccount);

export default router;