import nodemailer from "nodemailer";

// otp sender mail
const user = process.env.EMAIL_USER;
const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || "465", 10);
const secure = process.env.SMTP_SECURE !== undefined
  ? process.env.SMTP_SECURE === "true"
  : port === 465;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user: user,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
  tls: {
    rejectUnauthorized: false,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  try {
    await transporter.sendMail({
      from: `"Merch4Change" <${user}>`,
      to: toEmail,
      subject: "Your Verification Code",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code expires in ${process.env.OTP_EXPIRE_MIN || 10} minutes.</p>
      `,
    });
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${toEmail}:`, err.message);
    throw err;
  }
};

export default sendOtpEmail;
