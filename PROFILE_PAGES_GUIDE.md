# CIA/FBI-Style Profile Pages - Setup Guide

## 🎯 Overview

You now have a complete profile system with **CIA/FBI document-style** pages that match your hacker theme. Users can create detailed profiles with photos and social links that are publicly searchable.

## 🆕 What's New

### 1. Profile Page (`/profile/[username]`)
- **CIA/FBI document styling** with classified document headers
- Passport-style photo display with barcode
- Personal information in document format
- Bio and detailed about sections
- Location information
- Social media links (GitHub, LinkedIn, X, Instagram, Facebook)
- Classification stamps and document footers
- Public and searchable

### 2. Edit Profile Page (`/profile/[username]/edit`)
- Photo upload functionality (max 5MB)
- All profile fields editable
- Real-time photo preview
- Form validation
- Success/error messages
- Auto-save functionality

### 3. Profile Search
- Search for profiles by username
- Search results show profile photos
- Shows user bio in preview
- Click to view full profile

### 4. Profile Button Enhancement
- "VIEW_PROFILE" link added to dropdown
- Quick access to your own profile
- Seamless navigation

## 📁 Files Created

### New Files:
1. `userinfo-schema.sql` - Database schema for profiles
2. `src/app/profile/[username]/page.tsx` - Profile view page
3. `src/app/profile/[username]/edit/page.tsx` - Profile edit page
4. `PROFILE_PAGES_GUIDE.md` - This guide

### Modified Files:
1. `src/types/index.ts` - Added UserInfo type
2. `src/lib/supabase.ts` - Added userinfo table types
3. `src/app/app/page.tsx` - Added profile search & dropdown link

## 🗄️ Database Setup

### Step 1: Run the SQL Schema

Open Supabase Dashboard → SQL Editor and run:

```sql
-- Copy the entire contents of userinfo-schema.sql
-- This will create:
-- 1. userinfo table
-- 2. profile-photos storage bucket
-- 3. Indexes for faster queries
-- 4. Row Level Security policies
-- 5. Auto-trigger for new users
```

Or run this file: `userinfo-schema.sql`

### Step 2: Verify Tables

Check in **Table Editor**:
- ✅ `userinfo` table exists
- ✅ `profile-photos` bucket in Storage

### What the Schema Does:

1. **Creates `userinfo` table** with fields:
   - Basic: username, photo_url, gender, email, phone
   - Bio: bio (short), about (long)
   - Social: github_url, linkedin_url, twitter_url, instagram_url, facebook_url
   - Address: address_line1, address_line2, city, state, country, postal_code
   - Settings: is_public (default true)

2. **Creates storage bucket** for profile photos

3. **Sets up RLS policies**:
   - Public profiles readable by everyone
   - Users can update their own profiles
   - Users can upload their own photos

4. **Auto-creates profile** when user registers

## 🎨 Profile Page Design

### CIA/FBI Document Style:

```
┌─────────────────────────────────────────────┐
│ CLASSIFIED DOCUMENT                         │
│ OPERATIVE_PROFILE                           │
│ CLEARANCE: TOP_SECRET                       │
│ DOC_ID: XXXXXXXX                           │
├─────────────────────────────────────────────┤
│                                 ┌─────────┐ │
│ PERSONAL_INFORMATION            │ PHOTO   │ │
│ NAME: John Doe                  │         │ │
│ USERNAME: @johndoe              │         │ │
│ EMAIL: john@example.com         │         │ │
│                                 │         │ │
│ BIO                            │ BARCODE │ │
│ Short description...            └─────────┘ │
│                                ┌──────────┐ │
│ ABOUT                          │CLASSIFIED│ │
│ Long detailed bio...           │ STAMP    │ │
│                                └──────────┘ │
│ SOCIAL_NETWORKS                             │
│ [GitHub] [LinkedIn] [X]                     │
│                                             │
│ LOCATION                                    │
│ City, State, Country                        │
├─────────────────────────────────────────────┤
│ DOCUMENT CLASSIFICATION: TOP SECRET         │
│ ⚠ WARNING: UNAUTHORIZED ACCESS PROHIBITED ⚠ │
└─────────────────────────────────────────────┘
```

