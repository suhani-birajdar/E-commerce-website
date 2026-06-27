const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");
const { sendSellerStatusEmail } = require("../utils/sendEmail"); // ✅ import

// Middleware to protect admin routes
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// POST /admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ message: "Admin login successful", token });
});

// GET /admin/sellers
router.get("/sellers", verifyAdmin, async (req, res) => {
  try {
    const [sellers] = await db.promise().query(
      "SELECT id, name, email, shop_name, status, created_at FROM sellers"
    );
    res.status(200).json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /admin/sellers/:id/approve
router.put("/sellers/:id/approve", verifyAdmin, async (req, res) => {
  try {
    await db.promise().query(
      "UPDATE sellers SET status = 'approved' WHERE id = ?", [req.params.id]
    );
    res.status(200).json({ message: "Seller approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /admin/sellers/:id/reject
router.put("/sellers/:id/reject", verifyAdmin, async (req, res) => {
  try {
    await db.promise().query(
      "UPDATE sellers SET status = 'rejected' WHERE id = ?", [req.params.id]
    );
    res.status(200).json({ message: "Seller rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/customers
router.get("/customers", verifyAdmin, async (req, res) => {
  try {
    const [customers] = await db.promise().query(
      "SELECT id, username, email, is_verified, created_at FROM users"
    );
    res.status(200).json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /admin/products
router.get("/products", verifyAdmin, async (req, res) => {
  try {
    const [products] = await db.promise().query(`
      SELECT p.id, p.name, p.price, p.stock_quantity, p.created_at, s.shop_name AS seller
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
    `);
    res.status(200).json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /admin/sellers/:id/status ✅ now sends email on approve/reject
router.patch("/sellers/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    await db.promise().query(
      "UPDATE sellers SET status = ? WHERE id = ?", [status, req.params.id]
    );

    // ✅ Fetch seller and send email on approve or reject
    if (status === "approved" || status === "rejected") {
      const [[seller]] = await db.promise().query(
        "SELECT name, email FROM sellers WHERE id = ?", [req.params.id]
      );
      if (seller) {
        await sendSellerStatusEmail(seller.email, seller.name, status);
      }
    }

    res.status(200).json({ message: `Seller ${status} successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;