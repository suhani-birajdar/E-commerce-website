const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Existing OTP email
const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Verify your VESTRA account",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP for VESTRA registration is:</p>
      <h1 style="letter-spacing: 4px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// New: Seller approval/rejection email
const sendSellerStatusEmail = async (toEmail, sellerName, status) => {
  const isApproved = status === "approved";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: isApproved
      ? "🎉 Your VESTRA Seller Account is Approved!"
      : "Update on your VESTRA Seller Application",
    html: isApproved
      ? `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e8e6e1; border-radius: 12px;">
          <h2 style="color: #1D9E75;">Welcome to VESTRA, ${sellerName}! 🎉</h2>
          <p style="color: #444;">Great news — your seller account has been <strong>approved</strong> by our admin team.</p>
          <p style="color: #444;">You can now log in to your seller dashboard and start listing your products.</p>
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display:inline-block; margin-top: 20px; padding: 12px 28px; background: #1D9E75; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to Seller Dashboard
          </a>
          <p style="margin-top: 28px; font-size: 13px; color: #999;">— The VESTRA Team</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e8e6e1; border-radius: 12px;">
          <h2 style="color: #1a1a1a;">Update on your VESTRA Application</h2>
          <p style="color: #444;">Hi ${sellerName}, unfortunately your seller application has been <strong>rejected</strong> at this time.</p>
          <p style="color: #444;">If you believe this is a mistake or would like to reapply, please contact our support team.</p>
          <p style="margin-top: 28px; font-size: 13px; color: #999;">— The VESTRA Team</p>
        </div>
      `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendSellerStatusEmail };