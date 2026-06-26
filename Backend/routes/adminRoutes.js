const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

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

  // Check against hardcoded admin credentials from .env
  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  // Issue JWT with role admin
  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ message: "Admin login successful", token });
});

// GET /admin/sellers — get all sellers
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

module.exports = router;