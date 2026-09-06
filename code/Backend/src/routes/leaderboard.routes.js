import express from "express";
import {
  getDonorLeaderboard,
  getCompanyLeaderboard,
  getCharityLeaderboard,
  getLeaderboardStats,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Public routes for leaderboards & statistics
router.get("/donors", getDonorLeaderboard);
router.get("/companies", getCompanyLeaderboard);
router.get("/charities", getCharityLeaderboard);
router.get("/stats", getLeaderboardStats);

export default router;
