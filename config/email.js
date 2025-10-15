const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // your 16-character app password
  }
});

// Debug connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail connection failed:', error);
  } else {
    console.log('✅ Gmail SMTP connection successful!');
  }
});


module.exports = transporter;