# 🔄 Data Recovery Guide

## Methods to Recover Your Lost Posts

### Method 1: Supabase Point-in-Time Recovery (PITR) ⭐ BEST OPTION

**Available on:** Pro plan and above ($25/month)

#### Steps:
1. Go to your Supabase Dashboard
2. Navigate to **Database → Backups**
3. Look for **Point in Time Recovery** section
4. Select a timestamp **BEFORE** the attack happened
5. Click "Restore" to recover your database

**Pros:**
- ✅ Exact recovery to any point in time
- ✅ Can recover to minutes before the attack
- ✅ Most reliable method

**Cons:**
- ❌ Only available on paid plans
- ❌ Must act quickly (retention varies by plan)

---

### Method 2: Daily Automatic Backups

**Available on:** All paid plans (Pro and above)

#### Steps:
1. Go to your Supabase Dashboard
2. Navigate to **Database → Backups**
3. Look for **Daily Backups** section
4. Find the most recent backup **BEFORE** the attack
5. Download or restore that backup

**Pros:**
- ✅ Available on all paid plans
- ✅ Free to restore

**Cons:**
- ❌ Only daily snapshots (may lose up to 24 hours of data)
- ❌ Not available on free tier

---

### Method 3: Check if Data Was Soft-Deleted

Sometimes attackers just UPDATE fields rather than hard DELETE.

#### Run this query in Supabase SQL Editor:

```sql
-- Check if posts table has any data at all
SELECT COUNT(*) as total_posts FROM posts;

-- Check what's in the posts table
SELECT * FROM posts ORDER BY created_at DESC LIMIT 100;

-- If you see weird data, check for patterns
SELECT 
  id,
  title,
  content,
  created_at,
  updated_at
FROM posts 
WHERE updated_at > created_at  -- Posts that were modified
ORDER BY updated_at DESC;
```

If you see posts with corrupted data (like all titles say "hacked"), you might be able to:
- Identify which posts were modified
- Contact users to re-post
- At least recover post IDs and timestamps

---

### Method 4: Browser Cache / Client-Side Recovery

If the attack happened recently, data might still be in users' browsers!

#### Create a Data Collection Page:

1. Add this to your app temporarily:

```typescript
// app/recover-data/page.tsx
'use client'

export default function RecoverData() {
  const handleExtractCache = () => {
    // Check localStorage
    console.log('LocalStorage:', localStorage)
    
    // Check sessionStorage
    console.log('SessionStorage:', sessionStorage)
    
    // Try to get cached network requests
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => {
          caches.open(key).then(cache => {
            cache.keys().then(requests => {
              console.log('Cached requests:', requests)
            })
          })
        })
      })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Data Recovery Tool</h1>
      <button 
        onClick={handleExtractCache}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Check Browser Cache
      </button>
      <p className="mt-4 text-sm">
        Open browser DevTools Console (F12) and click the button.
        Look for any cached post data.
      </p>
    </div>
  )
}
```

2. Share this page with recent users
3. Ask them to run it and send you any recovered data

**Pros:**
- ✅ Free
- ✅ Might recover very recent posts

**Cons:**
- ❌ Only works if users visited recently
- ❌ Manual and tedious
- ❌ Incomplete data

---

### Method 5: Check Supabase Logs

**Available on:** All plans

#### Steps:
1. Go to **Logs → Database Logs** in Supabase Dashboard
2. Look for DELETE or UPDATE statements
3. Try to identify what was deleted

**Example queries to look for:**
```sql
DELETE FROM posts WHERE ...
UPDATE posts SET title = ...
```

**Pros:**
- ✅ Can see what happened
- ✅ Might show the data that was there

**Cons:**
- ❌ Logs might not show full data
- ❌ Limited retention period
- ❌ Won't help you restore, just understand

---

### Method 6: Check if You Have Any External Backups

Did you ever:
- Export data for testing?
- Take screenshots with post IDs visible?
- Have analytics that captured post content?
- Use any monitoring tools (Sentry, etc.)?
- Have staging/development environment with copies?

---

## Immediate Action Plan

### Step 1: Check Your Supabase Plan

```bash
# Go to: https://app.supabase.com/project/YOUR-PROJECT/settings/billing
```

