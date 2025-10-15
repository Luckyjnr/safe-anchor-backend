// config/email.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, content = {}) {
  try {
    const { text = "", html = "" } = content; // ✅ Safe destructuring

    const response = await resend.emails.send({
      from: "SafeAnchor <no-reply@safeanchor.com.ng>", // ✅ verified domain
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent successfully via Resend:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
    throw error;
  }
}

module.exports = sendEmail; // ✅ CommonJS export
