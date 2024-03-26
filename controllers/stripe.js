import stripe from "stripe";
import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();
const stripeInstance = stripe(process.env.STRIPE_PRIVATE_KEY);

// Create a pool of MySQL connections
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to handle the checkout session creation
const createCheckoutSession = async (req, res) => {
  try {
    // Retrieve cart items from request (assuming they are present in req.body.cartItems and the url where i initiate the payment)
    const { cartItems, returnUrl } = req.body;

    // Extract product IDs from cart
    const productIds = cartItems.map((item) => item.id);

    // Construct the SQL query dynamically with the correct number of placeholders
    const placeholders = productIds.map(() => "?").join(", ");
    const query = `SELECT * FROM products WHERE id IN (${placeholders})`;

    // Query the database to fetch product details based on product IDs(to use the data from there instead of passing it from frontend)
    const [results] = await pool.promise().query(query, productIds);

    // Create line items for the Stripe checkout session using cart items and database results(qty from cartitems and rest from the database)
    const lineItems = cartItems.map((cartItem) => {
      const product = results.find((item) => item.id === cartItem.id);
      if (!product) {
        throw new Error(
          `Product with ID ${cartItem.id} not found in the database.`
        );
      }
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            images: [
              `http://localhost:4000/product-images/${product.main_image_path}`,
            ],
            // Other product details if needed
          },
          unit_amount: parseFloat(product.price) * 100, // Stripe requires price in cents
        },
        quantity: cartItem.quantity, // Use quantity from cart item
      };
    });

    // Create a new Checkout Session using Stripe API
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3000/stripe-payment-successful-page/`, // URL to redirect after successful payment
      cancel_url: returnUrl, // URL to redirect after canceled payment
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "AT"], // Specify the countries where shipping is allowed
      },
    });

    // Send the session ID back to the client
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// Controller function to verify quantities before checkout
const verifyQuantitiesBeforeCheckout = async (req, res) => {
  const { cartItems } = req.body;

  try {
    // Construct the SQL query dynamically with the correct number of placeholders
    const placeholders = cartItems.map(() => `?`).join(", ");
    const query = `SELECT id, name, quantity_in_stock FROM products WHERE id IN (${placeholders})`;

    // Create an array to store product IDs
    const productIds = cartItems.map((item) => item.id);

    // Execute the query to fetch quantities in stock for all products
    const [productRows] = await pool.promise().query(query, productIds);

    // Array to store details of products with insufficient stock
    const insufficientStockProducts = [];

    // Check if quantities are valid for all products
    for (let i = 0; i < productRows.length; i++) {
      const productRow = productRows[i];
      const { id, name, quantity_in_stock } = productRow;
      const requestedQuantity = cartItems.find(
        (item) => item.id === id
      ).quantity;

      // Check if the quantity in stock is sufficient
      if (quantity_in_stock < requestedQuantity) {
        insufficientStockProducts.push({ id, name, quantity_in_stock });
      }
    }

    if (insufficientStockProducts.length > 0) {
      // If there are products with insufficient stock, return the details
      res.json({ quantitiesValid: false, insufficientStockProducts });
    } else {
      // If all quantities are valid
      res.json({ quantitiesValid: true });
    }
  } catch (error) {
    console.error("Error verifying quantities before checkout:", error);
    res
      .status(500)
      .json({ error: "Error verifying quantities before checkout" });
  }
};

export { createCheckoutSession, verifyQuantitiesBeforeCheckout };
