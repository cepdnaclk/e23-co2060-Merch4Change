import nodemailer from "nodemailer";

// login alert mail
const user = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: process.env.EMAIL_PASS,
    },
});

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

    await transporter.sendMail({
        from: `"Merch4Change" <${user}>`,
        to: toEmail,
        subject: "New login to your Merch4Change account",
        html: `
      <h2>New Login Detected</h2>
      <p>We noticed a new login to your account.</p>
      <ul>
        <li><strong>Time:</strong> ${formattedTime}</li>
        <li><strong>Device:</strong> ${device || "Unknown device"}</li>
        <li><strong>IP address:</strong> ${ip || "Unknown"}</li>
      </ul>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you don't recognize this activity, please change your password immediately and review your account security settings.</p>
    `,
    });
};

export default sendLoginAlertEmail;