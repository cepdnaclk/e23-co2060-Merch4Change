// src/routes/homeBanner.routes.js
import express from "express";
import protect from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import { upload } from "../middlewares/upload.js";
import {
  uploadBanner,
  getBanners,
  deleteBanner,
} from "../controllers/homeBanner.controller.js";

const router = express.Router();

router.get("/", getBanners);
router.post(
  "/",
  protect,
  requireRole("admin"),
  upload.single("image"),
  uploadBanner,
);
router.delete("/:id", protect, requireRole("admin"), deleteBanner);

export default router;
