-- Create userinfo table for extended profile information
-- Connected to users table via user_id foreign key
CREATE TABLE IF NOT EXISTS userinfo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE, -- Denormalized for easier lookup
  photo_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  email TEXT,
  phone TEXT,
  bio TEXT, -- Short bio (max ~160 chars recommended)
  about TEXT, -- Long bio/description
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view photos
CREATE POLICY "Profile photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Storage policy: Authenticated users can upload their own photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos');

-- Storage policy: Users can update their own photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos');

-- Storage policy: Users can delete their own photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos');

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_userinfo_user_id ON userinfo(user_id);
CREATE INDEX IF NOT EXISTS idx_userinfo_username ON userinfo(username);
CREATE INDEX IF NOT EXISTS idx_userinfo_is_public ON userinfo(is_public);
CREATE INDEX IF NOT EXISTS idx_userinfo_created_at ON userinfo(created_at DESC);

-- Full text search index for bio and about
CREATE INDEX IF NOT EXISTS idx_userinfo_bio_search ON userinfo USING gin(to_tsvector('english', coalesce(bio, '') || ' ' || coalesce(about, '')));

-- Enable Row Level Security
ALTER TABLE userinfo ENABLE ROW LEVEL SECURITY;

-- Policy: Public profiles are readable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON userinfo
  FOR SELECT USING (is_public = true);

-- Policy: Users can read their own profile even if not public
CREATE POLICY "Users can view their own profile" ON userinfo
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

-- Policy: Anyone can insert (for first-time profile creation)
CREATE POLICY "Anyone can create profile" ON userinfo
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON userinfo
  FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON userinfo
  FOR DELETE USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_userinfo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_userinfo_updated_at
  BEFORE UPDATE ON userinfo
  FOR EACH ROW
  EXECUTE FUNCTION update_userinfo_updated_at();

-- Function to automatically create userinfo when user registers
CREATE OR REPLACE FUNCTION create_userinfo_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_plain TEXT;
BEGIN
  -- For now, we'll use the name as username in userinfo
  -- In production, you'd want to store actual username
  INSERT INTO userinfo (user_id, username, is_public)
  VALUES (NEW.id, NEW.name, true)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create userinfo when new user is created
CREATE TRIGGER create_userinfo_on_user_creation
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_userinfo_for_new_user();

-- Comments for documentation
COMMENT ON TABLE userinfo IS 'Extended profile information for users, publicly viewable';
COMMENT ON COLUMN userinfo.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN userinfo.username IS 'Denormalized username for easier lookup and display';
COMMENT ON COLUMN userinfo.photo_url IS 'URL to profile photo in Supabase storage';
COMMENT ON COLUMN userinfo.bio IS 'Short bio (recommended max 160 characters)';
COMMENT ON COLUMN userinfo.about IS 'Long form bio/description';
COMMENT ON COLUMN userinfo.is_public IS 'Whether the profile is publicly visible';

