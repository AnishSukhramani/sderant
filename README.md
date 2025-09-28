# Life as an SDE - Tech Bulletin Board

A fun, anonymous tech bulletin board where developers can share thoughts, memes, and experiences without needing accounts.

## Features

- 🚀 **Anonymous Posting** - No accounts needed, just post freely
- 🖼️ **Image Support** - Attach images to your posts
- 💬 **Real-time Comments** - Instant commenting system
- 😄 **Reactions** - Like, heart, laugh, or express anger
- 📈 **Trending Algorithm** - See what's hot in the last hour, day, or all time
- ⚡ **Real-time Updates** - Live feed updates using Supabase subscriptions
- 🎨 **Geeky UI** - Terminal-inspired design with glitch effects

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom terminal theme
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase Realtime subscriptions
- **Icons**: Lucide React

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo>
cd life-as-sde
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set up Database

1. Go to your Supabase project's SQL Editor
2. Run the contents of `supabase-schema.sql` to create the database tables
3. Run the contents of `setup-storage.sql` to set up image storage

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your tech bulletin board!

## Database Schema

### Posts Table
- `id` - UUID primary key
- `name` - Optional display name
- `title` - Post title (required)
- `content` - Post content (required)
- `image_url` - Optional image URL
- `created_at` - Timestamp
- `likes_count` - Number of reactions
- `comments_count` - Number of comments
- `views_count` - Number of views

### Comments Table
- `id` - UUID primary key
- `post_id` - Foreign key to posts
- `name` - Optional commenter name
- `content` - Comment content
- `created_at` - Timestamp

### Reactions Table
- `id` - UUID primary key
- `post_id` - Foreign key to posts
- `type` - Reaction type (like, dislike, laugh, angry, heart)
- `ip_address` - Anonymous identifier
- `created_at` - Timestamp

## Features in Detail

### Anonymous System
- No user accounts required
- Uses IP addresses for basic reaction tracking
- Optional name fields for personalization

### Real-time Updates
- Live post updates using Supabase subscriptions
- Instant comment and reaction updates
- No page refresh needed

### Trending Algorithm
- Combines likes, comments, and views for trending score
- Filter by time periods (hour, day, all time)
- Real-time trending calculations

### Image Upload
- Direct upload to Supabase Storage
- Automatic URL generation
- Image preview before posting

## Customization

### Styling
The app uses a custom terminal theme with:
- Dark background (#0a0a0a)
- Green text (#00ff41)
- Orange accents (#ff6b35)
- Glitch effects for headings
- Matrix-style background patterns

### Database
All database operations use Supabase's client library with Row Level Security (RLS) enabled for anonymous access.

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add your environment variables
4. Deploy!

### Other Platforms
The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## Contributing

Feel free to submit issues and enhancement requests! This is meant to be a fun, community-driven project.

## License

MIT License - feel free to use this for your own projects!