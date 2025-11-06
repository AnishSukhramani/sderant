-- SIMPLE FIX: Allow updates to userinfo table for custom auth
-- This removes the auth.uid() requirement and allows updates based on user_id

-- Drop the existing update policy that requires auth.uid()
DROP POLICY IF EXISTS "Users can update their own profile" ON userinfo;

-- Create a new policy that allows updates (less secure but works with custom auth)
-- WARNING: This allows anyone to update any profile if they know the user_id
-- For better security, use the function-based approach in fix-userinfo-rls.sql
CREATE POLICY "Allow updates to userinfo" ON userinfo
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- If you want to keep some security, you can add a check constraint instead
-- But this requires the function approach

COMMENT ON POLICY "Allow updates to userinfo" ON userinfo IS 
'WARNING: This allows all updates. For production, use the SECURITY DEFINER function approach instead.';

