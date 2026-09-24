import { Router } from "express";
import {
  handleStripeWebhook,
  verifyPaymentSession,
} from "../controllers/payment.controller.js";

const router = Router();

// Webhook endpoint called by Stripe servers
router.post("/webhook", handleStripeWebhook);

// Verification endpoint called by Frontend success page to confirm order payment
router.get("/verify-session/:sessionId", verifyPaymentSession);

export default router;
