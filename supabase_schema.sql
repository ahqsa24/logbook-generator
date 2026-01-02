-- ============================================
-- SUPABASE DATABASE SCHEMA FOR COMMENTS
-- ============================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Then click "Run" button

-- 1. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON replies(created_at ASC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- 5. Create policies to allow public read/write access
-- (Since this is a public comment system, everyone can read and write)

-- Comments policies
CREATE POLICY "Enable read access for all users" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON comments
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON comments
  FOR DELETE USING (true);

-- Replies policies
CREATE POLICY "Enable read access for all users" ON replies
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON replies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON replies
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON replies
  FOR DELETE USING (true);

-- ============================================
-- DONE! Your tables are ready to use
-- ============================================
