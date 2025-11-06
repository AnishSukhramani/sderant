-- Migration script to create userinfo records for existing users
-- Run this ONCE after setting up the userinfo table
-- This will create userinfo records for all users who don't have one yet

-- Insert userinfo for all existing users who don't have a userinfo record
INSERT INTO userinfo (user_id, username, is_public, created_at, updated_at)
SELECT 
  u.id as user_id,
  u.name as username,  -- Using name as username
  true as is_public,
  u.created_at,
  u.updated_at
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM userinfo ui WHERE ui.user_id = u.id
);

-- Verify the migration
SELECT 
  COUNT(*) as total_users,
  (SELECT COUNT(*) FROM userinfo) as users_with_profiles,
  COUNT(*) - (SELECT COUNT(*) FROM userinfo) as missing_profiles
FROM users;

-- Show which users now have profiles
SELECT 
  u.name,
  u.created_at as user_created,
  ui.username,
  ui.created_at as profile_created
FROM users u
LEFT JOIN userinfo ui ON u.id = ui.user_id
ORDER BY u.created_at;

