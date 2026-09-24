import nodemailer from "nodemailer";

// heads-up mail sent to the CURRENT email address when someone requests
// to change it, so the account owner has a chance to react if it wasn't them.
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
 * @param {string} toEmail - the CURRENT (old) email address on the account
 * @param {string} newEmail - the email address the change was requested to
 */
const sendEmailChangeAlertEmail = async (toEmail, newEmail) => {
  const subject = "Email change requested on your Merch4Change account";
  const html = `
      <h2>Email Change Requested</h2>
      <p>Someone requested to change the email on your account to <strong>${newEmail}</strong>.</p>
      <p>The change will only take effect once a verification code sent to that new address is confirmed.</p>
      <p>If this wasn't you, please change your password immediately and review your account security settings.</p>
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
    console.error(`[EMAIL ERROR] Failed to send email change alert to ${toEmail}:`, err.message);
    throw err;
  }
};

export default sendEmailChangeAlertEmail;
