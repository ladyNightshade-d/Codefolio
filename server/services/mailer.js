import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends a one-time access code to the given email address.
 * @param {string} email  - Recipient email
 * @param {string} code   - 6-digit OTP code
 */
export async function sendOtpEmail(email, code) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from: `"Codefolio" <${from}>`,
    to: email,
    subject: 'Your Codefolio access code',
    text: `Your access code is: ${code}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 32px;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.2 7.1 2.3 12l3.9 4.9" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.2 4.1 10 19.9" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="m17.8 7.1 3.9 4.9-3.9 4.9" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span style="font-size: 15px; font-weight: 700; letter-spacing: -0.03em;">Codefolio</span>
        </div>
        <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; letter-spacing: -0.04em; color: #111;">Your access code</h1>
        <p style="margin: 0 0 24px; color: #666; font-size: 14px; line-height: 1.6;">Use the code below to sign in to your Codefolio account. It expires in 10 minutes.</p>
        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.15em; color: #111;">${code}</span>
        </div>
        <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.6;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  });
}
