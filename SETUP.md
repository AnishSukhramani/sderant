# Setup Instructions

## Environment Variables Required

This application requires Supabase configuration. Please follow these steps:

### 1. Create Environment File

Create a `.env.local` file in the project root with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Go to Settings > API
4. Copy your Project URL and anon/public key

### 3. Database Setup

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor to create the required tables.

### 4. Storage Setup (Optional)

If you want image uploads to work:

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `post-images`
3. Set it to public

### 5. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## Features

- ✅ CLI-style post creation interface
- ✅ Anonymous posting
- ✅ Real-time updates
- ✅ Image uploads (when configured)
- ✅ Trending posts
- ✅ Comments and reactions

## Troubleshooting

If you see "CONFIGURATION REQUIRED" message, make sure:
1. Your `.env.local` file exists
2. Environment variables are correctly set
3. You've restarted the development server
4. Your Supabase project is active
