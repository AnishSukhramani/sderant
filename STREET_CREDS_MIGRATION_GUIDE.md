# 🔥 Street Cred System Migration Guide

## Overview
We've transformed the old likes/reactions system into a **Street Cred** system - a cooler, simpler way for the community to show respect for posts!

## What Changed?

### Before (Likes & Reactions)
- Multiple reaction types (like, heart, laugh, angry, dislike)
- Complex UI with multiple buttons
- Database field: `likes_count`
- Database table: `reactions` with `type` field

### After (Street Creds)
- Single "Street Cred" action (give creds to posts you respect)
- Clean, unified UI with one prominent button
- Database field: `street_creds_count`
- Database table: `street_creds` (simplified, no type field)
- Terminology: Street Creds (plural), Creds (short), Street Cred (singular)

## Migration Steps

### 1. Run the Database Migration Script

**IMPORTANT:** Before running the migration, back up your database!

1. Open your Supabase SQL Editor
2. Copy the contents of `migration-to-street-creds.sql`
3. Execute the script

The migration script will:
- ✅ Rename `likes_count` to `street_creds_count` in the posts table
- ✅ Sum all existing reactions and convert them to street creds
- ✅ Drop the old reactions table (after data is migrated)
- ✅ Create the new `street_creds` table
- ✅ Update all triggers and functions
- ✅ Create proper indexes for performance

### 2. Verify the Migration

After running the migration, verify it worked by running these queries in Supabase SQL Editor:

```sql
-- Check top posts by street creds
SELECT id, title, street_creds_count 
FROM posts 
ORDER BY street_creds_count DESC 
LIMIT 10;

-- Check total street creds in the system
SELECT COUNT(*) as total_street_creds 
FROM street_creds;

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'street_creds_count';
```

### 3. Code Changes (Already Applied)

The following files have been updated:

#### TypeScript Types (`src/types/index.ts`)
- ✅ Changed `likes_count` to `street_creds_count` in Post type
- ✅ Replaced `Reaction` type with simpler `StreetCred` type

#### PostCard Component (`src/components/PostCard.tsx`)
- ✅ Removed multiple reaction buttons (like, heart, laugh, angry)
- ✅ Added single "Street Cred" button with Award icon
- ✅ Updated API calls to use `street_creds` table
- ✅ Removed `userReactions` state, replaced with `hasGivenCred`
- ✅ New button shows count + "CRED" or "CREDS" label
- ✅ Yellow color scheme for active state (more street vibe)

#### App Page (`src/app/app/page.tsx`)
- ✅ Updated metrics sidebar: "TOTAL_REACTIONS" → "STREET_CREDS"
- ✅ Changed color from red to yellow for street creds count
- ✅ Updated trending score calculation to use `street_creds_count`

#### Landing Page (`src/app/page.tsx`)
- ✅ Updated feature description: "REACT_&_ENGAGE" → "STREET_CRED_SYSTEM"
- ✅ Updated description to mention giving Street Creds

### 4. Testing Checklist

After deployment, test the following:

- [ ] Can give Street Cred to a post
- [ ] Can remove Street Cred from a post (toggle)
- [ ] Street Cred count updates correctly
- [ ] Metrics sidebar shows correct total Street Creds
- [ ] Trending posts are sorted correctly by street creds + comments + views
- [ ] No console errors
- [ ] Mobile responsiveness is maintained

## New Database Schema

### Posts Table
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  street_creds_count INTEGER DEFAULT 0,  -- Changed from likes_count
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0
);
```

### Street Creds Table (Simplified)
```sql
CREATE TABLE street_creds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, ip_address)  -- One cred per user per post
);
```

## UI/UX Changes

### Street Cred Button Design
- **Inactive State:**
  - Border: `border-green-400/50`
  - Hover: Yellow border (`border-yellow-400`)
  - Icon: Award icon (outline)

- **Active State:**
  - Border: `border-yellow-400`
  - Background: `bg-yellow-400/20`
  - Text: `text-yellow-400`
  - Icon: Award icon (filled)
  - Shadow: Glowing effect

### Button Label Format
- Shows count + "CRED" (singular) or "CREDS" (plural)
- Example: "1 CRED", "42 CREDS", "1337 CREDS"

## API Changes

### Old Endpoint (Reactions)
```typescript
supabase
  .from('reactions')
  .insert({
    post_id: post.id,
    type: 'like', // or 'heart', 'laugh', 'angry'
    ip_address: userIdentifier
  })
```

### New Endpoint (Street Creds)
```typescript
supabase
  .from('street_creds')
  .insert({
    post_id: post.id,
    ip_address: userIdentifier
    // No 'type' field needed!
  })
```

## Rollback Plan

If you need to rollback the migration:

1. Do NOT run the migration script
2. Revert the code changes:
   ```bash
   git revert HEAD
   ```
3. The old schema will still work with the old code

⚠️ **Warning:** Once you run the migration script, the `reactions` table will be dropped. Make sure you have a backup before proceeding!

## Benefits of the Street Cred System

1. **Simpler UX** - One action vs. five reaction buttons
2. **Clearer Intent** - "Giving creds" is more meaningful than "liking"
3. **Better Performance** - Simpler database structure
4. **Unique Identity** - Street Creds set your platform apart from generic social platforms
5. **Developer Culture** - "Street Cred" resonates with tech/developer culture

## Support

If you encounter any issues during migration:
1. Check the Supabase logs for errors
2. Verify the migration script ran completely
3. Check browser console for API errors
4. Ensure all code changes are properly deployed

---

**Migration completed on:** $(date)
**Breaking Changes:** Yes (database schema changes)
**Backwards Compatible:** No
**Data Loss:** No (reactions are converted to street creds)

