import { Router } from 'express';
import crypto from 'crypto';
import supabase from '../config/supabase.js';
import { sendOtpEmail } from '../services/mailer.js';

const router = Router();

const OTP_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_DAYS = 30;

function generateOtp() {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

function generateSessionToken() {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * POST /api/auth/send-otp
 * Body: { email: string }
 * Sends a 6-digit OTP to the provided email.
 */
router.post('/send-otp', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  try {
    // Rate-limit: max 3 OTP requests per email per 10 minutes
    const windowStart = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('otp_codes')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', windowStart);

    if (countError) throw countError;

    if ((count ?? 0) >= 3) {
      return res.status(429).json({ error: 'Too many requests. Please wait before requesting a new code.' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // Delete existing unused codes AFTER the rate-limit check passes
    await supabase.from('otp_codes').delete().eq('email', email).eq('used', false);

    // Insert new code
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({ email, code, expires_at: expiresAt, used: false });

    if (insertError) throw insertError;

    await sendOtpEmail(email, code);

    res.json({ success: true, message: 'Access code sent. Check your inbox.' });
  } catch (err) {
    console.error('[auth/send-otp]', err);
    res.status(500).json({ error: 'Failed to send access code. Please try again.' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { email: string, code: string }
 * Verifies the OTP, creates or finds the user, returns a session token.
 */
router.post('/verify-otp', async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const code = req.body?.code?.trim();

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  try {
    // Find the most recent valid OTP for this email
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return res.status(401).json({ error: 'Invalid or expired access code.' });
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    // Find or create user
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      const slug = email.split('@')[0].replace(/[^a-z0-9]+/g, '-');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          slug,
          username: slug,
          name: slug,
          role: 'Engineering Student',
          location: '',
          headline: '',
          bio: '',
          skills: [],
          specialties: [],
          image: '',
        })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, token, expires_at: expiresAt });

    if (sessionError) throw sessionError;

    // Set httpOnly cookie
    res.cookie('cf_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    // Return user (without sensitive fields) + token for SPA storage
    const { ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error('[auth/verify-otp]', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

/**
 * POST /api/auth/logout
 * Deletes the current session.
 */
router.post('/logout', async (req, res) => {
  const token =
    req.cookies?.cf_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (token) {
    await supabase.from('sessions').delete().eq('token', token);
    res.clearCookie('cf_session');
  }

  res.json({ success: true });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user.
 */
router.get('/me', async (req, res) => {
  const token =
    req.cookies?.cf_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const { data: session } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      res.clearCookie('cf_session');
      return res.status(401).json({ error: 'Session expired' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
