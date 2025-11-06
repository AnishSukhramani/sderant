# Profile Feature Setup Guide

## Overview

The new profile feature adds user authentication to SUDONET with a Terminator-style cybersecurity theme. Users can now create accounts, login, and post with their username.

## Features Implemented ✅

1. **User Registration** - Terminator-style signup page with biometric animations
2. **User Login** - Cybersecurity-themed login with fingerprint scanning animations
3. **Profile Button** - Round profile icon on the far right of the navbar
4. **SHA-256 Encryption** - All usernames and passwords are hashed before storage
5. **Username Posting** - Logged-in users can post with their username using the `uname` command
6. **Anonymous Support** - All routes remain open; authentication is optional

## Database Setup

### Step 1: Run the SQL Schema

Execute the SQL file in your Supabase SQL editor:

```bash
# File location: users-schema.sql
```

Or copy and paste the following into your Supabase SQL editor:

```sql
-- Create users table for authentication
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
```

### Step 2: Verify Table Creation

Check that the `users` table exists in your Supabase database:
- Go to Supabase Dashboard → Table Editor
- You should see a new `users` table with columns: id, name, username_hash, password_hash, created_at, updated_at

## How It Works

### Authentication Flow

1. **Registration** (`/auth/signup`)
   - User enters: name, username, password
   - System generates SHA-256 hash of username
   - System generates SHA-256 hash of password
   - Both hashes are stored in the database
   - User is logged in automatically

2. **Login** (`/auth/login`)
   - User enters: username, password
   - System hashes both inputs with SHA-256
   - System queries database for matching username_hash + password_hash
   - If match found, user is logged in

3. **Profile Button**
   - Located on the far right of the navbar
   - Shows user icon (when logged out: click to login)
   - Shows profile menu (when logged in: displays name and logout option)

### Posting with Username

When creating a post via the terminal, logged-in users now have three options:

1. **Custom Name** - Type any name
   ```
   $ John Doe
   ```

2. **Anonymous** - Type "skip"
   ```
   $ skip
   ```

3. **Username** (NEW) - Type "uname" or "username"
   ```
   $ uname
   Name set to username: Your Name
   ```

## UI/UX Theme

All authentication pages match the existing cyberpunk/terminal theme:

### Signup Page Features:
- Binary rain animation (0s and 1s falling)
- Human figure forming from binary particles
- Retina scan animation
- Progress bars and system status indicators
- Glitch effects on text
- Matrix-style scan lines

### Login Page Features:
- Animated grid background
- Fingerprint scanning animation with rotating scan line
- Security clearance indicators
- Real-time progress tracking
- Shield icon with rotating border
- Authentication status messages

## File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Signup page
│   ├── app/
│   │   └── page.tsx              # Main app (with profile button)
│   └── layout.tsx                # Root layout (with AuthProvider)
├── components/
│   └── PostForm.tsx              # Updated with username support
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── lib/
│   ├── auth.ts                   # Auth utilities & SHA-256 hashing
│   └── supabase.ts               # Updated with users table types
└── types/
    └── index.ts                  # Updated with User type
```

## Security Features

1. **SHA-256 Hashing** - All credentials are hashed before storage
2. **No Plain Text** - Usernames and passwords never stored in plain text
3. **Client-Side Hashing** - Hashing happens in browser before transmission
4. **RLS Policies** - Supabase Row Level Security enabled on users table
5. **LocalStorage Auth** - User session stored in browser localStorage

## Usage Examples

### Creating an Account

1. Click the profile button (top right)
2. Click "REGISTER_HERE"
3. Watch the cool animations!
4. Enter your name (display name)
5. Enter a username (min 3 characters)
6. Enter a password (min 8 characters)
7. Confirm your password
8. Click "REGISTER_USER"

### Logging In

1. Click the profile button (top right)
2. Enter your username
3. Enter your password
4. Click "ACCESS_SYSTEM"
5. You're in!

### Posting with Username

1. Open the terminal (Ctrl+` or click OPEN_TERMINAL)
2. When prompted for name, type `uname`
3. Continue with post creation
4. Your post will be created with your username as the author

## Troubleshooting

### "Supabase not configured" error
- Make sure your `.env.local` file has the correct Supabase credentials
- Restart your development server

### "Username already exists"
- Choose a different username
- Usernames are case-insensitive

### Profile button not showing
- Check that AuthProvider is wrapping your app in `layout.tsx`
- Verify the browser console for errors

### Can't use `uname` command
- Make sure you're logged in
- The command only works for authenticated users

## Design Philosophy

The profile feature maintains the existing UI/UX theme:

- ✅ Terminal/hacker aesthetic
- ✅ Green (#00ff41) as primary color
- ✅ Black background with matrix effects
- ✅ Glitch animations and scan lines
- ✅ Monospace font (Geist Mono)
- ✅ Cyberpunk/Terminator style
- ✅ Command-line interface for interactions
- ✅ No traditional forms (everything is terminal-style)

## Routes

All routes are **open** (no authentication required):

- `/` - Landing page
- `/app` - Main app (view/create posts)
- `/auth/login` - Login page
- `/auth/signup` - Signup page

The difference when logged in:
- Profile button shows your name
- Can post with username using `uname` command
- Profile menu available for logout

## Next Steps

You can extend this feature with:

1. User profiles page
2. Edit profile functionality
3. Password reset
4. User post history
5. User badges/achievements
6. Social features (follow/unfollow)

## Testing

To test the complete flow:

1. Register a new user
2. Verify you can see the profile button with your name
3. Create a post using `uname` command
4. Logout and verify the profile button changes
5. Login again with your credentials
6. Verify your session persists across page reloads

Enjoy your new profile system! 🚀

