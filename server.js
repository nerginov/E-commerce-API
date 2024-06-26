import express from "express";
import bodyParser from "body-parser";
import productsRoutes from "./routes/products.js";
import contactRoutes from "./routes/contact.js";
import stripeRoutes from "./routes/stripe.js";
import cartRoutes from "./routes/cart.js";
import cors from "cors";
import dotenv from "dotenv"; // Importing the dotenv package to load environment variables from a .env file
dotenv.config(); // Loading environment variables from the .env file

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

//Serve the product images to the server
app.use(express.static("product-images"));
// Use Product routes
app.use("/api/products", productsRoutes);
//Use Contact routes
app.use("/api/contact", contactRoutes);
// Use Stripe routes
app.use("/api/stripe", stripeRoutes);
// Use Cart routes
app.use("/api/cart", cartRoutes);

app.listen(process.env.PORT, () => {});
