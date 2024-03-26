import express from "express";
import {
  addToCart,
  fetchCartData,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.js";

const router = express.Router();

// Route to handle add to  db cart
router.post("/add-to-cart", addToCart);
// Route to handle fetching data from db cart
router.get("/fetch-cart-data/:cartId", fetchCartData);
//Route to handle updating product in db car
router.post("/update-quantity", updateCartItem);
//Route to handle removing product in db car
router.post("/remove-from-cart", removeCartItem);

export default router;
