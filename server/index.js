import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { createClient } from '@supabase/supabase-js';
import { sendVerificationCode, verifyCode } from './auth.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// AI Setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date() });
});

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { messages, userId } = req.body;
  if (!messages) return res.status(400).json({ error: 'Messages are required' });

  try {
    const lastMessage = messages[messages.length - 1].text;
    
    // 1. Fetch real projects with author names from database
    const { data: projects } = await supabase
      .from('projects')
      .select('title, summary, tech_stack, users(name)')
      .eq('visibility', 'published');
      
    const projectContext = projects && projects.length > 0 
      ? projects.map(p => `- ${p.title}: ${p.summary} [Tech: ${p.tech_stack?.join(', ')}] [Contributor: ${p.users?.name || 'Unknown'}]`).join('\n')
      : 'Currently, there are no published projects on the platform.';

    // 2. System prompt with real data context
    const systemPrompt = `You are Copilot, the AI assistant for Codefolio.
    
    IMPORTANT: You have access to the following REAL projects and their contributors from the database:
    ${projectContext}
    
    Rules:
    1. ONLY discuss projects and contributors that are in the list above. 
    2. If a user asks about projects or people not listed, explain that you don't have that information.
    3. Use professional, concise language and Markdown (bolding, lists).`;
    
    const prompt = `${systemPrompt}\n\nUser: ${lastMessage}`;
    
    // Check for API Key
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      return res.json({ 
        text: "AI is currently in demo mode. Please ensure GOOGLE_API_KEY is set in your .env file.", 
        role: 'assistant' 
      });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save user message to database if userId is provided
    if (userId) {
      await supabase.from('chat_messages').insert([
        { user_id: userId, role: 'user', content: lastMessage },
        { user_id: userId, role: 'assistant', content: text }
      ]);
    }

    res.json({ text, role: 'assistant' });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Recent Chats Endpoint
app.get('/api/ai/recent/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('content, created_at')
    .eq('user_id', userId)
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json({ error: error.message });
  
  // Return unique messages as "recent chats"
  const uniqueMessages = [...new Set(data.map(m => m.content))].slice(0, 5);
  res.json(uniqueMessages);
});

// Full History Endpoint
app.get('/api/ai/history/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Projects Endpoints
app.get('/api/projects', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, users(name, avatar_url, username)')
    .eq('visibility', 'published');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/projects/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*, users(*)')
    .eq('slug', req.params.slug)
    .single();

  if (error) return res.status(404).json({ error: 'Project not found' });
  res.json(data);
});

// Contributors Endpoints
app.get('/api/contributors', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Showcases Endpoints
app.get('/api/showcases', async (req, res) => {
  const { data, error } = await supabase
    .from('showcases')
    .select('*, users(name, avatar_url)');

  if (error) {
    // If table doesn't exist yet, return empty array instead of erroring
    if (error.code === 'PGRST116' || error.message.includes('relation "showcases" does not exist')) {
      return res.json([]);
    }
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

app.get('/api/users/:username', async (req, res) => {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', req.params.username)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'User not found' });

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('author_id', user.id)
    .eq('visibility', 'published');

  res.json({ user, projects: projects || [] });
});

app.post('/api/auth/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const result = await sendVerificationCode(email);
  if (result.success) {
    res.json({ message: 'Verification code sent' });
  } else {
    res.status(500).json({ error: 'Failed to send verification code', details: result.error });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

  const result = await verifyCode(email, code);
  if (result.success) {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      let user = existingUser;

      if (!existingUser) {
        // Create new user in Supabase public.users table
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            email,
            name: email.split('@')[0],
            avatar_url: `https://ui-avatars.com/api/?name=${email.charAt(0).toUpperCase()}&background=ea4c89&color=fff&rounded=true`,
            username: email.split('@')[0].toLowerCase() + '-' + Math.floor(Math.random() * 1000)
          })
          .select()
          .single();

        if (createError) throw createError;
        user = newUser;
      }

      res.json({ 
        message: 'Verified successfully', 
        user,
        token: 'custom-session-' + user.id // Simple custom token
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to save user to database' });
    }
  } else {
    res.status(400).json({ error: result.message });
  }
});

// Serve static files from the Vite build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving production build from ../dist');
  }
});
