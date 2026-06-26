const express = require("express");
const router = express.Router();
const { register, login, verifyOtp, resendOtp, getMe } = require("../controllers/authController");
const verifyToken = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend_otp", resendOtp);
router.get("/me", verifyToken, getMe);

module.exports = router;