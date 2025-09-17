/**
 * Email Templates for Safe Anchor Backend
 * Blue and White Design Theme
 */

/**
 * Generate OTP verification email template
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 * @param {string} userType - Type of user (victim/expert)
 * @returns {string} HTML email template
 */
const generateOTPEmailTemplate = (otp, userName = 'User', userType = 'user') => {
  const userTypeText = userType === 'expert' ? 'Expert' : 'User';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Safe Anchor</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .welcome-text {
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .instruction-text {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .otp-container {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
        }
        .otp-label {
            color: #1e40af;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #1e40af;
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        .expiry-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
        }
        .security-notice {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            color: #374151;
            font-size: 14px;
            text-align: left;
        }
        .security-notice h3 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .security-notice ul {
            margin: 0;
            padding-left: 20px;
        }
        .security-notice li {
            margin-bottom: 5px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Safe Anchor</h1>
            <p>Email Verification Required</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                Welcome to Safe Anchor, ${userName}!
            </div>
            
            <div class="instruction-text">
                To complete your ${userTypeText} registration and secure your account, please verify your email address using the code below.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
                ⏰ This code will expire in <strong>10 minutes</strong> for your security.
            </div>
            
            <div class="instruction-text">
                Enter this code in the verification form on our website to complete your registration.
            </div>
            
            <div class="security-notice">
                <h3>🛡️ Security Information</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>Safe Anchor will never ask for your verification code via phone or email</li>
                    <li>If you didn't request this verification, please ignore this email</li>
                    <li>For security reasons, this code expires automatically</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by <strong>Safe Anchor</strong><br>
                If you have any questions, please contact our support team.<br>
                <a href="https://safe-anchor-web-page.vercel.app">Visit Safe Anchor</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

/**
 * Generate password reset OTP email template
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 * @returns {string} HTML email template
 */
const generatePasswordResetOTPTemplate = (otp, userName = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Safe Anchor</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .welcome-text {
            color: #1f2937;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .instruction-text {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .otp-container {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px solid #ef4444;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            position: relative;
        }
        .otp-label {
            color: #dc2626;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            color: #dc2626;
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        .expiry-notice {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
        }
        .security-notice {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            color: #374151;
            font-size: 14px;
            text-align: left;
        }
        .security-notice h3 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .security-notice ul {
            margin: 0;
            padding-left: 20px;
        }
        .security-notice li {
            margin-bottom: 5px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Safe Anchor</h1>
            <p>Password Reset Request</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                Password Reset Request, ${userName}
            </div>
            
            <div class="instruction-text">
                You requested to reset your password. Use the code below to verify your identity and reset your password.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">Your Reset Code</div>
                <div class="otp-code">${otp}</div>
            </div>
            
            <div class="expiry-notice">
                ⏰ This code will expire in <strong>10 minutes</strong> for your security.
            </div>
            
            <div class="instruction-text">
                Enter this code in the password reset form on our website to continue.
            </div>
            
            <div class="security-notice">
                <h3>🛡️ Security Information</h3>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>If you didn't request this password reset, please ignore this email</li>
                    <li>Your account remains secure until you complete the reset process</li>
                    <li>For security reasons, this code expires automatically</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by <strong>Safe Anchor</strong><br>
                If you have any questions, please contact our support team.<br>
                <a href="https://safe-anchor-web-page.vercel.app">Visit Safe Anchor</a>
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  generateOTPEmailTemplate,
  generatePasswordResetOTPTemplate
};
