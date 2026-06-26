const db = require("../db");

const getAllProducts = (req, res) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to fetch products", error: err });
    }

    res.json(result);
  });
};

module.exports = { getAllProducts };