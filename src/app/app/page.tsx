'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PostForm } from '@/components/PostForm'
import { PostCard } from '@/components/PostCard'
import { TrendingFilter } from '@/components/TrendingFilter'
import { Terminal } from '@/components/Terminal'
import { TimeDisplay } from '@/components/TimeDisplay'
import { TrendingUp, Clock, Search, X } from 'lucide-react'
import Link from 'next/link'
import type { Post, TrendingPeriod } from '@/types'

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingPeriod, setTrendingPeriod] = useState<TrendingPeriod>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [terminalVisible, setTerminalVisible] = useState(false)

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')

      // Apply search filter if search query exists
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      // Apply time filter
      if (trendingPeriod === 'hour') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', oneHourAgo)
      } else if (trendingPeriod === 'day') {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', oneDayAgo)
      }

      // Order by created_at for search results, or by trending score for normal view
      if (searchQuery.trim()) {
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // Check if it's a configuration error
        if (error.message && error.message.includes('Supabase not configured')) {
          setPosts([])
          return
        }
      } else {
        // Sort by trending score (likes + comments + views) only if not searching
        const sortedPosts = searchQuery.trim() 
          ? data || []
          : data?.sort((a: Post, b: Post) => {
              const scoreA = a.likes_count + a.comments_count + a.views_count
              const scoreB = b.likes_count + b.comments_count + b.views_count
              return scoreB - scoreA
            }) || []
        setPosts(sortedPosts)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [trendingPeriod, searchQuery])

  useEffect(() => {
    fetchPosts()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchPosts])

  const handleNewPost = () => {
    fetchPosts()
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-green-400/20 bg-black/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-4 md:hidden">
            {/* Top Row - Logo and Terminal Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Terminal className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                <Link href="/">
                  <h1 className="text-lg md:text-2xl font-bold glitch cursor-pointer">
                    LIFE_AS_SDE.exe
                  </h1>
                </Link>
              </div>
              <button
                onClick={() => setTerminalVisible(!terminalVisible)}
                className="px-3 py-1.5 text-sm border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              >
                {terminalVisible ? 'HIDE' : 'INFO'}
              </button>
            </div>
            
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative w-full">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-green-400/70 absolute left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="pl-10 pr-8 py-2 w-full bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/50 focus:border-green-400 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-green-400/70 hover:text-green-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Trending Filter - Full Width on Mobile */}
            <div className="w-full">
              <TrendingFilter 
                period={trendingPeriod} 
                onPeriodChange={setTrendingPeriod}
              />
            </div>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Terminal className="w-8 h-8 text-green-400" />
              <Link href="/">
                <h1 className="text-2xl font-bold glitch cursor-pointer">
                  LIFE_AS_SDE.exe
                </h1>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-green-400/70 absolute left-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="pl-10 pr-8 py-2 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/50 focus:border-green-400 focus:outline-none transition-colors w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-green-400/70 hover:text-green-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              <TrendingFilter 
                period={trendingPeriod} 
                onPeriodChange={setTrendingPeriod}
              />
              <button
                onClick={() => setTerminalVisible(!terminalVisible)}
                className="px-4 py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              >
                {terminalVisible ? 'HIDE_INFO' : 'SHOW_INFO'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Indicator */}
      {searchQuery.trim() && (
        <div className="relative z-10 border-b border-green-400/20 bg-black/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm sm:text-base">
                  Search results for: <span className="font-bold">&ldquo;{searchQuery}&rdquo;</span>
                </span>
                <span className="text-green-400/70 text-sm sm:text-base">
                  ({posts.length} {posts.length === 1 ? 'result' : 'results'})
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center space-x-1 text-green-400/70 hover:text-green-400 transition-colors text-sm sm:text-base self-start sm:self-auto"
              >
                <X className="w-4 h-4" />
                <span>Clear search</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Layout - Responsive */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* CLI Metrics - Mobile: Full width, Desktop: 20% sidebar */}
        <div className="w-full lg:w-1/5 bg-black/20 border-b lg:border-b-0 lg:border-r border-transparent p-4">
          <div className="lg:sticky lg:top-20">
            <div className="bg-black/80 backdrop-blur-sm p-4 font-mono text-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">SYSTEM_METRICS.exe</span>
              </div>
              
              <div className="space-y-2 text-green-400/80">
                <div className="flex justify-between">
                  <span className="text-green-400/60">ACTIVE_POSTS:</span>
                  <span className="text-green-400 font-bold">{posts.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-400/60">TOTAL_REACTIONS:</span>
                  <span className="text-red-400 font-bold">
                    {posts.reduce((sum, post) => sum + post.likes_count, 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-400/60">COMMENTS:</span>
                  <span className="text-blue-400 font-bold">
                    {posts.reduce((sum, post) => sum + post.comments_count, 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-400/60">STATUS:</span>
                  <span className="text-green-400 font-bold">ONLINE</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-green-400/60">UPTIME:</span>
                  <span className="text-green-400 font-bold">24/7</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-green-400/20">
              <div className="text-xs text-green-400/50">
                <div className="flex justify-between">
                  <span>LAST_UPDATE:</span>
                  <TimeDisplay />
                </div>
                <div className="flex justify-between">
                  <span>NODE_ID:</span>
                  <span>life-as-sde-001</span>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 80% */}
        <main className="flex-1 relative z-10 px-4 py-8 pb-32">
          {/* Terminal Info */}
          {terminalVisible && (
            <div className="mb-8 border border-green-400 bg-black/90 p-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400/70 ml-4">info@life-as-sde:~$</span>
              </div>
              <div className="text-sm">
                <p className="text-green-400/70">System Status: ONLINE</p>
                <p className="text-green-400/70">Use the terminal at the bottom to interact with the system</p>
                <p className="text-green-400/70">Press Ctrl+` or click OPEN_TERMINAL to start</p>
              </div>
            </div>
          )}

          {/* Configuration Status */}
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className="border border-red-400/50 bg-red-900/20 p-4 mb-8">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="text-lg font-bold text-red-400">CONFIGURATION REQUIRED</h3>
              </div>
              <div className="text-sm text-red-300/80">
                <p className="mb-2">❌ Supabase is not configured. Please set up your environment variables:</p>
                <div className="bg-black/50 p-3 border border-red-400/30 font-mono text-xs">
                  <p>1. Create a <code className="text-green-400">.env.local</code> file in your project root</p>
                  <p>2. Add the following variables:</p>
                  <p className="ml-4 text-green-400">NEXT_PUBLIC_SUPABASE_URL=your_supabase_url</p>
                  <p className="ml-4 text-green-400">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key</p>
                  <p>3. Restart your development server</p>
                </div>
              </div>
            </div>
          )}

          {/* Posts Layout - Responsive */}
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Left Side - Trending Posts */}
            <div className="w-full xl:w-1/2">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-green-400 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>TRENDING_POSTS.exe</span>
                </h2>
                <p className="text-sm text-green-400/70">All-time trending content</p>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                    <p className="mt-2 text-green-400/70 text-sm">Loading trending...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 border border-green-400/20 bg-black/50">
                    <Terminal className="w-12 h-12 mx-auto mb-2 text-green-400/50" />
                    <h3 className="text-lg font-bold mb-1">No trending posts</h3>
                    <p className="text-green-400/70 text-sm">Be the first to create content!</p>
                  </div>
                ) : (
                  posts
                    .sort((a, b) => {
                      const scoreA = a.likes_count + a.comments_count + a.views_count
                      const scoreB = b.likes_count + b.comments_count + b.views_count
                      return scoreB - scoreA
                    })
                    .slice(0, 10)
                    .map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                )}
              </div>
            </div>

            {/* Right Side - Recent Posts */}
            <div className="w-full xl:w-1/2">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-green-400 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>RECENT_POSTS.exe</span>
                </h2>
                <p className="text-sm text-green-400/70">Latest community activity</p>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                    <p className="mt-2 text-green-400/70 text-sm">Loading recent...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 border border-green-400/20 bg-black/50">
                    <Terminal className="w-12 h-12 mx-auto mb-2 text-green-400/50" />
                    <h3 className="text-lg font-bold mb-1">No recent posts</h3>
                    <p className="text-green-400/70 text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  posts
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((post) => (
                      <PostCard key={`recent-${post.id}`} post={post} />
                    ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-green-400/20 bg-black/80 backdrop-blur-sm mt-16 mb-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-green-400/70">
            <p>Built with Next.js + Supabase | Anonymous Tech Discussions</p>
            <p>No cookies, no tracking, just pure developer chaos</p>
          </div>
        </div>
      </footer>

      {/* Post Form - Fixed at bottom with highest z-index */}
      <PostForm onPostCreated={handleNewPost} />
    </div>
  )
}

