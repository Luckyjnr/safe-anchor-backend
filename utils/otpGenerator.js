/**
 * OTP Generation and Validation Utilities
 * For Safe Anchor Backend
 */

/**
 * Generate a 6-digit OTP code
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate OTP expiration time (10 minutes from now)
 * @returns {Date} Expiration date
 */
const generateOTPExpiration = () => {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Check if OTP is expired
 * @param {Date} expirationDate - OTP expiration date
 * @returns {boolean} True if expired, false if valid
 */
const isOTPExpired = (expirationDate) => {
  if (!expirationDate) return true;
  return new Date() > new Date(expirationDate);
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} True if valid format, false otherwise
 */
const validateOTPFormat = (otp) => {
  if (!otp || typeof otp !== 'string') return false;
  return /^\d{6}$/.test(otp.trim());
};

/**
 * Check if OTP matches and is not expired
 * @param {string} inputOTP - User input OTP
 * @param {string} storedOTP - Stored OTP in database
 * @param {Date} expirationDate - OTP expiration date
 * @returns {object} Validation result with success and message
 */
const validateOTP = (inputOTP, storedOTP, expirationDate) => {
  // Check if OTP format is valid
  if (!validateOTPFormat(inputOTP)) {
    return {
      success: false,
      message: 'Invalid OTP format. Please enter a 6-digit code.'
    };
  }

  // Check if OTP exists
  if (!storedOTP) {
    return {
      success: false,
      message: 'No OTP found. Please request a new verification code.'
    };
  }

  // Check if OTP is expired
  if (isOTPExpired(expirationDate)) {
    return {
      success: false,
      message: 'OTP has expired. Please request a new verification code.'
    };
  }

  // Check if OTP matches
  if (inputOTP.trim() !== storedOTP.trim()) {
    return {
      success: false,
      message: 'Invalid OTP. Please check your code and try again.'
    };
  }

  return {
    success: true,
    message: 'OTP verified successfully.'
  };
};

/**
 * Clear OTP from user record
 * @param {Object} user - User document
 * @returns {Object} Updated user document
 */
const clearOTP = (user) => {
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpires = undefined;
  return user;
};

module.exports = {
  generateOTP,
  generateOTPExpiration,
  isOTPExpired,
  validateOTPFormat,
  validateOTP,
  clearOTP
};
