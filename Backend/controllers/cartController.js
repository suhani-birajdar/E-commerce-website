const db = require("../db");

const addToCart = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;
  const qty = quantity || 1;

  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `;

  db.query(sql, [userId, product_id, qty, qty], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to add to cart", error: err });
    }
    res.json({ message: "Added to cart" });
  });
};

const getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT cart_items.id, cart_items.quantity, products.id AS product_id,
           products.name, products.price, products.image_url, products.stock_quantity
    FROM cart_items
    JOIN products ON cart_items.product_id = products.id
    WHERE cart_items.user_id = ?
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to fetch cart", error: err });
    }
    res.json(result);
  });
};

const updateQuantity = (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: "Quantity must be at least 1" });
  }

  const sql = "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?";

  db.query(sql, [quantity, cartItemId, userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to update quantity", error: err });
    }
    res.json({ message: "Quantity updated" });
  });
};

const removeFromCart = (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id;

  const sql = "DELETE FROM cart_items WHERE id = ? AND user_id = ?";

  db.query(sql, [cartItemId, userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to remove item", error: err });
    }
    res.json({ message: "Item removed from cart" });
  });
};

module.exports = { addToCart, getCart, updateQuantity, removeFromCart };