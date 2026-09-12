-- ============================================================
-- Codefolio: Service Role Grants
-- Run this in Supabase SQL Editor if you get permission errors.
-- This grants the backend service_role full access to all tables.
-- ============================================================

grant all privileges on public.users                to service_role;
grant all privileges on public.otp_codes            to service_role;
grant all privileges on public.sessions             to service_role;
grant all privileges on public.projects             to service_role;
grant all privileges on public.project_team_members to service_role;

-- Allow service_role to use sequences (for generated IDs)
grant usage, select on all sequences in schema public to service_role;
