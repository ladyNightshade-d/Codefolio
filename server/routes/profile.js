import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/profile
 * Returns the authenticated user's full profile.
 */
router.get('/', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

/**
 * PUT /api/profile
 * Updates the authenticated user's profile.
 * Body: partial user fields (name, role, location, headline, bio, skills, specialties, contact, education, image)
 */
router.put('/', requireAuth, async (req, res) => {
  const {
    name, role, location, headline, bio,
    skills, specialties, image,
    contact, education,
    username,
  } = req.body;

  const updates = {};

  if (name !== undefined) updates.name = name.trim();
  if (role !== undefined) updates.role = role.trim();
  if (location !== undefined) updates.location = location.trim();
  if (headline !== undefined) updates.headline = headline.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (Array.isArray(skills)) updates.skills = skills;
  if (Array.isArray(specialties)) updates.specialties = specialties;
  if (image !== undefined) updates.image = image;
  if (contact !== undefined) updates.contact = contact;
  if (Array.isArray(education)) updates.education = education;

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    // Check uniqueness
    const { data: taken } = await supabase
      .from('users')
      .select('id')
      .eq('username', normalizedUsername)
      .neq('id', req.user.id)
      .maybeSingle();

    if (taken) return res.status(400).json({ error: 'Username already taken.' });
    updates.username = normalizedUsername;
  }

  updates.updated_at = new Date().toISOString();

  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: updated });
  } catch (err) {
    console.error('[profile/PUT /]', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * PUT /api/profile/notifications
 * Updates notification preferences.
 */
router.put('/notifications', requireAuth, async (req, res) => {
  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update({ notifications: req.body, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ user: updated });
  } catch (err) {
    console.error('[profile/PUT /notifications]', err);
    res.status(500).json({ error: 'Failed to update notification preferences.' });
  }
});

/**
 * DELETE /api/profile
 * Permanently deletes the authenticated user's account and all their data.
 */
router.delete('/', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete all user's project team memberships
    const { data: ownedProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', userId);

    if (ownedProjects?.length) {
      const ids = ownedProjects.map((p) => p.id);
      await supabase.from('project_team_members').delete().in('project_id', ids);
      await supabase.from('projects').delete().in('id', ids);
    }

    await supabase.from('sessions').delete().eq('user_id', userId);
    await supabase.from('otp_codes').delete().eq('email', req.user.email);
    await supabase.from('users').delete().eq('id', userId);

    res.clearCookie('cf_session');
    res.json({ success: true });
  } catch (err) {
    console.error('[profile/DELETE /]', err);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

export default router;
