import express from "express";
import {
  getDonorLeaderboard,
  getCompanyLeaderboard,
  getCharityLeaderboard,
  getLeaderboardStats,
} from "../controllers/leaderboard.controller.js";
import { cacheResponse } from "../middlewares/cache.js";

const router = express.Router();

// Cache public leaderboard endpoints for 60 seconds (HTTP Cache-Control & in-memory TTL)
router.use(cacheResponse(60));

// Public routes for leaderboards & statistics
router.get("/donors", getDonorLeaderboard);
router.get("/companies", getCompanyLeaderboard);
router.get("/charities", getCharityLeaderboard);
router.get("/stats", getLeaderboardStats);

export default router;
