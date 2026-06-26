const express = require("express");
const router = express.Router();
const { addToCart, getCart, updateQuantity, removeFromCart } = require("../controllers/cartController");
const verifyToken = require("../middleware/auth");

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/update/:id", verifyToken, updateQuantity);
router.delete("/remove/:id", verifyToken, removeFromCart);

module.exports = router;