import express from 'express';
import protect from '../middlewares/auth.js'
import { createAuction, placeBid } from '../controllers/auction.controller.js';

const router = express.Router();

router.post("/", protect, createAuction);
router.post("/:id/bid", protect, placeBid);

export default router;