### Color Scheme:
- Primary: Green (#00ff41)
- Background: Black
- Borders: Green with opacity
- Photo filter: Grayscale + high contrast (like ID photos)
- Classification stamp: Red border/text

## 📸 Photo Upload

### Features:
- Max file size: 5MB
- Recommended ratio: 3:4 (passport style)
- Automatic upload to Supabase Storage
- Real-time preview
- Grayscale filter applied
- Can be removed/replaced

### Upload Flow:
1. Click "UPLOAD_PHOTO"
2. Select image file
3. Preview appears instantly
4. Click "SAVE_PROFILE" to upload
5. Photo stored in `profile-photos` bucket

## 🔍 Search Functionality

### How It Works:
1. Type in search bar on main feed
2. Searches both posts AND profiles
3. Shows profiles matching:
   - Username
   - Bio text
4. Results display:
   - Profile photo thumbnail
   - Username with @
   - Short bio preview
5. Click to visit full profile

### Example:
```
Search: "developer"

PROFILES_FOUND:
┌────────────────┐  ┌────────────────┐
│ [Photo] @dev123│  │ [Photo] @coder │
│ Full stack dev │  │ Backend dev    │
└────────────────┘  └────────────────┘
```

## 🚀 Usage Guide

### Creating Your Profile:

1. **Register/Login** if you haven't
   
2. **Click profile button** → "VIEW_PROFILE"
   
3. **Click "EDIT_PROFILE"**

4. **Fill out information**:
   - Upload a photo (optional)
   - Add your email, phone (optional)
   - Write a short bio (max 160 chars)
   - Write detailed about section
   - Add social media links
   - Add location information

5. **Click "SAVE_PROFILE"**

### Viewing Profiles:

- **Your own**: Click profile button → VIEW_PROFILE
- **Others**: Search for username → Click result
- **From posts**: Click username on any post (if implemented)

### Editing Profile:

- Go to your profile page
- Click "EDIT_PROFILE"
- Make changes
- Click "SAVE_PROFILE"

## 🔒 Privacy

### Public by Default:
- All profiles are public (`is_public: true`)
- Searchable by all users
- Visible to anyone with the link

### Optional Fields:
- Email - can be left blank
- Phone - can be left blank
- Address - can be left blank
- Social links - can be left blank
- Photo - can be left blank

### What's Shared:
- Username (always)
- Name (always)
- Bio/About (if filled)
- Social links (if filled)
- Location (if filled)
- Photo (if uploaded)

## 📱 Responsive Design

Works perfectly on:
- **Desktop**: Full layout with photo on right
- **Tablet**: Stacked layout, still readable
- **Mobile**: Single column, optimized spacing

## 🎯 Key Features

### Document Style:
- ✅ Classification headers
- ✅ Document ID numbers
- ✅ Status indicators
- ✅ Barcode generation
- ✅ Classification stamps
- ✅ Footer warnings

### Functionality:
- ✅ Photo upload
- ✅ Form validation
- ✅ Real-time preview
- ✅ Auto-save
- ✅ Error handling
- ✅ Success messages
- ✅ Search integration
- ✅ Profile dropdown link

### Theme Consistency:
- ✅ Green/black color scheme
- ✅ Matrix background
- ✅ Scan lines
- ✅ Monospace font
- ✅ Terminal aesthetic
- ✅ Glitch effects
- ✅ Border styling

## 🔗 Routes

| Route | Description |
|-------|-------------|
| `/profile/[username]` | View user profile |
| `/profile/[username]/edit` | Edit your profile |
| `/app` | Main feed (with search) |
| `/auth/login` | Login page |
| `/auth/signup` | Registration page |

## 🛠️ Technical Details

### Photo Storage:
- **Bucket**: `profile-photos`
- **Path**: `{user_id}-{timestamp}.{ext}`
- **Public**: Yes
- **Max size**: 5MB

### Database:
- **Table**: `userinfo`
- **Foreign Key**: `user_id` → `users.id`
- **Unique**: `username`
- **Indexed**: `username`, `user_id`, `is_public`

### Search:
- **Posts**: Title, name, content
- **Profiles**: Username, bio
- **Limit**: 5 profiles per search
- **Case insensitive**: Yes

## 🎨 Customization

### Want to change the style?

1. **Colors**: Edit the green-400 classes
2. **Layout**: Modify grid layouts in page.tsx
3. **Photo style**: Change the filter property
4. **Fields**: Add/remove fields in edit page
5. **Search**: Modify search query logic

## 📋 Checklist

Setup:
- [ ] Run `userinfo-schema.sql` in Supabase
- [ ] Verify `userinfo` table exists
- [ ] Verify `profile-photos` bucket exists
- [ ] Restart dev server

Testing:
- [ ] Create/edit your profile
- [ ] Upload a photo
- [ ] Search for your profile
- [ ] View profile from dropdown
- [ ] Test on mobile device
- [ ] Test editing fields
- [ ] Test social links

## 🚨 Troubleshooting

### "Profile not found"
- User hasn't created a profile yet
- Username is incorrect
- Profile might be set to private (future feature)

### Photo won't upload
- Check file size < 5MB
- Check file is an image
- Check Supabase storage bucket exists
- Check storage policies are set

### Can't edit profile
- Make sure you're logged in
- You can only edit your own profile
- Check user permissions

### Search not showing profiles
- Run the schema to create userinfo table
- Make sure profiles have is_public = true
- Check username matches search query

## 🎉 Success!

You now have a fully functional profile system with:
- ✅ CIA/FBI document styling
- ✅ Photo upload
- ✅ Comprehensive profile fields
- ✅ Search integration
- ✅ Public profiles
- ✅ Edit functionality
- ✅ Perfect theme match

**The profiles look like classified government documents with the hacker aesthetic!** 🕵️‍♂️💻

