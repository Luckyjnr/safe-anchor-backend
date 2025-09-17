/**
 * In-Memory OTP Storage
 * Stores OTPs temporarily in memory (not database)
 * OTPs expire after 10 minutes
 */

// In-memory storage for OTPs
const otpStorage = new Map();

/**
 * Store OTP in memory with expiration
 * @param {string} email - User's email
 * @param {string} otp - 6-digit OTP
 * @param {string} userType - Type of user (victim/expert)
 * @param {string} firstName - User's first name
 */
const storeOTP = (email, otp, userType = 'victim', firstName = 'User') => {
  const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
  
  otpStorage.set(email, {
    otp,
    userType,
    firstName,
    expiresAt: expirationTime,
    createdAt: Date.now()
  });
  
  // Clean up expired OTPs
  cleanupExpiredOTPs();
};

/**
 * Verify OTP from memory (by OTP only, no email required)
 * @param {string} inputOTP - OTP entered by user
 * @returns {object} Validation result
 */
const verifyOTP = (inputOTP) => {
  // Find OTP in storage by searching all stored OTPs
  let foundEmail = null;
  let storedData = null;
  
  for (const [email, data] of otpStorage.entries()) {
    if (data.otp.trim() === inputOTP.trim()) {
      foundEmail = email;
      storedData = data;
      break;
    }
  }
  
  if (!foundEmail || !storedData) {
    return {
      success: false,
      message: 'Invalid OTP. Please check your code and try again.'
    };
  }
  
  // Check if OTP is expired
  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(foundEmail); // Remove expired OTP
    return {
      success: false,
      message: 'OTP has expired. Please request a new verification code.'
    };
  }
  
  // OTP is valid - remove it from storage
  otpStorage.delete(foundEmail);
  
  return {
    success: true,
    message: 'OTP verified successfully.',
    email: foundEmail,
    userData: {
      userType: storedData.userType,
      firstName: storedData.firstName
    }
  };
};

/**
 * Verify OTP from memory (by email and OTP - for backward compatibility)
 * @param {string} email - User's email
 * @param {string} inputOTP - OTP entered by user
 * @returns {object} Validation result
 */
const verifyOTPByEmail = (email, inputOTP) => {
  const storedData = otpStorage.get(email);
  
  if (!storedData) {
    return {
      success: false,
      message: 'No OTP found. Please request a new verification code.'
    };
  }
  
  // Check if OTP is expired
  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(email); // Remove expired OTP
    return {
      success: false,
      message: 'OTP has expired. Please request a new verification code.'
    };
  }
  
  // Check if OTP matches
  if (inputOTP.trim() !== storedData.otp.trim()) {
    return {
      success: false,
      message: 'Invalid OTP. Please check your code and try again.'
    };
  }
  
  // OTP is valid - remove it from storage
  otpStorage.delete(email);
  
  return {
    success: true,
    message: 'OTP verified successfully.',
    userData: {
      userType: storedData.userType,
      firstName: storedData.firstName
    }
  };
};

/**
 * Check if OTP exists for email
 * @param {string} email - User's email
 * @returns {boolean} True if OTP exists and is not expired
 */
const hasValidOTP = (email) => {
  const storedData = otpStorage.get(email);
  
  if (!storedData) return false;
  
  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(email);
    return false;
  }
  
  return true;
};

/**
 * Remove OTP from storage
 * @param {string} email - User's email
 */
const removeOTP = (email) => {
  otpStorage.delete(email);
};

/**
 * Clean up expired OTPs from memory
 */
const cleanupExpiredOTPs = () => {
  const now = Date.now();
  
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
    }
  }
};

/**
 * Get storage stats (for debugging)
 * @returns {object} Storage statistics
 */
const getStorageStats = () => {
  return {
    totalOTPs: otpStorage.size,
    emails: Array.from(otpStorage.keys())
  };
};

module.exports = {
  storeOTP,
  verifyOTP,
  verifyOTPByEmail,
  hasValidOTP,
  removeOTP,
  cleanupExpiredOTPs,
  getStorageStats
};
