import { Router } from "express";
import protect from "../middlewares/auth.js";
import { stripeIpFilter } from "../middlewares/stripeIpFilter.js";
import {
  handleStripeWebhook,
  verifyPaymentSession,
  createTopupSession,
} from "../controllers/payment.controller.js";

const router = Router();

// Webhook endpoint called by Stripe servers — only allow Stripe IP ranges
router.post("/webhook", stripeIpFilter, handleStripeWebhook);

// Verification endpoint called by Frontend success page to confirm order payment
router.get("/verify-session/:sessionId", protect, verifyPaymentSession);

// Topup endpoint
router.post("/topup/create-session", protect, createTopupSession);

export default router;
