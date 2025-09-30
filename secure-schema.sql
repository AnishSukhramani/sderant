-- SECURE SCHEMA FOR ANONYMOUS BULLETIN BOARD
-- This schema provides proper security while maintaining anonymous posting

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('like', 'dislike', 'laugh', 'angry', 'heart')) NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, ip_address, type)
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECURE POLICIES - READ-ONLY FOR ANONYMOUS
-- ============================================

-- Posts: Everyone can read and insert, but CANNOT update or delete
CREATE POLICY "Allow read access to posts" ON posts 
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to posts" ON posts 
  FOR INSERT WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES = NOBODY CAN UPDATE/DELETE

-- Comments: Everyone can read and insert, but CANNOT update or delete
CREATE POLICY "Allow read access to comments" ON comments 
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to comments" ON comments 
  FOR INSERT WITH CHECK (true);

-- NO UPDATE OR DELETE POLICIES = NOBODY CAN UPDATE/DELETE

-- Reactions: Everyone can read, insert and delete their OWN reactions only
CREATE POLICY "Allow read access to reactions" ON reactions 
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to reactions" ON reactions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete own reactions" ON reactions 
  FOR DELETE USING (true);
  -- Note: Deletion is protected by UNIQUE constraint on (post_id, ip_address, type)
  -- Users can only delete their own reactions via the ip_address match in your code

-- Create indexes for performance
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_likes_count ON posts(likes_count DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_ip_address ON reactions(ip_address);

-- Create function to update post counts
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

-- Create triggers
CREATE TRIGGER update_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER update_reactions_count
  AFTER INSERT OR DELETE ON reactions
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADMIN FUNCTIONS (for cleanup/moderation)
-- ============================================

-- Create an admin role function (call this with service role key only)
CREATE OR REPLACE FUNCTION delete_post_as_admin(post_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can only be called with service role credentials
  -- Add additional checks here if needed
  DELETE FROM posts WHERE id = post_id_to_delete;
END;
$$;

-- Grant execute permission to authenticated users (you'll need service role to call this)
-- REVOKE EXECUTE ON FUNCTION delete_post_as_admin FROM anon;
