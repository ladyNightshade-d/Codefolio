# Codefolio Deployment Guide

## Quick start (local development)

```bash
# 1. Copy env file and fill in your values
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run the Supabase schema
#    Go to: https://supabase.com → your project → SQL Editor
#    Paste and run the contents of server/schema.sql

# 4. Start both frontend and backend together
npm run dev
#    Frontend: http://localhost:5173
#    Backend:  http://localhost:3001
```

---

## Environment variables

See `.env.example` for all required variables with inline documentation.

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes (prod) | Backend URL (frontend only) |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `GOOGLE_API_KEY` | Yes | Google Gemini API key |
| `SMTP_HOST` | Yes | SMTP server hostname |
| `SMTP_PORT` | Yes | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | Yes | SMTP username / email |
| `SMTP_PASS` | Yes | SMTP password or app password |
| `SMTP_FROM` | No | From address for OTP emails |
| `PORT` | No | Server port (default 3001) |
| `CLIENT_ORIGIN` | No | Frontend URL for CORS (default localhost:5173) |

---

## Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `server/schema.sql`
3. Go to **Storage** → create a bucket named `project-assets`, set it to **Public**
4. Copy your **Project URL** and **service_role** key into `.env`

---

## Deploying to Render (recommended for free tier)

1. Push your repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo
4. Set these in the Render dashboard:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Add all variables from `.env.example`
5. Set `NODE_ENV=production` and `VITE_API_URL` to your Render URL
6. Deploy — Render serves both frontend and backend from one process

---

## Deploying with PM2 (VPS / cloud server)

```bash
# Install PM2 globally
npm install -g pm2

# Build frontend
npm run build

# Start backend (serves built frontend too)
pm2 start server/index.js --name codefolio

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Production checklist

- [ ] All env variables set (no placeholders)
- [ ] `server/schema.sql` applied to Supabase
- [ ] `project-assets` storage bucket created and set to Public
- [ ] `NODE_ENV=production` set on server
- [ ] `VITE_API_URL` points to your live server URL
- [ ] `CLIENT_ORIGIN` matches your frontend domain
- [ ] SMTP tested by sending a real OTP
- [ ] Gemini API key tested via the chat page
