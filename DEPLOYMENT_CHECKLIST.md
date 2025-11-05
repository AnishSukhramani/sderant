# 🚀 Street Cred System - Deployment Checklist

## Pre-Deployment

### 1. Review Changes
- [x] Database migration scripts created
- [x] TypeScript types updated
- [x] PostCard component updated
- [x] App page metrics updated
- [x] Landing page updated
- [x] No linter errors

### 2. Backup (Optional but Recommended)
Even though the SAFE migration keeps your data, you can still:
```bash
# Option 1: Export tables manually from Supabase Dashboard
# Table Editor → reactions → ... → Download as CSV
# Table Editor → posts → ... → Download as CSV

# Option 2: Use pg_dump if you have database access
pg_dump -h your-host -U postgres -t reactions -t posts > backup.sql
```

## Deployment Steps

### Step 1: Run Database Migration 🗃️

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy contents of `migration-to-street-creds-SAFE.sql`
4. Paste and click **RUN**
5. Wait for success message

**Expected output:**
```
Success. No rows returned
```

### Step 2: Verify Migration ✅

Run these verification queries in SQL Editor:

```sql
-- Check if backup exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'reactions_backup';
-- Should return: reactions_backup

-- Check top posts by street creds
SELECT id, title, street_creds_count 
FROM posts 
ORDER BY street_creds_count DESC 
LIMIT 5;
-- Should show posts with counts

-- Verify new table exists
SELECT COUNT(*) FROM street_creds;
-- Should return a number (0 or more)
```

### Step 3: Deploy Code 🚀

```bash
# Make sure all changes are committed
git add .
git commit -m "feat: implement Street Cred system"

# Deploy (depending on your platform)
# Vercel:
vercel --prod

# Or push to main (if auto-deploy is set up):
git push origin main

# Or build locally:
npm run build
npm start
```

### Step 4: Test Functionality 🧪

#### Test 1: Give Street Cred
1. ✅ Open your app
2. ✅ Find a post
3. ✅ Click the Street Cred button (green Award icon)
4. ✅ Button should turn yellow
5. ✅ Count should increase by 1

#### Test 2: Remove Street Cred
1. ✅ Click the same button again (now yellow)
2. ✅ Button should turn back to green
3. ✅ Count should decrease by 1

#### Test 3: Persistence
1. ✅ Give a Street Cred to a post
2. ✅ Refresh the page
3. ✅ Button should still be yellow (your cred persisted)

#### Test 4: Multiple Posts
1. ✅ Give creds to several different posts
2. ✅ Each should update independently
3. ✅ Check metrics sidebar - total should update

#### Test 5: Mobile
1. ✅ Test on mobile device or responsive mode
2. ✅ Button should be clickable and responsive
3. ✅ Animations should work smoothly

### Step 5: Monitor 👀

#### Check Database
```sql
-- Total street creds given
SELECT COUNT(*) as total_creds FROM street_creds;

-- Most credded posts
SELECT 
  p.title,
  p.street_creds_count,
  COUNT(sc.id) as actual_creds
FROM posts p
LEFT JOIN street_creds sc ON sc.post_id = p.id
GROUP BY p.id, p.title, p.street_creds_count
ORDER BY p.street_creds_count DESC
LIMIT 10;
```

#### Check Application Logs
- No console errors
- No failed API calls
- Database queries executing successfully

## Post-Deployment

### Day 1-7: Monitor
- ✅ Users can give/remove creds
- ✅ Counts are accurate
- ✅ No performance issues
- ✅ Metrics dashboard updates correctly
- ✅ Trending algorithm works

### After 1 Week: Optional Cleanup

If everything works perfectly for a week, you can optionally run the cleanup script:

1. Open `migration-to-street-creds-CLEANUP.sql`
2. Review the commented code
3. Uncomment the DROP commands
4. Run in Supabase SQL Editor
5. This permanently deletes the backup `reactions_backup` table

**Warning:** Only do this if you're 100% confident!

## Rollback Procedure (If Needed)

If something goes wrong:

### Emergency Rollback
```bash
# 1. Run rollback script in Supabase
# Open migration-ROLLBACK.sql and execute

# 2. Revert code changes
git revert HEAD
git push origin main

# 3. Redeploy old code
vercel --prod
```

## Success Criteria ✅

Your deployment is successful if:

- [x] Users can give Street Creds to posts
- [x] Users can remove Street Creds (toggle)
- [x] Counts display correctly
- [x] Button states persist after page reload
- [x] Metrics sidebar shows accurate totals
- [x] No console errors
- [x] No database errors
- [x] Mobile works perfectly
- [x] Trending algorithm factors in street creds

## Troubleshooting

### Issue: Button doesn't change color
**Fix:** Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: Count doesn't update
**Check:** Database trigger is installed
```sql
-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'update_street_creds_count';
```

### Issue: Can give multiple creds to same post
**Check:** UNIQUE constraint exists
```sql
-- Verify constraint
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'street_creds' AND constraint_type = 'UNIQUE';
```

### Issue: Old reactions still showing
**Check:** Migration completed fully
```sql
-- Check if reactions_backup exists
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('reactions', 'reactions_backup');
-- Should only show reactions_backup
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Review the verification queries
4. Use rollback script if needed
5. Check `STREET_CREDS_IMPLEMENTATION.md` for technical details

## Final Notes

- 🎉 The Street Cred system is a direct replacement for likes
- 🔄 No functionality is lost, just rebranded
- 🎨 Much cooler branding that fits developer culture
- 📊 Same analytics and metrics capabilities
- 🚀 Better UX with instant feedback

---

**Deployment Date:** _________  
**Deployed By:** _________  
**Status:** ⬜ Ready / ⬜ In Progress / ⬜ Complete  

Good luck! 🍀 You've got this! 🏆

