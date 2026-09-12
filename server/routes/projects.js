import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/projects
 * Returns published projects. If authenticated, also returns the user's drafts.
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        project_team_members(slug, name, role, image),
        users!projects_owner_id_fkey(slug, name, image, role)
      `)
      .order('updated_at', { ascending: false });

    if (req.user) {
      // Authenticated: return published projects + own drafts
      query = query.or(`visibility.eq.published,and(visibility.eq.draft,owner_id.eq.${req.user.id})`);
    } else {
      query = query.eq('visibility', 'published');
    }

    // Optional filters
    if (req.query.owner) query = query.eq('owner_id', req.query.owner);
    if (req.query.status) query = query.eq('status', req.query.status);
    if (req.query.search) {
      const term = `%${req.query.search}%`;
      query = query.or(`title.ilike.${term},summary.ilike.${term},stack.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ projects: data || [] });
  } catch (err) {
    console.error('[projects/GET /]', err);
    res.status(500).json({ error: 'Failed to fetch projects.' });
  }
});

/**
 * GET /api/projects/:slug
 * Returns a single project by slug.
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_team_members(slug, name, role, image),
        users!projects_owner_id_fkey(slug, name, image, role)
      `)
      .eq('slug', req.params.slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Project not found.' });

    // Only allow draft access to owner
    if (data.visibility === 'draft') {
      if (!req.user || req.user.id !== data.owner_id) {
        return res.status(404).json({ error: 'Project not found.' });
      }
    }

    res.json({ project: data });
  } catch (err) {
    console.error('[projects/GET /:slug]', err);
    res.status(500).json({ error: 'Failed to fetch project.' });
  }
});

/**
 * POST /api/projects
 * Creates a new project. Requires auth.
 * Body: project fields + optional team array
 */
router.post('/', requireAuth, async (req, res) => {
  const {
    title, summary, stack, tech_stack, status, cohort, course,
    problem, solution, innovations, visibility, repository_url,
    live_demo_url, feedback_requested, collections, tags,
    image, gallery, team,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ error: 'Project title is required.' });
  }

  try {
    const baseSlug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Ensure slug uniqueness
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        slug,
        title: title.trim(),
        summary: summary?.trim() || '',
        stack: stack?.trim() || (Array.isArray(tech_stack) ? tech_stack.join(' · ') : ''),
        tech_stack: Array.isArray(tech_stack) ? tech_stack : [],
        status: status || 'In Review',
        cohort: cohort?.trim() || String(new Date().getFullYear()),
        course: course?.trim() || 'Independent Project',
        problem: Array.isArray(problem) ? problem : [problem || ''],
        solution: Array.isArray(solution) ? solution : [solution || ''],
        innovations: Array.isArray(innovations) ? innovations : [],
        visibility: visibility || 'draft',
        repository_url: repository_url?.trim() || '',
        live_demo_url: live_demo_url?.trim() || '',
        feedback_requested: Boolean(feedback_requested),
        collections: Array.isArray(collections) ? collections : [],
        tags: Array.isArray(tags) ? tags : [],
        image: image || '',
        gallery: Array.isArray(gallery) ? gallery : [],
        owner_id: req.user.id,
        review_average: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Insert team members
    if (Array.isArray(team) && team.length) {
      const teamRows = team.map((m) => ({
        project_id: project.id,
        slug: m.slug || '',
        name: m.name || '',
        role: m.role || 'Contributor',
        image: m.image || '',
      }));
      await supabase.from('project_team_members').insert(teamRows);
    }

    res.status(201).json({ project });
  } catch (err) {
    console.error('[projects/POST /]', err);
    res.status(500).json({ error: 'Failed to create project.' });
  }
});

/**
 * PUT /api/projects/:slug
 * Updates a project. Only the owner can update.
 */
router.put('/:slug', requireAuth, async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('slug', req.params.slug)
      .single();

    if (findError || !existing) return res.status(404).json({ error: 'Project not found.' });
    if (existing.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    const allowedFields = [
      'title', 'summary', 'stack', 'tech_stack', 'status', 'cohort', 'course',
      'problem', 'solution', 'innovations', 'visibility', 'repository_url',
      'live_demo_url', 'feedback_requested', 'collections', 'tags', 'image', 'gallery',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    updates.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Replace team members if provided
    if (Array.isArray(req.body.team)) {
      await supabase.from('project_team_members').delete().eq('project_id', existing.id);
      if (req.body.team.length) {
        const teamRows = req.body.team.map((m) => ({
          project_id: existing.id,
          slug: m.slug || '',
          name: m.name || '',
          role: m.role || 'Contributor',
          image: m.image || '',
        }));
        await supabase.from('project_team_members').insert(teamRows);
      }
    }

    res.json({ project: updated });
  } catch (err) {
    console.error('[projects/PUT /:slug]', err);
    res.status(500).json({ error: 'Failed to update project.' });
  }
});

/**
 * DELETE /api/projects/:slug
 * Deletes a project. Only the owner can delete.
 */
router.delete('/:slug', requireAuth, async (req, res) => {
  try {
    const { data: existing, error: findError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('slug', req.params.slug)
      .single();

    if (findError || !existing) return res.status(404).json({ error: 'Project not found.' });
    if (existing.owner_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

    await supabase.from('project_team_members').delete().eq('project_id', existing.id);
    await supabase.from('projects').delete().eq('id', existing.id);

    res.json({ success: true });
  } catch (err) {
    console.error('[projects/DELETE /:slug]', err);
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

export default router;
