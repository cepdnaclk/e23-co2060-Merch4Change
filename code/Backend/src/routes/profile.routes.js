import { Router } from "express";

import { createOrganizationProfile } from "../controllers/profile.controller.js";
import validateRequest from "../middlewares/validateRequest.js";
import { validateOrganizationProfileCreateBody } from "../validators/profile.validator.js";

const router = Router();

router.post(
  "/organization",
  validateRequest({ body: validateOrganizationProfileCreateBody }),
  createOrganizationProfile,
);

export default router;
