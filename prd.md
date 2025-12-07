# Product Requirements Document: Blog Feature

## Overview

**Feature Name:** Authenticated Blog System  
**Version:** 1.0  
**Date:** 2025-01-24  
**Status:** Planning  
**Priority:** High

### Executive Summary

Implement a blog feature that allows authenticated users to create, edit, and manage long-form blog posts. This feature will be exclusive to users with accounts, creating a premium content layer above the existing anonymous bulletin board. The blog will maintain the cyberpunk aesthetic and integrate seamlessly with the existing user profile and authentication systems.

---

## Problem Statement

### Current State
- The platform supports anonymous posts (rants) that are ephemeral and community-driven
- Users can create accounts and build profiles, but there's no mechanism for authenticated users to create persistent, long-form content
- No way for users to establish thought leadership or share detailed technical content

### Opportunity
- Provide authenticated users with a platform to share in-depth technical content, tutorials, and long-form thoughts
- Create a content layer that rewards account creation and engagement
- Enable users to build a portfolio of technical writing within the platform
- Differentiate between quick anonymous rants and curated blog content

---

## Goals & Success Metrics

### Primary Goals
1. **User Engagement**: Increase account creation by 30% within 3 months
2. **Content Quality**: Establish a curated space for high-quality technical content
3. **User Retention**: Increase authenticated user session duration by 25%
4. **Content Volume**: Achieve 50+ blog posts in the first month post-launch

### Success Metrics
- Number of blog posts created per week
- Average blog post read time
- Blog post engagement rate (comments, street creds)
- Conversion rate from anonymous user to account creation
- Blog post views vs. anonymous post views ratio

---

## User Stories

### As an Authenticated User
1. **As a developer**, I want to write long-form technical blog posts so that I can share detailed tutorials and insights with the community.
2. **As a content creator**, I want to edit my blog posts so that I can refine my content over time.
3. **As a user**, I want to see a list of all my blog posts so that I can manage my content portfolio.
4. **As a reader**, I want to discover blog posts from other developers so that I can learn from their experiences.
5. **As a blogger**, I want my blog posts to appear on my profile so that visitors can see my writing history.

### As an Anonymous User
1. **As a visitor**, I want to read blog posts so that I can access valuable content, even without an account.
2. **As a reader**, I want to see a prompt to create an account when I try to create a blog post so that I understand the requirement.

---

## Feature Requirements

### 1. Blog Post Creation

#### 1.1 Access Control
- **Requirement**: Only authenticated users can create blog posts
- **Implementation**: 
  - Check `isAuthenticated()` before showing create blog UI
  - Redirect to login page if unauthenticated user attempts to create
  - Show clear messaging about account requirement

#### 1.2 Blog Post Editor
- **Rich Text Editor**: Markdown support with live preview
- **Fields**:
  - Title (required, max 200 characters)
  - Slug (auto-generated from title, editable, unique)
  - Content (required, markdown supported)
  - Excerpt/Summary (optional, max 500 characters)
  - Featured Image (optional, stored in Supabase Storage)
  - Tags (optional, array of strings)
  - Published Status (draft/published)
  - SEO Meta Description (optional)

#### 1.3 Editor Features
- Markdown syntax highlighting
- Code block support with syntax highlighting
- Image upload and embedding
- Link insertion
- Preview mode (split view or toggle)
- Auto-save drafts every 30 seconds
- Character/word count
- Reading time estimation

### 2. Blog Post Display

#### 2.1 Blog Post Page
- **Route**: `/blog/[slug]`
- **Layout**:
  - Author information (name, avatar, archetype badge)
  - Publication date and reading time
  - Table of contents (auto-generated from headings)
  - Social share buttons
  - Street creds and comments section
  - Related posts section
  - Author bio card at bottom

#### 2.2 Blog Listing Pages
- **Route**: `/blog`
- **Features**:
  - Pagination (20 posts per page)
  - Filter by author
  - Filter by tags
  - Sort by: newest, most street creds, most comments, trending
  - Search functionality
  - Featured posts section

#### 2.3 Blog Feed Integration
- Display latest blog posts in main app feed (with "BLOG" badge)
- Show blog post previews in trending section
- Link to full blog post from preview

### 3. Blog Management

#### 3.1 User Blog Dashboard
- **Route**: `/blog/manage` (authenticated only)
- **Features**:
  - List of all user's blog posts (drafts and published)
  - Quick stats: total posts, total views, total street creds
  - Quick actions: edit, delete, duplicate, view
  - Filter by status (draft/published)
  - Search own posts

#### 3.2 Blog Post Actions
- **Edit**: Full editor access for own posts
- **Delete**: Soft delete with confirmation modal
- **Duplicate**: Create a copy of existing post
- **Publish/Unpublish**: Toggle publication status
- **View Analytics**: Views, street creds, comments count

### 4. Profile Integration

#### 4.1 Profile Page Enhancement
- Add "Blog Posts" section to user profile
- Display latest 3-5 blog posts with previews
- Link to "View All Blog Posts" page
- Show blog post count in profile stats

