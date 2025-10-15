// routes/api/debugRoutes.js
const express = require("express");
const router = express.Router();
const sendEmail = require("../../config/email"); // ✅ CommonJS import

router.get("/debug/email", async (req, res) => {
  try {
    console.log("🚀 Testing Resend Email...");

    const info = await sendEmail(
      "luckykelimu@gmail.com",
      "✅ Test Email from Safe Anchor",
      {
        text: "Hello! Your Resend setup works perfectly 🎉",
        html: "<p>Hello! Your <b>Resend</b> setup works perfectly 🎉</p>",
      }
    );

    console.log("✅ Email sent successfully:", info);
    res.json({ msg: "Email sent successfully", info });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({
      error: "Email sending failed",
      details: error.message,
    });
  }
});

router.get("/debug/test-otp", async (req, res) => {
  const sendEmail = require("../../config/email");
  const info = await sendEmail(
    "your@gmail.com",
    "SafeAnchor OTP Test",
    {
      text: "Your OTP is 123456",
      html: "<h2>SafeAnchor OTP</h2><p>Your OTP is <b>123456</b></p>"
    }
  );
  res.json({ msg: "Sent", info });
});

module.exports = router;
