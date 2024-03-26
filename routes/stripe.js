import express from "express";
import {
  createCheckoutSession,
  verifyQuantitiesBeforeCheckout,
} from "../controllers/stripe.js";

const router = express.Router();

// Route to create a new checkout session
router.post("/create-checkout-session", createCheckoutSession);
router.post("/verify-quantities", verifyQuantitiesBeforeCheckout);

export default router;
