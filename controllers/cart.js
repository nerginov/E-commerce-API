import mysql2 from "mysql2"; // Importing the mysql2 package for MySQL database interaction
import dotenv from "dotenv"; // Importing the dotenv package to load environment variables from a .env file
dotenv.config(); // Loading environment variables from the .env file

// Create MySQL connection pool
const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST, // MySQL host address from environment variables
  user: process.env.MYSQL_USER, // MySQL user from environment variables
  password: process.env.MYSQL_PASSWORD, // MySQL password from environment variables
  database: process.env.MYSQL_DATABASE, // MySQL database name from environment variables
});

// Check connection
pool.getConnection((err, connection) => {
  // Connecting to the MySQL database
  if (err) {
    // If an error occurs while connecting
    return; // Exiting the function
  }

  connection.release(); // Releasing the connection back to the pool
});

// Controller function to handle adding products to cart
const addToCart = (req, res) => {
  // Function to handle adding products to the cart
  const cartId = req.body.cart_id; // Extracting the cart ID from the request body
  const productId = req.body.product_id; // Extracting the product ID from the request body
  const quantity = req.body.quantity; // Extracting the quantity from the request body

  // Check if the product already exists in the cart
  const checkQuery =
    "SELECT * FROM user_carts WHERE cart_id = ? AND product_id = ?"; // SQL query to check if the product exists in the cart
  pool.query(checkQuery, [cartId, productId], (err, result) => {
    // Executing the SQL query with parameters
    if (err) {
      // If an error occurs during the query execution
      console.error("Error checking product in cart: " + err.message); // Outputting the error to the console
      return res.status(500).json({ error: "Internal Server Error" }); // Sending a 500 Internal Server Error response
    }

    if (result.length === 0) {
      // If the product does not exist in the cart
      const insertQuery =
        "INSERT INTO user_carts (cart_id, product_id, quantity) VALUES (?, ?, ?)"; // SQL query to insert the product into the cart
      pool.query(insertQuery, [cartId, productId, quantity], (err, result) => {
        // Executing the SQL query to insert the product
        if (err) {
          // If an error occurs during the query execution
          console.error("Error inserting product into cart: " + err.message); // Outputting the error to the console
          return res.status(500).json({ error: "Internal Server Error" }); // Sending a 500 Internal Server Error response
        }
        return res
          .status(200)
          .json({ message: "Product added to cart successfully" }); // Sending a 200 OK response with a success message
      });
    } else {
      // If the product already exists in the cart
      const updateQuery =
        "UPDATE user_carts SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?"; // SQL query to update the quantity of the existing product in the cart
      pool.query(updateQuery, [quantity, cartId, productId], (err, result) => {
        // Executing the SQL query to update the quantity
        if (err) {
          // If an error occurs during the query execution
          console.error(
            "Error updating product quantity in cart: " + err.message
          ); // Outputting the error to the console
          return res.status(500).json({ error: "Internal Server Error" }); // Sending a 500 Internal Server Error response
        }
        return res.status(200).json({
          message: "Product quantity updated in cart successfully",
        }); // Sending a 200 OK response with a success message
      });
    }
  });
};

// Controller function to fetch cart data
const fetchCartData = (req, res) => {
  // Function to fetch cart data from the database
  const { cartId } = req.params; // Extracting the cart ID from the request parameters

  // Query to fetch products, quantities, and quantity_in_stock corresponding to the cartId, along with their names
  const query = `
        SELECT u.product_id, u.quantity, p.price, p.main_image_path, p.name, p.quantity_in_stock
        FROM user_carts u
        JOIN products p ON u.product_id = p.id
        WHERE u.cart_id = ?`; // SQL query to fetch cart data

  pool.query(query, [cartId], async (err, results) => {
    // Executing the SQL query with parameters
    if (err) {
      // If an error occurs during the query execution
      console.error("Error fetching cart data:", err); // Outputting the error to the console
      return res.status(500).json({ error: "Internal Server Error" }); // Sending a 500 Internal Server Error response
    }

    try {
      const cartItems = []; // Array to store fetched cart items

      for (const item of results) {
        // Iterating through each fetched item
        const {
          product_id,
          quantity,
          price,
          main_image_path,
          name,
          quantity_in_stock,
        } = item; // Destructuring item properties

        const cartItem = {
          // Constructing cart item object
          id: product_id,
          quantity,
          price,
          image: main_image_path,
          name,
          quantityInStock: quantity_in_stock,
        };

        cartItems.push(cartItem); // Pushing cart item to the array
      }

      res.status(200).json(cartItems); // Sending a 200 OK response with the fetched cart items
    } catch (error) {
      // Catching any potential errors
      console.error("Error fetching product data:", error); // Outputting the error to the console
      return res.status(500).json({ error: "Internal Server Error" }); // Sending a 500 Internal Server Error response
    }
  });
};

// Controller function to update cart item quantity
const updateCartItem = (req, res) => {
  const { cartId, productId, quantity } = req.body;

  const query =
    "UPDATE user_carts SET quantity = ? WHERE cart_id = ? AND product_id = ?";
  pool.query(query, [quantity, cartId, productId], (err, result) => {
    if (err) {
      console.error("Error updating cart item:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: "Cart item updated successfully" });
  });
};

// Controller function to remove cart item
const removeCartItem = (req, res) => {
  const { cartId, productId } = req.body;

  const query = "DELETE FROM user_carts WHERE cart_id = ? AND product_id = ?";
  pool.query(query, [cartId, productId], (err, result) => {
    if (err) {
      console.error("Error removing cart item:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json({ message: "Cart item removed successfully" });
  });
};

// Function to delete carts with all items older than 12 hours
const cartCleanup = () => {
  const now = new Date(); // Get the current date/time on the application server
  now.setHours(now.getHours() + 1); // Adjust the current time to match the database server's time zone
  const twelveHoursAgo = new Date(now - 12 * 60 * 60 * 1000); // Calculate 12 hours ago
  const cutoffTime = twelveHoursAgo
    .toISOString()
    .slice(0, 19)
    .replace("T", " "); // Format the cutoff time
  //delete carts where all items are older than 12h
  const query = `
  DELETE FROM user_carts
  WHERE cart_id IN (
      SELECT cart_id
      FROM user_carts
      GROUP BY cart_id
      HAVING MIN(updated_at) < ?
  )
  `;
  pool.query(query, [cutoffTime], (err, result) => {
    if (err) {
      console.error("Error cleaning up carts:", err);
      return;
    }
  });
};

// Call the cartCleanup function periodically (e.g., twice a day)
const scheduleCartCleanup = () => {
  const intervalInMilliseconds = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  setInterval(cartCleanup, intervalInMilliseconds); // Run cartCleanup every 12 hours
};

scheduleCartCleanup(); // Start the cart cleanup scheduler

export { addToCart, fetchCartData, updateCartItem, removeCartItem }; // Exporting the controller functions