#### 4.2 Author Pages
- **Route**: `/blog/author/[username]`
- Display all blog posts by specific author
- Author bio and stats
- Follow/subscribe option (future feature)

### 5. Engagement Features

#### 5.1 Comments
- Reuse existing comment system
- Threaded comments for blog posts
- Comment moderation (author can delete comments on their posts)

#### 5.2 Street Creds
- Reuse existing street creds system
- Display prominently on blog posts
- Show street creds in blog listing

#### 5.3 Social Sharing
- Share buttons for Twitter, LinkedIn, Reddit
- Copy link functionality
- Open Graph meta tags for rich previews

---

## Technical Requirements

### Database Schema

#### New Table: `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  meta_description TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views_count INTEGER DEFAULT 0,
  street_creds_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Indexes
  CONSTRAINT unique_slug UNIQUE (slug)
);

CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
```

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published blog posts
CREATE POLICY "Allow read access to published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Authors can read their own posts (including drafts)
CREATE POLICY "Authors can read own blog posts" ON blog_posts
  FOR SELECT USING (auth.uid() = author_id);

-- Only authenticated users can create blog posts
CREATE POLICY "Authenticated users can create blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

-- Authors can update their own blog posts
CREATE POLICY "Authors can update own blog posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own blog posts
CREATE POLICY "Authors can delete own blog posts" ON blog_posts
  FOR DELETE USING (auth.uid() = author_id);
```

#### Update Existing Tables
- Add `blog_post_id` to `street_creds` table (optional, for tracking blog-specific creds)
- Add `blog_post_id` to `comments` table (optional, for blog-specific comments)

### API Routes

#### Server Actions (Next.js 15 App Router)
- `createBlogPost`: Create new blog post
- `updateBlogPost`: Update existing blog post
- `deleteBlogPost`: Soft delete blog post
- `publishBlogPost`: Change status to published
- `getBlogPost`: Fetch single blog post by slug
- `getBlogPosts`: Fetch paginated list of blog posts
- `getUserBlogPosts`: Fetch user's blog posts
- `incrementBlogViews`: Track blog post views

### Components

#### New Components
1. **`BlogEditor.tsx`**: Rich text editor with markdown support
2. **`BlogPostCard.tsx`**: Blog post preview card
3. **`BlogPostView.tsx`**: Full blog post display page
4. **`BlogList.tsx`**: Paginated blog listing
5. **`BlogManage.tsx`**: User blog management dashboard
6. **`TableOfContents.tsx`**: Auto-generated TOC from headings
7. **`BlogPostPreview.tsx`**: Preview in main feed

#### Modified Components
1. **`PostCard.tsx`**: Add support for blog post type
2. **Profile Page**: Add blog posts section

### File Structure
```
src/
  app/
    blog/
      [slug]/
        page.tsx          # Individual blog post page
      author/
        [username]/
          page.tsx        # Author's blog posts
      manage/
        page.tsx          # Blog management dashboard
      create/
        page.tsx          # Create new blog post
      edit/
        [slug]/
          page.tsx        # Edit blog post
      page.tsx             # Blog listing page
    api/
      blog/
        route.ts           # Blog API endpoints
  components/
    blog/
      BlogEditor.tsx
      BlogPostCard.tsx
      BlogPostView.tsx
      BlogList.tsx
      BlogManage.tsx
      TableOfContents.tsx
      BlogPostPreview.tsx
```

---

## Design Requirements

### Visual Design
- **Maintain Cyberpunk Aesthetic**: 
  - Neon green borders (`#00FF41`)
  - Dark background (`#0A0A0A`)
  - Glitch effects on hover
  - Terminal-style typography
  - Matrix-inspired accents

### UI Components
- **Blog Editor**: 
  - Split-pane editor (markdown | preview)
  - Cyberpunk-styled toolbar
  - Code syntax highlighting with neon theme
  - Auto-save indicator

- **Blog Post Display**:
  - Large, readable typography for content
  - Code blocks with dark theme and syntax highlighting
  - Author card with archetype badge
  - Social share buttons with hover effects

- **Blog Listing**:
  - Grid layout (responsive: 1 col mobile, 2 col tablet, 3 col desktop)
  - Featured image thumbnails
  - Excerpt preview
  - Author info and publication date
  - Street creds and comment count badges

### Responsive Design
- Mobile-first approach
- Editor adapts to mobile (stacked view instead of split)
- Touch-friendly controls
- Readable typography at all screen sizes

---

## User Experience Flow

### Creating a Blog Post
1. User navigates to `/blog/create` (or clicks "Write Blog Post" button)
2. If not authenticated, redirect to `/auth/login` with return URL
3. User sees blog editor with title, content, and metadata fields
4. User writes content in markdown editor
5. Auto-save creates draft every 30 seconds
6. User can preview post before publishing
7. User clicks "Publish" → post status changes to "published"
8. Post appears in blog listing and user's profile

### Reading a Blog Post
1. User discovers post via:
   - Blog listing page
   - Main feed (with BLOG badge)
   - Author profile
   - Direct link/share
