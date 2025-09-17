const express = require('express');
const router = express.Router();
const { getStorageStats } = require('../../utils/otpStorage');

// Test endpoint to check OTP storage (for debugging)
router.get('/otp-storage', (req, res) => {
  try {
    const stats = getStorageStats();
    res.json({
      message: 'OTP Storage Status',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get storage stats' });
  }
});

module.exports = router;
