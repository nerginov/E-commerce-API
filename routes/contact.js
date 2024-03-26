import express from "express";
import { submitContactForm } from "../controllers/contact.js";

const router = express.Router();

// Route to handle form submission
router.post("/submit", submitContactForm);

export default router;
