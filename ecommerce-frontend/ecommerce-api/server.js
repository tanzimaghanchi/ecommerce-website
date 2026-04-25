const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// app.use(cors());


app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());
/* ================= DB CONNECTION ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce",
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ================= GET ALL PRODUCTS ================= */

app.get("/api/products", (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err,
      });
    }

    res.json({
      success: true,
      totalProducts: result.length,
      data: result,
    });
  });
});

/* ================= ADD PRODUCT ================= */

app.post("/api/products", (req, res) => {
  console.log("BODY:", req.body);

  const { name, price, image, category, description } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({
      success: false,
      message: "Name, price and category are required",
    });
  }

  const sql =
    "INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, price, image, category, description], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Failed to add product",
        error: err,
      });
    }

    res.json({
      success: true,
      message: "Product added successfully 🎉",
      insertedId: result.insertId,
    });
  });
});

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

/* ================= START SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});