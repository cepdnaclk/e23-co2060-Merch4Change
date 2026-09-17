import nodemailer from "nodemailer";

// src/utils/sendOtpEmail.js, sendLoginAlertEmail.js, and
// sendEmailChangeAlertEmail.js each construct their own
// nodemailer.createTransport(...) instance at import time, so there's no
// single object to inject/mock from a test. But every transporter nodemailer
// creates shares the same underlying Mail prototype, so patching
// sendMail there once — even after those transporters already exist —
// intercepts every send. This keeps controller/constructor tests fast and
// offline instead of depending on live Gmail credentials.
let patched = false;

export const mockEmailTransport = () => {
  if (patched) return;

  const probe = nodemailer.createTransport({ jsonTransport: true });
  const mailPrototype = Object.getPrototypeOf(probe);

  mailPrototype.sendMail = async (data) => ({
    accepted: [data?.to],
    rejected: [],
    response: "250 mocked",
  });

  patched = true;
};
