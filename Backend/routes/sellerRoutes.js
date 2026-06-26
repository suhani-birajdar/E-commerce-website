const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db"); // your mysql connection

// POST /seller/register
router.post("/register", async (req, res) => {
  const { name, email, password, shop_name } = req.body;

  if (!name || !email || !password || !shop_name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if email already exists
    const [existing] = await db.promise().query(
      "SELECT id FROM sellers WHERE email = ?", [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert seller
    await db.promise().query(
      "INSERT INTO sellers (name, email, password, shop_name) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, shop_name]
    );

    res.status(201).json({
      message: "Seller registered successfully. Wait for admin approval."
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /seller/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [rows] = await db.promise().query(
      "SELECT * FROM sellers WHERE email = ?", [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const seller = rows[0];

    // Check if approved
    if (seller.status !== 'approved') {
        if (seller.status === 'rejected') {
            return res.status(403).json({ message: "Your account has been rejected by admin." });
        }
        return res.status(403).json({ message: "Your account is not approved by admin yet." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      seller: { id: seller.id, name: seller.name, shop_name: seller.shop_name }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const verifySellerApproved = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "seller") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check seller is still approved in DB
    const [rows] = await db.promise().query(
      "SELECT status FROM sellers WHERE id = ?", [decoded.id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Seller not found" });
    if (rows[0].status !== "approved") return res.status(403).json({ message: "Your account is not approved" });

    req.seller = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

    // POST /api/seller/products — add a product
router.post("/products", verifySellerApproved, async (req, res) => {
  const { name, description, price, image_url, stock_quantity } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    await db.promise().query(
      "INSERT INTO products (name, description, price, image_url, stock_quantity, seller_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, image_url, stock_quantity || 0, req.seller.id]
    );
    res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/seller/products — view own products
router.get("/products", verifySellerApproved, async (req, res) => {
  try {
    const [products] = await db.promise().query(
      "SELECT * FROM products WHERE seller_id = ?", [req.seller.id]
    );
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/seller/products/:id — edit a product
router.put("/products/:id", verifySellerApproved, async (req, res) => {
  const { name, description, price, image_url, stock_quantity } = req.body;

  try {
    // Make sure this product belongs to this seller
    const [rows] = await db.promise().query(
      "SELECT id FROM products WHERE id = ? AND seller_id = ?",
      [req.params.id, req.seller.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Product not found or not yours" });
    }

    await db.promise().query(
      "UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, stock_quantity = ? WHERE id = ?",
      [name, description, price, image_url, stock_quantity, req.params.id]
    );

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/seller/products/:id — delete a product
router.delete("/products/:id", verifySellerApproved, async (req, res) => {
  try {
    // Make sure this product belongs to this seller
    const [rows] = await db.promise().query(
      "SELECT id FROM products WHERE id = ? AND seller_id = ?",
      [req.params.id, req.seller.id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Product not found or not yours" });
    }

    await db.promise().query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;