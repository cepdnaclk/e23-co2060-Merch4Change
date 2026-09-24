import nodemailer from "nodemailer";

// heads-up mail sent to the CURRENT email address when someone requests
// to change it, so the account owner has a chance to react if it wasn't them.
const user = process.env.EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: user,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {string} toEmail - the CURRENT (old) email address on the account
 * @param {string} newEmail - the email address the change was requested to
 */
const sendEmailChangeAlertEmail = async (toEmail, newEmail) => {
  await transporter.sendMail({
    from: `"Merch4Change" <${user}>`,
    to: toEmail,
    subject: "Email change requested on your Merch4Change account",
    html: `
      <h2>Email Change Requested</h2>
      <p>Someone requested to change the email on your account to <strong>${newEmail}</strong>.</p>
      <p>The change will only take effect once a verification code sent to that new address is confirmed.</p>
      <p>If this wasn't you, please change your password immediately and review your account security settings.</p>
    `,
  });
};

export default sendEmailChangeAlertEmail;
