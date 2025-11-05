-- ========================================
-- PHASE 2: CLEANUP (OPTIONAL - Run this ONLY after verifying Phase 1 works!)
-- ========================================
-- 
-- ⚠️ WARNING: This will permanently delete your backup data
-- ⚠️ Only run this after:
--    - Testing for several days
--    - Confirming street_creds works perfectly
--    - Verifying all counts are correct
--    - Being 100% confident you won't need to rollback
-- ========================================

-- Final verification before cleanup
DO $$
DECLARE
  backup_count INTEGER;
  new_count INTEGER;
BEGIN
  -- Count old reactions
  SELECT COUNT(*) INTO backup_count FROM reactions_backup;
  
  -- Count new street_creds
  SELECT COUNT(*) INTO new_count FROM street_creds;
  
  -- Display counts
  RAISE NOTICE 'Backup reactions: %', backup_count;
  RAISE NOTICE 'New street_creds: %', new_count;
  
  -- Safety check
  IF new_count = 0 AND backup_count > 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: New table is empty but backup has data. DO NOT PROCEED!';
  END IF;
  
  RAISE NOTICE 'Verification passed. You can proceed with cleanup if you are confident.';
END $$;

-- Uncomment the lines below ONLY when you're ready to permanently delete the backup

-- -- Step 1: Drop the backup reactions table
-- DROP TABLE IF EXISTS reactions_backup CASCADE;

-- -- Step 2: Remove the old likes_count column from posts
-- ALTER TABLE posts DROP COLUMN IF EXISTS likes_count;

-- -- Step 3: Drop old indexes that are no longer needed
-- DROP INDEX IF EXISTS idx_posts_likes_count;
-- DROP INDEX IF EXISTS idx_reactions_post_id;

-- RAISE NOTICE 'Cleanup complete! Old data has been permanently removed.';

-- ========================================
-- If you uncommented and ran the cleanup, there's no going back!
-- Make sure you tested thoroughly before running this.
-- ========================================

