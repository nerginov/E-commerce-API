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

// Controller function to fetch products by IDs
const getProductsByIds = async (req, res) => {
  try {
    // Extract product IDs from request parameters
    const productIds = req.params.productIds.split(",");

    // Execute the query to fetch products by IDs
    const query = "SELECT * FROM products WHERE id IN (?)";
    const results = await pool.promise().query(query, [productIds]);

    // Send the results back as JSON
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    res.status(500).json({ error: "Error fetching products by IDs" });
  }
};

export { getProductsByIds };
