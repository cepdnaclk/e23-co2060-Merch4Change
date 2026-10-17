import { Router } from "express";
import protect from "../middlewares/auth.js";
import {
  handleStripeWebhook,
  verifyPaymentSession,
  createTopupSession,
} from "../controllers/payment.controller.js";
import protect from "../middlewares/auth.js";

const router = Router();

// Webhook endpoint called by Stripe servers
router.post("/webhook", handleStripeWebhook);

// Verification endpoint called by Frontend success page to confirm order payment
router.get("/verify-session/:sessionId", protect, verifyPaymentSession);

export default router;

// Topup endpoint
router.post("/topup/create-session", protect, createTopupSession);
