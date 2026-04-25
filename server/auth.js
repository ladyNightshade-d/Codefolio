import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase Client for Backend
// Note: In a real app, use the SUPABASE_SERVICE_ROLE_KEY for backend operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Fallback to anon key for now
);

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
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes
  const cleanEmail = email.trim().toLowerCase();

  console.log(`Generating OTP for ${cleanEmail}: ${code}`);

  // Store in Supabase verification_codes table
  const { error: dbError } = await supabase
    .from('verification_codes')
    .insert({ email: cleanEmail, code, expires_at: expiresAt });

  if (dbError) {
    console.error('DATABASE ERROR:', dbError);
    return { success: false, error: dbError.message };
  }

  console.log('OTP saved to database successfully');

  const spacedCode = code.split('').join(' ');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #111; max-width: 600px; margin: 0 auto; padding: 60px 20px; background: #ffffff;">
      <div style="margin-bottom: 40px;">
        <div style="font-family: ui-monospace, monospace; font-weight: 800; font-size: 32px; color: #000000ff; letter-spacing: -0.05em;">&lt;/&gt;</div>
      </div>
      
      <div style="margin-bottom: 40px;">
        <img src="https://ui-avatars.com/api/?name=${email.charAt(0).toUpperCase()}&background=ea4c89&color=fff&rounded=true&size=128" alt="User" style="width: 64px; height: 64px; border-radius: 50%;" />
      </div>

      <h1 style="font-size: 26px; font-weight: 700; margin-bottom: 48px; letter-spacing: -0.02em;">Your verification code is</h1>
      
      <div style="font-size: 44px; font-weight: 700; letter-spacing: 12px; margin-bottom: 54px; color: #111; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
        ${spacedCode}
      </div>

      <p style="color: #6a6a6a; font-size: 15px; line-height: 1.6; max-width: 400px; margin: 0 auto 60px;">
        This code will expire in 5 minutes. If you didn't request this, you can safely ignore this email. Need help? <a href="#" style="color: #ea4c89; text-decoration: none; font-weight: 500;">Contact support</a>.
      </p>

      <div style="font-size: 12px; color: #b0b0b0; border-top: 1px solid #f0f0f0; padding-top: 30px;">
        Korvex Technologies. • Kigali, Rwanda
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Codefolio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your verification code is ${code}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const verifyCode = async (email, code) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.replace(/\s/g, ''); // Remove all whitespace
  
  console.log(`Verifying code for ${cleanEmail}: Attempting with ${cleanCode}`);

  // Fetch from Supabase
  const { data: entry, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', cleanEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !entry) {
    console.log('No entry found in DB or error:', error);
    return { success: false, message: 'No code found for this email' };
  }
  
  console.log('Found entry in DB:', entry);
  
  const expiresAt = new Date(entry.expires_at).getTime();
  const now = Date.now();
  console.log(`Checking expiry: expiresAt=${expiresAt}, now=${now}`);

  if (expiresAt < now) {
    console.log('Code expired');
    return { success: false, message: 'Code has expired' };
  }
  
  console.log(`Comparing codes: db_code="${entry.code}", user_code="${cleanCode}"`);
  if (entry.code !== cleanCode) {
    console.log('Code mismatch');
    return { success: false, message: 'Invalid code' };
  }

  // Delete used code
  await supabase.from('verification_codes').delete().eq('id', entry.id);
  
  return { success: true };
};
