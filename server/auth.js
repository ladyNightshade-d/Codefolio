import { query } from './db.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateToken } from './auth_middleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

export const sendVerificationCode = async (email, baseUrl = '') => {
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

    let avatarHtml = '';
    try {
      const userResult = await query('SELECT avatar_url FROM users WHERE email = $1', [cleanEmail]);
      const user = userResult.rows[0];
      if (user && user.avatar_url && !user.avatar_url.includes('ui-avatars.com')) {
        const avatarPath = user.avatar_url;
        if (avatarPath.startsWith('/uploads/')) {
          // Read file from disk and convert to base64 so Gmail can display it
          const __dirname = path.dirname(fileURLToPath(import.meta.url));
          const filePath = path.join(__dirname, 'public', avatarPath);
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const ext = path.extname(filePath).slice(1).replace('jpg', 'jpeg');
            const mimeType = `image/${ext || 'jpeg'}`;
            const base64 = fileBuffer.toString('base64');
            const dataUri = `data:${mimeType};base64,${base64}`;
            avatarHtml = `
            <div style="margin: 0 auto 40px auto; text-align: center;">
              <img src="${dataUri}" alt="Profile Picture" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; display: block; margin: 0 auto;" />
            </div>
            `;
          }
        }
      }
    } catch (e) {
      console.error('Error fetching user avatar for email:', e);
    }

    if (!avatarHtml) {
      const firstLetter = cleanEmail.charAt(0).toUpperCase();
      avatarHtml = `
        <div style="width: 56px; height: 56px; background-color: #e84d7d; color: #ffffff; border-radius: 50%; margin: 0 auto 40px auto; font-size: 24px; line-height: 56px; text-align: center; font-weight: normal;">
          ${firstLetter}
        </div>
      `;
    }

    const spacedCode = code.split('').join(' ');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #111; max-width: 600px; margin: 0 auto; padding: 60px 20px; background: #ffffff;">
        <div style="margin-bottom: 40px;">
          <div style="font-family: ui-monospace, monospace; font-weight: 800; font-size: 32px; color: #000; letter-spacing: -0.05em;">&lt;/&gt;</div>
        </div>
        
        ${avatarHtml}

        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 48px; letter-spacing: -0.02em;">Your verification code is</h1>
        
        <div style="font-size: 40px; font-weight: 700; letter-spacing: 16px; margin-bottom: 54px; color: #111; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; padding-left: 16px;">
          ${spacedCode}
        </div>
        
        <p style="color: #6a6a6a; font-size: 14px; line-height: 1.6; max-width: 400px; margin: 0 auto 60px;">
          This code will expire in 5 minutes. If you didn't request this,<br/>you can safely ignore this email. Need help? <a href="#" style="color: #e84d7d; text-decoration: none;">Contact<br/>support.</a>
        </p>

        <hr style="border: none; border-top: 1px solid #f0f0f0; margin-bottom: 30px;" />
        
        <p style="color: #a0a0a0; font-size: 12px;">
          Korvex Technologies. &bull; Kigali, Rwanda
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

