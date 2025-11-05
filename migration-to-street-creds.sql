-- Migration script to convert likes/reactions to Street Creds system
-- Run this script in your Supabase SQL editor

-- Step 1: Rename likes_count to street_creds_count in posts table
ALTER TABLE posts RENAME COLUMN likes_count TO street_creds_count;

-- Step 2: Migrate existing reactions data
-- Sum up all reactions for each post and update street_creds_count
UPDATE posts
SET street_creds_count = (
  SELECT COUNT(*)
  FROM reactions
  WHERE reactions.post_id = posts.id
);

-- Step 3: Drop old reactions table (after data is migrated)
-- Note: This will permanently delete the reactions table and all its data
DROP TABLE IF EXISTS reactions CASCADE;

-- Step 4: Create new street_creds table (simplified version)
CREATE TABLE street_creds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, ip_address)
);

-- Step 5: Enable RLS on street_creds table
ALTER TABLE street_creds ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policy for street_creds
CREATE POLICY "Allow all operations on street_creds" ON street_creds FOR ALL USING (true);

-- Step 7: Create index for performance
CREATE INDEX idx_street_creds_post_id ON street_creds(post_id);
CREATE INDEX idx_posts_street_creds_count ON posts(street_creds_count DESC);

-- Step 8: Drop old reactions trigger
DROP TRIGGER IF EXISTS update_reactions_count ON reactions;

-- Step 9: Update the function to handle street_creds instead of reactions
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

-- Step 10: Create trigger for street_creds
CREATE TRIGGER update_street_creds_count
  AFTER INSERT OR DELETE ON street_creds
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Step 11: Drop old index that's no longer needed
DROP INDEX IF EXISTS idx_posts_likes_count;
DROP INDEX IF EXISTS idx_reactions_post_id;

-- Verification queries (optional - run these to verify the migration)
-- SELECT id, title, street_creds_count FROM posts ORDER BY street_creds_count DESC LIMIT 10;
-- SELECT COUNT(*) as total_street_creds FROM street_creds;

