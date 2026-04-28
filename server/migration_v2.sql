-- Migration V2
-- 1. Add education to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';

-- 2. Enhance showcases table
ALTER TABLE showcases ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web'; -- 'web' or 'mobile'
ALTER TABLE showcases ADD COLUMN IF NOT EXISTS author_name TEXT; -- fallback

-- 3. Create junction table for showcase projects
CREATE TABLE IF NOT EXISTS showcase_projects (
  showcase_id UUID REFERENCES showcases(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (showcase_id, project_id)
);

-- 4. Ensure team_members exists on projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';
