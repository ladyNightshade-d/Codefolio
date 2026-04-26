import { query } from './db.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateToken } from './auth_middleware.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const cleanEmail = email.trim().toLowerCase();

  console.log(`Generating OTP for ${cleanEmail}: ${code}`);

  try {
    // Store in local verification_codes table
    await query(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [cleanEmail, code, expiresAt]
    );

    console.log('OTP saved to database successfully');

    const spacedCode = code.split('').join(' ');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #111; max-width: 600px; margin: 0 auto; padding: 60px 20px; background: #ffffff;">
        <div style="margin-bottom: 40px;">
          <div style="font-family: ui-monospace, monospace; font-weight: 800; font-size: 32px; color: #000000ff; letter-spacing: -0.05em;">&lt;/&gt;</div>
        </div>
        <h1 style="font-size: 26px; font-weight: 700; margin-bottom: 48px; letter-spacing: -0.02em;">Your verification code is</h1>
        <div style="font-size: 44px; font-weight: 700; letter-spacing: 12px; margin-bottom: 54px; color: #111; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
          ${spacedCode}
        </div>
        <p style="color: #6a6a6a; font-size: 15px; line-height: 1.6; max-width: 400px; margin: 0 auto 60px;">
          This code will expire in 5 minutes.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Codefolio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your verification code is ${code}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Auth logic error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyCode = async (email, code) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.replace(/\s/g, ''); 
  
  try {
    const result = await query(
      'SELECT * FROM verification_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [cleanEmail]
    );

    const entry = result.rows[0];

    if (!entry) return { success: false, message: 'No code found for this email' };
    
    if (new Date(entry.expires_at) < new Date()) {
      return { success: false, message: 'Code has expired' };
    }
    
    if (entry.code !== cleanCode) {
      return { success: false, message: 'Invalid code' };
    }

    // Delete used code
    await query('DELETE FROM verification_codes WHERE id = $1', [entry.id]);
    
    // Find or create user
    const userResult = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    let user = userResult.rows[0];

    if (!user) {
      const username = cleanEmail.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000);
      const newUser = await query(
        `INSERT INTO users (email, name, username, avatar_url) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          cleanEmail, 
          cleanEmail.split('@')[0], 
          username, 
          `https://ui-avatars.com/api/?name=${cleanEmail.charAt(0).toUpperCase()}&background=ea4c89&color=fff&rounded=true`
        ]
      );
      user = newUser.rows[0];
    }

    const token = generateToken(user);
    
    return { success: true, user, token };
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'Database error during verification' };
  }
};

