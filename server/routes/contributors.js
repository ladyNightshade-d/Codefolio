import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

/**
 * GET /api/contributors
 * Returns all public contributor profiles.
 * Optional query: ?specialty=web|mobile|ai
 */
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('users')
      .select('id, slug, username, name, role, specialties, skills, location, headline, image, contact')
      .order('name', { ascending: true });

    if (req.query.specialty) {
      query = query.contains('specialties', [req.query.specialty]);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ contributors: data || [] });
  } catch (err) {
    console.error('[contributors/GET /]', err);
    res.status(500).json({ error: 'Failed to fetch contributors.' });
  }
});

/**
 * GET /api/contributors/:slug
 * Returns a single contributor profile + their published projects.
 */
router.get('/:slug', async (req, res) => {
  try {
    // 1. Get the contributor profile
    const { data: contributor, error } = await supabase
      .from('users')
      .select('id, slug, username, name, role, specialties, skills, location, headline, image, contact, bio, education')
      .eq('slug', req.params.slug)
      .single();

    if (error || !contributor) {
      return res.status(404).json({ error: 'Contributor not found.' });
    }

    // 2. Get project IDs where this contributor is a team member
    const { data: teamRows } = await supabase
      .from('project_team_members')
      .select('project_id')
      .eq('slug', contributor.slug);

    const projectIds = (teamRows || []).map((r) => r.project_id);

    // 3. Fetch those projects (published only)
    let contributorProjects = [];
    if (projectIds.length) {
      const { data: cp } = await supabase
        .from('projects')
        .select(`
          id, slug, title, stack, tech_stack, summary, image, image_alt,
          status, cohort, tag, review_average, review_count, updated_at,
          project_team_members(slug, name, role, image)
        `)
        .in('id', projectIds)
        .eq('visibility', 'published')
        .order('updated_at', { ascending: false });

      contributorProjects = cp || [];
    }

    res.json({ contributor, projects: contributorProjects });
  } catch (err) {
    console.error('[contributors/GET /:slug]', err);
    res.status(500).json({ error: 'Failed to fetch contributor.' });
  }
});

export default router;
