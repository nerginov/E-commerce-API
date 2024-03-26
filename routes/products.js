import express from "express";
import {
  getAllProducts,
  getProductQuantityInStock,
  getLatestFourProducts,
} from "../controllers/products.js";

const router = express.Router();

// Route to fetch all the products
router.get("/", getAllProducts);

// Route to fetch the quantity in stock for a specific product
router.get("/:id/quantity", getProductQuantityInStock);

// Inside your Express route setup
router.get("/latest-products", getLatestFourProducts);

export default router;
