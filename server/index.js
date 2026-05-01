import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from 'multer';

import { query } from './db.js';
import { authenticateToken, generateToken } from './auth_middleware.js';
import { sendVerificationCode, verifyCode } from './auth.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// AI Setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());
app.use('/uploads', express.static(uploadDir));

// Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const googleId = profile.id;
      const name = profile.displayName;
      const avatarUrl = profile.photos[0]?.value;

      // Check if user exists by google_id
      let result = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
      let user = result.rows[0];

      if (!user) {
        // Check if user exists by email (to link account)
        result = await query('SELECT * FROM users WHERE email = $1', [email]);
        user = result.rows[0];

        if (user) {
          // Link google_id to existing account
          await query('UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3', [googleId, avatarUrl, user.id]);
          user.google_id = googleId;
        } else {
          // Create new user
          const username = email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000);
          const newUser = await query(
            `INSERT INTO users (email, name, username, avatar_url, google_id) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [email, name, username, avatarUrl, googleId]
          );
          user = newUser.rows[0];
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running with PostgreSQL', timestamp: new Date() });
});

// AI Chat Endpoint
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { messages } = req.body;
  const userId = req.user.id;
  
  if (!messages) return res.status(400).json({ error: 'Messages are required' });

  try {
    const lastMessage = messages[messages.length - 1].text;
    
    // Fetch projects context from SQL
    const projectsResult = await query(
      'SELECT title, summary, tech_stack FROM projects WHERE visibility = $1',
      ['published']
    );
    const projects = projectsResult.rows;
      
    const projectContext = projects && projects.length > 0 
      ? projects.map(p => `- ${p.title}: ${p.summary} [Tech: ${p.tech_stack?.join(', ')}]`).join('\n')
      : 'Currently, there are no published projects on the platform.';

    const systemPrompt = `You are Copilot, the AI assistant for Codefolio.
    Access to real projects:
    ${projectContext}
    Rules: 1. Only discuss listed projects. 2. Professional and concise.`;
    
    const prompt = `${systemPrompt}\n\nUser: ${lastMessage}`;
    
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      return res.json({ text: "AI is in demo mode. Check API key.", role: 'assistant' });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save to local DB
    await query(
      'INSERT INTO chat_messages (user_id, role, content) VALUES ($1, $2, $3), ($1, $4, $5)',
      [userId, 'user', lastMessage, 'assistant', text]
    );

    res.json({ text, role: 'assistant' });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Chat History
app.get('/api/ai/history', authenticateToken, async (req, res) => {
  const result = await query(
    'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
    [req.user.id]
  );
  res.json(result.rows);
});

// Chat History by userId (for loading a specific chat)
app.get('/api/ai/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { query: searchQuery } = req.query;
    let result;
    if (searchQuery) {
      result = await query(
        `SELECT * FROM chat_messages
         WHERE user_id = $1 AND content ILIKE $2
         ORDER BY created_at ASC`,
        [req.user.id, `%${searchQuery}%`]
      );
    } else {
      result = await query(
        'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent Chat Titles
app.get('/api/ai/recent/:userId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT content FROM (
         SELECT DISTINCT ON (content) content, created_at
         FROM chat_messages
         WHERE user_id = $1 AND role = 'user'
         ORDER BY content, created_at DESC
       ) sub
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    );
    res.json(result.rows.map(r => r.content));
  } catch (error) {
    console.error('Recent chats error:', error);
    res.status(500).json({ error: error.message });
  }
});



// Helper to sync team members with latest user data
async function syncProjectTeam(projects) {
  const projectList = Array.isArray(projects) ? projects : [projects];
  
  // Extract all unique slugs/ids from all projects' team_members
  const userIdentifiers = new Set();
  projectList.forEach(p => {
    const team = Array.isArray(p.team_members) ? p.team_members : [];
    team.forEach(m => {
      if (m.slug) userIdentifiers.add(m.slug);
    });
    // Also include author
    if (p.author_id) userIdentifiers.add(p.author_id);
  });

  if (userIdentifiers.size === 0) return projects;

  // Fetch all these users
  const usersRes = await query(`
    SELECT id, username, name, avatar_url 
    FROM users 
    WHERE id::text = ANY($1) OR username = ANY($1)
  `, [Array.from(userIdentifiers)]);
  
  const userMap = {};
  usersRes.rows.forEach(u => {
    userMap[u.id] = u;
    userMap[u.username] = u;
  });

  // Map back to projects
  const synced = projectList.map(p => {
    const team = (Array.isArray(p.team_members) ? p.team_members : []).map(m => {
      const liveUser = userMap[m.slug];
      if (liveUser) {
        return { ...m, name: liveUser.name || m.name, image: liveUser.avatar_url || m.image };
      }
      return m;
    });

    // Also update the main 'users' object (author)
    const liveAuthor = userMap[p.author_id];
    const syncedUsers = liveAuthor ? {
      ...p.users,
      name: liveAuthor.name || p.users?.name,
      avatar_url: liveAuthor.avatar_url || p.users?.avatar_url
    } : p.users;

    return { ...p, team_members: team, users: syncedUsers };
  });

  return Array.isArray(projects) ? synced : synced[0];
}

// Projects Endpoints
app.get('/api/projects', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, 
             json_build_object('name', u.name, 'avatar_url', u.avatar_url, 'username', u.username) as users
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.visibility = 'published'
      ORDER BY p.created_at DESC
    `);
    const synced = await syncProjectTeam(result.rows);
    res.json(synced);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:slug', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, row_to_json(u) as users
      FROM projects p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1
    `, [req.params.slug]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const synced = await syncProjectTeam(result.rows[0]);
    res.json(synced);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Showcase Endpoints
app.get('/api/showcases', async (req, res) => {
  try {
    const showcases = await query(`
      SELECT s.*, u.name as author_name, u.avatar_url as author_avatar
      FROM showcases s
      LEFT JOIN users u ON s.author_id = u.id
      ORDER BY s.created_at DESC
    `);
    
    // For each showcase, fetch its projects
    const result = await Promise.all(showcases.rows.map(async (s) => {
      const projects = await query(`
        SELECT p.* FROM projects p
        JOIN showcase_projects sp ON p.id = sp.project_id
        WHERE sp.showcase_id = $1
      `, [s.id]);
      return { ...s, projects: projects.rows };
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/showcases', authenticateToken, async (req, res) => {
  const { title, description, image_url, platform, project_ids } = req.body;
  try {
    const result = await query(`
      INSERT INTO showcases (title, description, image_url, platform, author_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [title, description, image_url, platform || 'web', req.user.id]);
    
    const showcase = result.rows[0];
    
    if (project_ids && Array.isArray(project_ids)) {
      for (const pid of project_ids) {
        await query(`INSERT INTO showcase_projects (showcase_id, project_id) VALUES ($1, $2)`, [showcase.id, pid]);
      }
    }
    
    res.json(showcase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/showcases/:id', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const check = await query('SELECT author_id FROM showcases WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Showcase not found' });
    if (check.rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    // Delete relationships first
    await query('DELETE FROM showcase_projects WHERE showcase_id = $1', [req.params.id]);
    // Delete showcase
    await query('DELETE FROM showcases WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update Project
app.post('/api/projects', authenticateToken, async (req, res) => {
  // Frontend sends data nested under formData — merge it with top-level fields
  const { formData, ...topLevel } = req.body;
  const p = { ...topLevel, ...(formData || {}) };
  try {
    // Auto-generate slug from title if not provided
    const baseSlug = (p.slug || p.title || 'project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // Ensure team_members column exists (safe migration)
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'`).catch(() => {});

    const result = await query(`
      INSERT INTO projects (
        title, slug, summary, image_url, gallery, tech_stack, status, 
        year, event, problem_statements, solution_statements, innovations, 
        key_features, visibility, author_id, repository_url, live_demo_url, team_members
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        image_url = EXCLUDED.image_url,
        gallery = EXCLUDED.gallery,
        tech_stack = EXCLUDED.tech_stack,
        visibility = EXCLUDED.visibility,
        team_members = EXCLUDED.team_members
      RETURNING *
    `, [
      p.title,
      slug,
      p.summary,
      p.image_url,
      p.gallery,
      p.tech_stack || p.techStack,
      p.status,
      p.year,
      p.event,
      p.problem_statements || p.problemText,
      p.solution_statements || p.solutionText,
      JSON.stringify(p.innovations || []),
      JSON.stringify(p.keyFeatures || p.key_features || []),
      p.visibility,
      req.user.id,
      p.repository_url || p.repositoryUrl,
      p.live_demo_url || p.liveDemoUrl,
      JSON.stringify(p.teamMembers || p.team_members || []),
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/projects error:', error.message, '| body:', JSON.stringify(req.body));
    res.status(500).json({ error: error.message });
  }
});

// Delete Project
app.delete('/api/projects/:slug', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE slug = $1 AND author_id = $2 RETURNING *',
      [req.params.slug, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    res.json({ message: 'Project deleted successfully', project: result.rows[0] });
  } catch (error) {
    console.error('DELETE /api/projects error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// File Upload Endpoint
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Multi-file Upload
app.post('/api/upload-multiple', authenticateToken, upload.array('files', 10), (req, res) => {
  const urls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls });
});

// Contributors
app.get('/api/contributors', async (req, res) => {
  const result = await query('SELECT * FROM users ORDER BY name ASC');
  res.json(result.rows);
});

app.get('/api/users/:username', async (req, res) => {
  const userResult = await query('SELECT * FROM users WHERE username = $1', [req.params.username]);
  const user = userResult.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });

  const projectsResult = await query(
    'SELECT * FROM projects WHERE author_id = $1 AND visibility = $2',
    [user.id, 'published']
  );
  res.json({ user, projects: projectsResult.rows });
});

// Update Profile
app.put('/api/profile', authenticateToken, async (req, res) => {
  const u = req.body;
  try {
    const result = await query(`
      UPDATE users SET
        name = $1, role = $2, location = $3, headline = $4, bio = $5,
        avatar_url = $6, github_url = $7, linkedin_url = $8, website_url = $9,
        contact_email = $10, phone_number = $11, skills = $12, specialties = $13,
        education = $14
      WHERE id = $15 RETURNING *
    `, [
      u.name, u.role, u.location, u.headline, u.bio,
      u.avatar_url, u.github_url, u.linkedin_url, u.website_url,
      u.contact_email, u.phone_number, u.skills, u.specialties,
      JSON.stringify(u.education || []),
      req.user.id
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update General Settings (username, email)
app.put('/api/general', authenticateToken, async (req, res) => {
  const { username, accountEmail } = req.body;
  try {
    const result = await query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
      [username.trim(), req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const result = await sendVerificationCode(email, baseUrl);
  if (result.success) res.json({ message: 'Code sent' });
  else res.status(500).json(result);
});

app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  const result = await verifyCode(email, code);
  if (result.success) res.json(result);
  else res.status(400).json(result);
});

// Google Auth Routes
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user);
    const userJson = encodeURIComponent(JSON.stringify(req.user));
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Redirect to frontend with token and user data
    // Using hash routing compatibility
    res.redirect(`${frontendUrl}/#/auth-callback?token=${token}&user=${userJson}`);
  }
);

// Production setup
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

