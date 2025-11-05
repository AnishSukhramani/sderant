-- ========================================
-- ROLLBACK SCRIPT - Use this if something goes wrong
-- ========================================
-- This script reverts the migration back to the old reactions system
-- ONLY works if you haven't run the cleanup script yet!
-- ========================================

-- Check if backup exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'reactions_backup'
  ) THEN
    RAISE EXCEPTION 'reactions_backup table not found! Cannot rollback. Did you already run cleanup?';
  END IF;
  
  RAISE NOTICE 'Backup table found. Proceeding with rollback...';
END $$;

-- Step 1: Drop the new street_creds table
DROP TABLE IF EXISTS street_creds CASCADE;

-- Step 2: Restore the old reactions table name
ALTER TABLE reactions_backup RENAME TO reactions;

-- Step 3: Restore the old update_post_counts function
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'reactions' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Step 4: Recreate the old trigger
DROP TRIGGER IF EXISTS update_reactions_count ON reactions;
CREATE TRIGGER update_reactions_count
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Step 5: Remove the street_creds_count column (optional)
-- Uncomment if you want to fully clean up
-- ALTER TABLE posts DROP COLUMN IF EXISTS street_creds_count;

-- Step 6: Restore indexes
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);

-- Verification
SELECT 
  (SELECT COUNT(*) FROM reactions) as reactions_count,
  (SELECT COUNT(*) FROM posts) as posts_count,
  'Rollback complete! Reactions system restored.' as status;

-- ========================================
-- After rollback:
-- 1. Revert your code changes (git revert)
-- 2. Deploy the old code
-- 3. Test that reactions work again
-- ========================================