**If you're on FREE tier:**
- ❌ No automatic backups
- ❌ No PITR
- You'll need Methods 3-6

**If you're on PRO or higher:**
- ✅ Check **Database → Backups** NOW
- ✅ Look for PITR or daily backups
- ✅ Restore ASAP before backup window expires

### Step 2: Run Diagnostic Queries

```sql
-- How many posts do you have?
SELECT COUNT(*) FROM posts;

-- When was the last post created?
SELECT MAX(created_at) as last_post FROM posts;

-- When was the last modification?
SELECT MAX(updated_at) as last_update FROM posts;

-- Are there any posts left?
SELECT id, title, LEFT(content, 50) as preview, created_at 
FROM posts 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 3: Document Everything

Before attempting recovery:

```sql
-- Create a snapshot of current state
CREATE TABLE posts_backup_pre_recovery AS 
SELECT * FROM posts;

-- Same for comments and reactions
CREATE TABLE comments_backup_pre_recovery AS 
SELECT * FROM comments;

CREATE TABLE reactions_backup_pre_recovery AS 
SELECT * FROM reactions;
```

---

## Recovery Process (If You Have Backups)

### For PITR:

1. **CRITICAL:** Note the exact time of the attack
2. Choose a restore point 5-10 minutes BEFORE the attack
3. Click "Restore"
4. Wait for Supabase to complete the restoration
5. Verify data is back:
   ```sql
   SELECT COUNT(*) FROM posts;
   SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
   ```

### For Daily Backups:

1. Download the backup file
2. Go to **Database → Migrations** or use SQL Editor
3. You may need to:
   - Drop current tables
   - Restore from backup SQL
   - Or merge data if some legitimate posts were created after backup

---

## If Data is Unrecoverable

### Mitigation Steps:

1. **Communicate with Users:**
   ```markdown
   🚨 Security Incident Notice
   
   We experienced a security incident where malicious users 
   exploited a vulnerability to delete posts. We've:
   
   ✅ Fixed the security hole
   ✅ Implemented strict RLS policies
   ✅ Enhanced monitoring
   
   Unfortunately, some posts may have been lost. We apologize 
   for this incident and have taken measures to prevent future 
   occurrences.
   ```

2. **Add a "Report Lost Post" Feature:**
   - Let users report if their post is missing
   - Collect details: approximate date, title, content they remember
   - Manually recreate if possible

3. **Implement Better Protection Going Forward:**
   - Apply the secure schema IMMEDIATELY
   - Set up regular backups (upgrade plan if needed)
   - Add rate limiting
   - Implement content moderation
   - Add honeypot detection

---

## Prevention for Future

### Enable Automatic Backups:

1. **Upgrade to Pro plan** ($25/month)
   - Daily automatic backups
   - 7-day PITR
   - Worth it for peace of mind!

2. **Set up custom backup script:**

```typescript
// scripts/backup-database.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function backupDatabase() {
  const { data: posts } = await supabase.from('posts').select('*')
  const { data: comments } = await supabase.from('comments').select('*')
  const { data: reactions } = await supabase.from('reactions').select('*')
  
  const backup = {
    timestamp: new Date().toISOString(),
    posts,
    comments,
    reactions
  }
  
  fs.writeFileSync(
    `backups/backup-${Date.now()}.json`,
    JSON.stringify(backup, null, 2)
  )
  
  console.log('✅ Backup completed!')
}

backupDatabase()
```

Run this daily with a cron job!

---

## Next Steps Checklist

- [ ] Check Supabase plan and available backup options
- [ ] Run diagnostic queries to see current state
- [ ] If backups available: Restore immediately
- [ ] If no backups: Document what's lost
- [ ] Apply secure schema to prevent future attacks
- [ ] Consider upgrading to Pro plan
- [ ] Set up custom backup script
- [ ] Add monitoring and alerts

---

## Contact Information

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Support: https://supabase.com/dashboard/support
- Discord: https://discord.supabase.com

**Emergency Support:**
If you're on a paid plan, contact Supabase support immediately for help with recovery.

---

**Remember:** The sooner you act, the better your chances of recovery! 🏃‍♂️💨
