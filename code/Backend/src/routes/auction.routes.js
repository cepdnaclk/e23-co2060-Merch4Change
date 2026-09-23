import express from 'express';
import protect from '../middlewares/auth.js'
import { createAuction, getAuction, getBids, listAuctions, placeBid } from '../controllers/auction.controller.js';

const router = express.Router();

router.post("/", protect, createAuction);
router.post("/:id/bid", protect, placeBid);
router.get("/", listAuctions);
router.get("/:id", getAuction);
router.get("/:id/bids", getBids)

export default router;