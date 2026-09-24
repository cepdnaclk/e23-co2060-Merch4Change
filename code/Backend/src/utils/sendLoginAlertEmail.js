import nodemailer from "nodemailer";

// login alert mail
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

/**
 * Sends a "new login" alert email to the account owner.
 * @param {string} toEmail - recipient's email address
 * @param {{ device?: string, ip?: string, time?: Date }} details
 */
const sendLoginAlertEmail = async (toEmail, { device, ip, time } = {}) => {
  const formattedTime = (time || new Date()).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = "New login to your Merch4Change account";
  const html = `
      <h2>New Login Detected</h2>
      <p>We noticed a new login to your account.</p>
      <ul>
        <li><strong>Time:</strong> ${formattedTime}</li>
        <li><strong>Device:</strong> ${device || "Unknown device"}</li>
        <li><strong>IP address:</strong> ${ip || "Unknown"}</li>
      </ul>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you don't recognize this activity, please change your password immediately and review your account security settings.</p>
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
    console.error(`[EMAIL ERROR] Failed to send login alert email to ${toEmail}:`, err.message);
    throw err;
  }
};

export default sendLoginAlertEmail;
