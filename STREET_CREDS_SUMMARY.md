# 🎯 Street Cred System - What Changed

## Quick Summary

Your platform now has a **Street Cred system** instead of likes/reactions! It's cleaner, cooler, and more aligned with developer culture.

## Visual Changes

### Before: Complex Reactions
```
[👍 5] [❤️] [😂] [😠]  ← Multiple reaction buttons
```

### After: Street Creds
```
[🏆 5 CREDS]  ← Single, prominent button
```

## Files Changed

### ✅ Database Migration Scripts
- **`migration-to-street-creds.sql`** - Converts existing data
- **`street-creds-schema.sql`** - Fresh schema for new setups

### ✅ Type Definitions
- **`src/types/index.ts`**
  - `likes_count` → `street_creds_count`
  - `Reaction` → `StreetCred` (simplified)

### ✅ Components
- **`src/components/PostCard.tsx`**
  - Removed: 4 reaction buttons (like, heart, laugh, angry)
  - Added: Single Street Cred button with Award icon
  - Color: Green → Yellow when active
  - Shows: "1 CRED" or "42 CREDS"

- **`src/app/app/page.tsx`**
  - Metrics: "TOTAL_REACTIONS" → "STREET_CREDS"
  - Color: Red → Yellow
  - Trending algorithm updated

- **`src/app/page.tsx`**
  - Landing page feature updated
  - "REACT_&_ENGAGE" → "STREET_CRED_SYSTEM"

## Database Changes

### Table Changes
| Old | New |
|-----|-----|
| `reactions` table with `type` column | `street_creds` table (no type) |
| `posts.likes_count` | `posts.street_creds_count` |
| 5 reaction types | 1 street cred action |

### Data Migration
All existing reactions (likes, hearts, laughs, angry) will be **summed up** and converted to street creds. No data is lost!

Example:
- Post had: 3 likes + 2 hearts + 1 laugh = **6 street creds**

## How to Apply

### Step 1: Database Migration
1. Open Supabase SQL Editor
2. Run `migration-to-street-creds.sql`
3. Verify with test queries

### Step 2: Deploy Code
```bash
# The code is already updated in your repo!
# Just deploy:
npm run build
# or deploy to Vercel/your platform
```

### Step 3: Test
- Give a Street Cred to a post
- Remove it (toggle off)
- Check metrics sidebar
- Verify trending posts

## Key Features

### Street Cred Button Behavior
- **Click once:** Give Street Cred (button turns yellow, glows)
- **Click again:** Remove Street Cred (toggle off)
- **One per user per post:** Can't spam creds
- **Updates in real-time:** Count updates immediately

### Metrics Display
- Shows total Street Creds across all posts
- Yellow color for visual distinction
- Updates live as users give creds

### Trending Algorithm
Posts ranked by: `street_creds_count + comments_count + views_count`

## Terminology Guide

- **Street Cred** (singular): One unit of respect/credibility
- **Street Creds** (plural): Multiple units
- **Creds** (short): Casual abbreviation
- **Give Creds**: Action of showing respect for a post

## What Users Will See

### Metrics Sidebar
```
┌─ SYSTEM_METRICS.exe ────┐
│ ACTIVE_POSTS:      42   │
│ STREET_CREDS:     1337  │ ← New!
│ COMMENTS:          89   │
│ STATUS:         ONLINE  │
└─────────────────────────┘
```

### Post Card
```
┌────────────────────────────────┐
│ 🚀 Amazing TypeScript Tip      │
│ by DevUser • 2h ago            │
├────────────────────────────────┤
│ Here's how to...               │
│                                │
│ [🏆 15 CREDS]                  │ ← New!
│ 💬 8 comments                  │
└────────────────────────────────┘
```

## Breaking Changes

⚠️ **Database Schema**: Yes, requires migration
⚠️ **API Endpoints**: Changed from `reactions` to `street_creds`
✅ **Data Preservation**: All existing reactions converted to creds
✅ **Backwards Compatible Code**: No (old code won't work with new schema)

## Next Steps

1. **Backup your database** (always!)
2. **Run migration script** in Supabase
3. **Deploy updated code**
4. **Test thoroughly**
5. **Celebrate** 🎉 - You now have a unique Street Cred system!

## Questions?

Check `STREET_CREDS_MIGRATION_GUIDE.md` for detailed instructions.

---

**Status:** Ready to Deploy ✅
**Migration Risk:** Low (data is preserved)
**User Impact:** High (better UX!)