2. User clicks post → navigates to `/blog/[slug]`
3. Post displays with full content, author info, engagement metrics
4. User can give street creds, comment, or share
5. Related posts shown at bottom

### Managing Blog Posts
1. Authenticated user navigates to `/blog/manage`
2. Sees list of all their posts (drafts and published)
3. Can filter, search, and perform actions
4. Can edit, delete, duplicate, or change publication status

---

## Security & Privacy

### Access Control
- **Read Access**: Anyone can read published blog posts
- **Write Access**: Only authenticated users can create blog posts
- **Edit/Delete Access**: Only post author can edit/delete their posts
- **Draft Access**: Only author can view their own drafts

### Data Protection
- Input sanitization for XSS prevention
- Markdown sanitization
- Image upload validation (file type, size limits)
- Rate limiting on blog post creation (prevent spam)
- Slug uniqueness enforcement

### Content Moderation (Future)
- Flag inappropriate content
- Admin moderation tools
- Auto-moderation for spam detection

---

## Performance Requirements

### Page Load Times
- Blog listing page: < 2s FCP
- Blog post page: < 1.5s FCP
- Blog editor: < 2s FCP

### Optimization
- Lazy load blog post images
- Pagination for blog listings
- Code splitting for editor component
- Static generation for published blog posts (ISR with 1 hour revalidation)
- CDN caching for images

### Database Performance
- Indexes on frequently queried columns
- Efficient pagination queries
- Caching for popular blog posts

---

## Analytics & Tracking

### Metrics to Track
- Blog post creation rate
- Blog post views
- Average reading time
- Engagement rate (street creds, comments)
- Popular tags
- Popular authors
- Conversion funnel: anonymous → account → blog post creation

### Implementation
- PostHog event tracking for blog actions
- Google Analytics (if applicable)
- Custom analytics dashboard in admin panel (future)

---

## Future Enhancements (Out of Scope for V1)

### Phase 2 Features
1. **Blog Categories**: Organize posts by technical categories
2. **Series/Collections**: Group related blog posts
3. **Newsletter Integration**: Email subscribers when new posts published
4. **RSS Feed**: Generate RSS feed for blog posts
5. **Search**: Full-text search across blog content
6. **Reading Lists**: Save posts for later reading
7. **Follow Authors**: Get notified when followed authors publish
8. **Blog Analytics Dashboard**: Detailed analytics for authors
9. **SEO Optimization**: Advanced SEO tools and meta tags
10. **Multi-language Support**: Translate blog posts

### Advanced Features
- Collaborative editing
- Version history
- Scheduled publishing
- Blog post templates
- Import from Medium/Dev.to
- Export to Markdown/PDF

---

## Dependencies

### External Libraries
- **Markdown Editor**: Consider `react-markdown-editor-lite` or `@uiw/react-md-editor`
- **Syntax Highlighting**: `prismjs` or `highlight.js` with cyberpunk theme
- **Markdown Rendering**: `react-markdown` with `remark-gfm`
- **Slug Generation**: `slugify` library
- **Reading Time**: `reading-time` library

### Internal Dependencies
- Existing authentication system (`src/lib/auth.ts`)
- Existing Supabase client (`src/lib/supabase.ts`)
- Existing UI components (buttons, cards, etc.)
- Existing street creds and comments system

---

## Testing Requirements

### Unit Tests
- Blog post creation/update/delete functions
- Slug generation and uniqueness
- Markdown parsing and rendering
- Access control checks

### Integration Tests
- End-to-end blog post creation flow
- Authentication checks
- RLS policy enforcement
- Image upload functionality

### User Acceptance Testing
- Test with real users before launch
- Gather feedback on editor UX
- Validate cyberpunk aesthetic consistency

---

## Launch Plan

### Phase 1: MVP (Week 1-2)
- Database schema setup
- Basic blog editor (markdown only)
- Blog post creation and display
- Basic listing page
- Profile integration

### Phase 2: Polish (Week 3)
- Rich text editor enhancements
- Image upload and management
- Blog management dashboard
- SEO optimization
- Performance optimization

### Phase 3: Launch (Week 4)
- Beta testing with select users
- Bug fixes and refinements
- Documentation
- Public launch announcement

---

## Open Questions

1. **Content Format**: Should we support HTML in addition to Markdown?
2. **Image Storage**: Use existing Supabase Storage bucket or create separate blog bucket?
3. **Comment System**: Use existing comments table or create blog-specific comments?
4. **Moderation**: What level of content moderation is needed at launch?
5. **Limits**: Should there be limits on blog post length, number of posts per user?
6. **Monetization**: Any plans for monetization features (future consideration)?

---

## Appendix

### Related Documents
- [Authentication System Documentation](./src/lib/auth.ts)
- [Database Schema](./supabase-schema.sql)
- [Profile Feature Guide](./PROFILE_FEATURE_GUIDE.md)

### References
- Next.js 15 App Router Documentation
- Supabase RLS Best Practices
- Markdown Specification
- Cyberpunk Design System (existing app styles)

---

**Document Owner**: Product Team  
**Last Updated**: 2025-01-24  
**Next Review**: After MVP completion

