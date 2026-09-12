import { Router } from 'express';
import supabase from '../config/supabase.js';
import { chatWithGemini } from '../services/gemini.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Simple in-memory rate limiter: max 20 requests per IP per minute
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const record = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - record.start > windowMs) {
    record.count = 1;
    record.start = now;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);
  return record.count <= maxRequests;
}

/**
 * POST /api/ai/chat
 * Body: { message: string, history?: [{role: 'user'|'assistant', text: string}] }
 * Returns: { reply: string }
 */
router.post('/chat', optionalAuth, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const message = req.body?.message?.trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message is too long (max 2000 characters).' });
  }

  try {
    // Load published projects for context
    const { data: projects } = await supabase
      .from('projects')
      .select(`
        title, stack, tech_stack, summary, status, cohort, course,
        project_team_members(name, role)
      `)
      .eq('visibility', 'published')
      .order('updated_at', { ascending: false })
      .limit(50);

    const reply = await chatWithGemini(message, history, projects || []);

    res.json({ reply });
  } catch (err) {
    console.error('[ai/chat]', err);

    if (err.message?.includes('GOOGLE_API_KEY')) {
      return res.status(503).json({ error: 'AI service is not configured. Please set up a Google API key.' });
    }

    res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
});

export default router;
