import supabase from '../config/supabase.js';

/**
 * Middleware that verifies the session token from the Authorization header
 * or the `cf_session` cookie and attaches `req.user` if valid.
 */
export async function requireAuth(req, res, next) {
  const token =
    req.cookies?.cf_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (new Date(data.expires_at) < new Date()) {
      await supabase.from('sessions').delete().eq('token', token);
      return res.status(401).json({ error: 'Session expired' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user_id)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    console.error('[auth middleware]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Optional auth — attaches req.user if a valid token is present,
 * but allows the request through even if not authenticated.
 */
export async function optionalAuth(req, res, next) {
  const token =
    req.cookies?.cf_session ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) return next();

  try {
    const { data } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    if (data && new Date(data.expires_at) > new Date()) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user_id)
        .single();

      if (user) req.user = user;
    }
  } catch {
    // silently ignore
  }

  next();
}
