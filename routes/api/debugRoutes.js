// routes/debugRoutes.js
const express = require('express');
const router = express.Router();
const transporter = require('../../config/email');

router.get('/debug/email', async (req, res) => {
  try {
    console.log('📦 Testing Gmail SMTP...');
    const info = await transporter.sendMail({
      from: `"Safe Anchor" <${process.env.GMAIL_FROM_EMAIL}>`,
      to: process.env.GMAIL_USER, // send test to yourself
      subject: '🔧 Gmail Production Debug',
      text: 'This is a test email from your deployed backend.',
    });

    console.log('✅ Email sent successfully:', info.response);
    res.json({ msg: 'Email sent successfully', info });
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
