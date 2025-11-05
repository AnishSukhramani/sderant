-- SAFE Migration script to convert likes/reactions to Street Creds system
-- This version KEEPS your old data as backup until you're ready to delete it
-- Run this script in your Supabase SQL Editor

-- ========================================
-- PHASE 1: SAFE MIGRATION (Run this first)
-- ========================================

-- Step 1: Add the new column to posts table (don't drop old one yet)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS street_creds_count INTEGER DEFAULT 0;

-- Step 2: Migrate data from reactions to street_creds_count
-- This counts ALL reactions per post and sets the street_creds_count
UPDATE posts
SET street_creds_count = (
  SELECT COUNT(*)
  FROM reactions
  WHERE reactions.post_id = posts.id
);

-- Step 3: Also copy likes_count to street_creds_count if it's higher
-- (In case you have likes_count that's higher than reaction count)
UPDATE posts
SET street_creds_count = GREATEST(street_creds_count, COALESCE(likes_count, 0));

-- Step 4: Create new street_creds table (simplified version)
CREATE TABLE IF NOT EXISTS street_creds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, ip_address)
);

-- Step 5: Migrate existing reaction data to street_creds
-- This takes the first reaction of each type per user and creates one street_cred
INSERT INTO street_creds (post_id, ip_address, created_at)
SELECT DISTINCT ON (post_id, ip_address)
  post_id,
  ip_address,
  MIN(created_at) as created_at
FROM reactions
GROUP BY post_id, ip_address
ON CONFLICT (post_id, ip_address) DO NOTHING;

-- Step 6: Enable RLS on street_creds table
ALTER TABLE street_creds ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policy for street_creds
DROP POLICY IF EXISTS "Allow all operations on street_creds" ON street_creds;
CREATE POLICY "Allow all operations on street_creds" ON street_creds FOR ALL USING (true);

-- Step 8: Create index for performance
CREATE INDEX IF NOT EXISTS idx_street_creds_post_id ON street_creds(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_street_creds_count ON posts(street_creds_count DESC);

-- Step 9: Rename old reactions table to reactions_backup (SAFE - keeps your data!)
ALTER TABLE reactions RENAME TO reactions_backup;

-- Step 10: Update the function to handle street_creds
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'street_creds' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET street_creds_count = street_creds_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET street_creds_count = street_creds_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger for street_creds
DROP TRIGGER IF EXISTS update_street_creds_count ON street_creds;
CREATE TRIGGER update_street_creds_count
  AFTER INSERT OR DELETE ON street_creds
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- ========================================
-- VERIFICATION QUERIES (Run these to verify migration worked)
-- ========================================

-- Check: Top posts by street creds
-- SELECT id, title, street_creds_count, likes_count 
-- FROM posts 
-- ORDER BY street_creds_count DESC 
-- LIMIT 10;

-- Check: Compare old vs new counts
-- SELECT 
--   p.id,
--   p.title,
--   p.likes_count as old_likes,
--   p.street_creds_count as new_creds,
--   COUNT(rb.id) as backup_reactions
-- FROM posts p
-- LEFT JOIN reactions_backup rb ON rb.post_id = p.id
-- GROUP BY p.id, p.title, p.likes_count, p.street_creds_count
-- ORDER BY p.street_creds_count DESC
-- LIMIT 10;

-- Check: Total street creds in new table
-- SELECT COUNT(*) as total_street_creds FROM street_creds;

-- Check: Total reactions in backup
-- SELECT COUNT(*) as total_reactions_backup FROM reactions_backup;

-- Check: Verify backup table exists
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name = 'reactions_backup';

-- ========================================
-- WAIT! Test your app thoroughly before running Phase 2!
-- ========================================
-- 1. Deploy your updated code
-- 2. Test giving/removing Street Creds
-- 3. Verify counts are correct
-- 4. Check metrics dashboard
-- 5. Make sure everything works for at least a few days
-- 
-- ONLY AFTER YOU'RE 100% CONFIDENT, run Phase 2 below
-- ========================================

