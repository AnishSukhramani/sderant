# 🚨 URGENT SECURITY FIX INSTRUCTIONS 🚨

## What Happened?

Your database was compromised because your RLS policies allowed **ANYONE to UPDATE and DELETE any data**.

### The Problem:

Your current policies look like this:
```sql
CREATE POLICY "Allow all operations on posts" ON posts FOR ALL USING (true);
```

`FOR ALL` means: SELECT, INSERT, **UPDATE**, and **DELETE**
`USING (true)` means: Anyone can do it, no restrictions

**This is why someone was able to delete/edit all your posts!**

---

## Immediate Steps to Fix:

### Step 1: Drop the Vulnerable Policies

Go to your Supabase SQL Editor and run:

```sql
-- Drop the vulnerable policies
DROP POLICY IF EXISTS "Allow all operations on posts" ON posts;
DROP POLICY IF EXISTS "Allow all operations on comments" ON comments;
DROP POLICY IF EXISTS "Allow all operations on reactions" ON reactions;
```

### Step 2: Apply Secure Policies

Copy and paste the **ENTIRE contents** of `secure-schema.sql` into your Supabase SQL Editor and run it.

This will:
- ✅ Allow anyone to **READ** all posts, comments, reactions
- ✅ Allow anyone to **INSERT** new posts, comments, reactions
- ❌ **PREVENT** anyone from **UPDATING** posts and comments
- ❌ **PREVENT** anyone from **DELETING** posts and comments
- ✅ Allow users to delete their own reactions (for toggling reactions)

### Step 3: Test the Security

Try these commands in Supabase SQL Editor with your **anon key**:

```sql
-- This should FAIL (good!)
UPDATE posts SET title = 'hacked' WHERE id = 'some-uuid';

-- This should FAIL (good!)
DELETE FROM posts WHERE id = 'some-uuid';

-- These should SUCCEED
SELECT * FROM posts;
INSERT INTO posts (title, content) VALUES ('Test', 'Test content');
```

---

## For Future Moderation/Admin Tasks:

If YOU need to delete posts as an admin:

### Option 1: Use Supabase Dashboard
1. Go to your Supabase Dashboard
2. Navigate to Table Editor
3. Manually delete posts (this uses your service role key, which bypasses RLS)

### Option 2: Use Service Role Key in Backend
Create a secure admin API route that uses the **service role key** (NEVER expose this to frontend):

```typescript
// app/api/admin/delete-post/route.ts
import { createClient } from '@supabase/supabase-js'

// NEVER expose this key to the frontend!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // This key bypasses RLS
)

export async function DELETE(request: Request) {
  // Add authentication here (password, secret token, etc.)
  const { postId } = await request.json()
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
  
  return Response.json({ error })
}
```

---

## Additional Security Measures:

### 1. Rate Limiting
Consider adding rate limiting to prevent spam:
- Use Vercel's rate limiting
- Or implement Supabase Edge Functions with rate limiting

### 2. Content Moderation
- Add a `reported` flag to posts
- Create a moderation queue
- Block inappropriate content

### 3. IP Blocking
Since you're tracking IP addresses for reactions, you could:
- Create a `blocked_ips` table
- Add policy to check against blocked IPs

### 4. Add Soft Deletes
Instead of hard deletes, add:
```sql
ALTER TABLE posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Update SELECT policy
CREATE POLICY "Allow read non-deleted posts" ON posts 
  FOR SELECT USING (deleted_at IS NULL);
```

---

## Recovery Steps (If You Lost Data):

### Check if data still exists:
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM posts ORDER BY created_at DESC LIMIT 100;
```

### If data was deleted:
1. Check Supabase's daily automatic backups (available in paid tiers)
2. Go to Database → Backups in Supabase Dashboard
3. Restore from the most recent backup before the attack

### If data was updated/corrupted:
Unfortunately, if someone just edited the posts (UPDATE), this is harder to recover without backups.

---

## Prevention Checklist:

- [ ] Drop old vulnerable policies
- [ ] Apply new secure policies from `secure-schema.sql`
- [ ] Test that UPDATE/DELETE fails with anon key
- [ ] Never use `FOR ALL USING (true)` in production
- [ ] Keep service role key secret (never in frontend code)
- [ ] Consider implementing rate limiting
- [ ] Add content moderation features
- [ ] Set up regular backups
- [ ] Monitor for suspicious activity

---

## Understanding RLS Policies:

### Bad (What you had):
```sql
-- DANGEROUS! Allows everything!
CREATE POLICY "policy_name" ON table_name 
  FOR ALL USING (true);
```

### Good (What you need):
```sql
-- Safe: Separate policies for each operation
CREATE POLICY "read_policy" ON table_name 
  FOR SELECT USING (true);  -- Anyone can read

CREATE POLICY "insert_policy" ON table_name 
  FOR INSERT WITH CHECK (true);  -- Anyone can insert

-- NO UPDATE POLICY = Nobody can update
-- NO DELETE POLICY = Nobody can delete
```

---

## Questions?

- RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- Policy Examples: https://supabase.com/docs/guides/database/postgres/row-level-security

**Remember:** When building public apps, always start with the most restrictive policies and only open up what's necessary!
