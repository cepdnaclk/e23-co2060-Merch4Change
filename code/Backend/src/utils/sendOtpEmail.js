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

const sendViaResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Merch4Change <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errorBody}`);
  }

  return res.json();
};

const sendOtpEmail = async (toEmail, otp) => {
  const subject = "Your Verification Code";
  const html = `
        <h2>Email Verification</h2>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>This code expires in ${process.env.OTP_EXPIRE_MIN || 10} minutes.</p>
      `;

  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend({ to: toEmail, subject, html });
      return;
    }

    await transporter.sendMail({
      from: `"Merch4Change" <${user}>`,
      to: toEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP email to ${toEmail}:`, err.message);
    throw err;
  }
};

export default sendOtpEmail;
