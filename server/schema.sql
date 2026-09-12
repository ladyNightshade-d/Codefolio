-- ============================================================
-- Codefolio Database Schema
-- Run this in the Supabase SQL editor to set up all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  slug          text unique not null,
  username      text unique not null,
  name          text not null default '',
  role          text not null default 'Engineering Student',
  location      text not null default '',
  headline      text not null default '',
  bio           text not null default '',
  skills        text[]  not null default '{}',
  specialties   text[]  not null default '{}',
  image         text    not null default '',
  contact       jsonb   not null default '{}',
  education     jsonb   not null default '[]',
  notifications jsonb   not null default '{
    "newProjectComments": true,
    "mentionsInDiscussions": true,
    "projectLikesAndBookmarks": false,
    "cohortUpdates": true,
    "newProjectsInYourStack": false
  }',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── OTP Codes ───────────────────────────────────────────────────────────────
create table if not exists otp_codes (
  id         uuid primary key default gen_random_uuid(),
  email      text  not null,
  code       text  not null,
  used       boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_email_idx on otp_codes(email);

-- Auto-delete expired OTP rows after 1 hour (requires pg_cron or manual cleanup)
-- As a safety net we also filter by expires_at in application code.

-- ─── Sessions ────────────────────────────────────────────────────────────────
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token      text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_token_idx  on sessions(token);
create index if not exists sessions_user_idx   on sessions(user_id);

-- ─── Projects ────────────────────────────────────────────────────────────────
create table if not exists projects (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  owner_id            uuid not null references users(id) on delete cascade,
  title               text not null,
  summary             text not null default '',
  stack               text not null default '',
  tech_stack          text[]  not null default '{}',
  status              text    not null default 'In Review',
  cohort              text    not null default '',
  course              text    not null default '',
  problem             text[]  not null default '{}',
  solution            text[]  not null default '{}',
  innovations         text[]  not null default '{}',
  visibility          text    not null default 'draft'
                        check (visibility in ('draft', 'published')),
  repository_url      text    not null default '',
  live_demo_url       text    not null default '',
  feedback_requested  boolean not null default false,
  collections         text[]  not null default '{}',
  tags                text[]  not null default '{}',
  image               text    not null default '',
  image_alt           text    not null default '',
  gallery             text[]  not null default '{}',
  tag                 text,            -- e.g. 'NEW', 'FEATURED'
  wide                boolean not null default false,
  review_average      numeric(3,1) not null default 0,
  review_count        integer      not null default 0,
  created_at          timestamptz  not null default now(),
  updated_at          timestamptz  not null default now()
);

create index if not exists projects_owner_idx      on projects(owner_id);
create index if not exists projects_visibility_idx on projects(visibility);
create index if not exists projects_slug_idx       on projects(slug);

-- Full-text search index on title + summary + stack
create index if not exists projects_fts_idx on projects
  using gin(to_tsvector('english', title || ' ' || summary || ' ' || stack));

-- ─── Project Team Members ────────────────────────────────────────────────────
create table if not exists project_team_members (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  slug       text not null default '',
  name       text not null,
  role       text not null default 'Contributor',
  image      text not null default ''
);

create index if not exists team_members_project_idx on project_team_members(project_id);
create index if not exists team_members_slug_idx    on project_team_members(slug);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- We use a server-side service-role key so RLS is bypassed in the backend.
-- Enable RLS on all tables to block direct anon/authenticated client access.

alter table users                  enable row level security;
alter table otp_codes              enable row level security;
alter table sessions               enable row level security;
alter table projects               enable row level security;
alter table project_team_members   enable row level security;

-- ─── Supabase Storage: project-assets bucket ─────────────────────────────────
-- Run in the Storage section of the Supabase dashboard, or via the API:
--
--   insert into storage.buckets (id, name, public)
--   values ('project-assets', 'project-assets', true);
--
-- Public read policy (objects are served via public URL):
--   create policy "Public read" on storage.objects
--     for select using (bucket_id = 'project-assets');
--
-- Upload policy (only authenticated users via service key — handled server-side):
--   No additional policy needed when using service_role key.

-- ─── Utility: updated_at trigger ─────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger users_updated_at
  before update on users
  for each row execute function set_updated_at();

create or replace trigger projects_updated_at
  before update on projects
  for each row execute function set_updated_at();
