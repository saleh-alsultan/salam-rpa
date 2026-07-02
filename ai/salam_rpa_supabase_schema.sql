-- Run this SQL in your Supabase project SQL Editor

-- 1. Create tables
CREATE TABLE IF NOT EXISTS config (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  week TEXT DEFAULT '',
  period TEXT DEFAULT '',
  preparedBy TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS processes (
  id SERIAL PRIMARY KEY,
  dept TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  name TEXT DEFAULT '',
  session TEXT DEFAULT '',
  systems TEXT DEFAULT '',
  desc TEXT DEFAULT '',
  assess TEXT DEFAULT '',
  assessReason TEXT DEFAULT '',
  reviewStatus TEXT DEFAULT 'Under Review',
  status TEXT DEFAULT 'Analysis',
  blockers TEXT DEFAULT '',
  nextSteps TEXT DEFAULT '',
  meeting TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS snapshots (
  id SERIAL PRIMARY KEY,
  week TEXT DEFAULT '',
  period TEXT DEFAULT '',
  kpi TEXT DEFAULT '{}',
  processes TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert default config
INSERT INTO config (id, week, period, preparedBy) VALUES (1, '13', '', '') ON CONFLICT (id) DO NOTHING;

-- 3. Enable Row Level Security
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- 4. Allow anon key to do everything (team access)
CREATE POLICY "anon_all_config" ON config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_processes" ON processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_snapshots" ON snapshots FOR ALL USING (true) WITH CHECK (true);
