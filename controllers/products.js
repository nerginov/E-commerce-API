import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Creating MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Controller function to fetch all products new to old
const getAllProducts = async (req, res) => {
  try {
    // Execute the query
    const results = await pool
      .promise()
      .query("SELECT * FROM products ORDER BY add_date ASC");

    // Send the results back as JSON
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
};

// Controller function to fetch the quantity in stock for a specific product
const getProductQuantityInStock = async (req, res) => {
  const productId = req.params.id;

  try {
    // Execute the query to get the quantity in stock for the specified product
    const [productRows] = await pool
      .promise()
      .query("SELECT quantity_in_stock FROM products WHERE id = ?", productId);

    // Check if the product exists
    if (!productRows || productRows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract the quantity in stock from the first row
    const quantityInStock = productRows[0].quantity_in_stock;

    // Send the quantity in stock back as JSON
    res.json({ quantityInStock });
  } catch (error) {
    console.error("Error fetching product quantity in stock:", error);
    res.status(500).json({ error: "Error fetching product quantity in stock" });
  }
};

// Controller function to fetch the 4 last products
const getLatestFourProducts = async (req, res) => {
  try {
    // Execute the query to fetch the 4 last products
    const results = await pool
      .promise()
      .query("SELECT * FROM products ORDER BY add_date ASC LIMIT 4");

    // Send the results back as JSON
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching latest four products:", error);
    res.status(500).json({ error: "Error fetching latest four products" });
  }
};

export { getAllProducts, getProductQuantityInStock, getLatestFourProducts };
