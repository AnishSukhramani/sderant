-- Fix for userinfo table: Add unique constraint on user_id
-- This is required for the ON CONFLICT clause in the trigger function

-- Add unique constraint on user_id (each user should have only one profile)
-- First, check if there are any duplicate user_ids and handle them
DO $$
BEGIN
  -- Delete duplicates if any exist, keeping the oldest one
  DELETE FROM userinfo
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as rn
      FROM userinfo
    ) t
    WHERE t.rn > 1
  );
END $$;

-- Add unique constraint on user_id
ALTER TABLE userinfo 
ADD CONSTRAINT userinfo_user_id_unique UNIQUE (user_id);

-- Verify the constraint was added
-- You can check with: SELECT * FROM pg_constraint WHERE conname = 'userinfo_user_id_unique';

COMMENT ON CONSTRAINT userinfo_user_id_unique ON userinfo IS 
'Ensures each user can only have one profile record';

