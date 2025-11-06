-- Create users table for authentication
-- Stores SHA-256 hashes of username and password combinations
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  username_hash TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username_hash ON users(username_hash);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read user data (for public profiles)
CREATE POLICY "Users are publicly readable" ON users
  FOR SELECT USING (true);

-- Policy: Anyone can insert (for registration)
CREATE POLICY "Anyone can register" ON users
  FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user authentication data with SHA-256 hashed credentials';
COMMENT ON COLUMN users.username_hash IS 'SHA-256 hash of the username';
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of the password';
COMMENT ON COLUMN users.name IS 'Display name for the user';

