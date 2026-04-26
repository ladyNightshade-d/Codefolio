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
import { authenticateToken } from './auth_middleware.js';
import { sendVerificationCode, verifyCode } from './auth.js';

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
app.use('/uploads', express.static(uploadDir));

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
    res.json(result.rows);
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
    res.json(result.rows[0]);
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
        contact_email = $10, phone_number = $11, skills = $12, specialties = $13
      WHERE id = $14 RETURNING *
    `, [
      u.name, u.role, u.location, u.headline, u.bio,
      u.avatar_url, u.github_url, u.linkedin_url, u.website_url,
      u.contact_email, u.phone_number, u.skills, u.specialties,
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

// Production setup
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

