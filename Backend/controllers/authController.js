const bcrypt = require("bcrypt");
const db = require("../db");
const { sendOtpEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate a 6-digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now

    const sql =
      "INSERT INTO users (username, password, email, otp, otp_expiry) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, hashedPassword, email, otp, otpExpiry], async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Registration failed", error: err });
      }

      try {
        await sendOtpEmail(email, otp);
        res.json({ message: "OTP sent to your email. Please verify to complete registration." });
      } catch (emailErr) {
        console.log(emailErr);
        res.status(500).json({ message: "User created but failed to send OTP email" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Login failed", error: err });

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const user = result[0];

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  });
};

const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong", error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expiry)) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    const updateSql =
      "UPDATE users SET is_verified = true, otp = NULL, otp_expiry = NULL WHERE email = ?";

    db.query(updateSql, [email], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Verification failed", error: updateErr });

      res.json({ message: "Email verified successfully! You can now log in." });
    });
  });
};

const resendOtp = async (req, res) => {
  const { email } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong", error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const updateSql = "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";

    db.query(updateSql, [otp, otpExpiry, email], async (updateErr) => {
      if (updateErr) return res.status(500).json({ message: "Failed to resend OTP", error: updateErr });

      try {
        await sendOtpEmail(email, otp);
        res.json({ message: "New OTP sent to your email" });
      } catch (emailErr) {
        res.status(500).json({ message: "Failed to send OTP email", error: emailErr });
      }
    });
  });
};

const getMe = (req, res) => {
  res.json({ message: "You are logged in!", user: req.user });
};

module.exports = { register, login, verifyOtp, resendOtp, getMe };