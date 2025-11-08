'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { PostForm } from '@/components/PostForm'
import { PostCard } from '@/components/PostCard'
import { Terminal } from '@/components/Terminal'
import { TimeDisplay } from '@/components/TimeDisplay'
import { ArchetypeBadge } from '@/components/ArchetypeBadge'
import { getArchetypeMeta } from '@/lib/archetypes'
import { TrendingUp, Clock, Search, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import type { Database } from '@/lib/database.types'
import type { ArchetypeId, Post } from '@/types'

type SearchResult = { type: 'profile'; data: { username: string; name: string; photo_url?: string; bio?: string; archetype?: ArchetypeId | null } }
type DevProfile = {
  id: string
  name: string | null
  username: string | null
  photoUrl: string | null
  archetype: ArchetypeId | null
}
type RawUser = {
  id: string
  name: string | null
  created_at: string
}
type RawUserInfo = {
  user_id: string
  username: string
  photo_url: string | null
  archetype: string | null
}

const normalizeArchetypeId = (value: string | null): ArchetypeId | null => {
  if (!value) return null
  return getArchetypeMeta(value as ArchetypeId) ? (value as ArchetypeId) : null
}

type RawPost = Database['public']['Tables']['posts']['Row']

export default function Home() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [devs, setDevs] = useState<DevProfile[]>([])
  const [devsLoading, setDevsLoading] = useState(true)
  const [authorArchetypes, setAuthorArchetypes] = useState<Record<string, ArchetypeId>>({})

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')

      // Apply search filter if search query exists
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        
        // Also search for profiles
        const { data: profiles } = await supabase
          .from('userinfo')
          .select('username, bio, photo_url, archetype')
          .or(`username.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
          .eq('is_public', true)
          .limit(5)
        
        if (profiles) {
          const profileResults = profiles.map((p: { username: string; bio: string | null; photo_url: string | null; archetype: string | null }) => {
            const archetypeId = normalizeArchetypeId(p.archetype)
            return {
              type: 'profile' as const,
              data: {
                username: p.username,
                name: p.username,
                photo_url: p.photo_url || undefined,
                bio: p.bio || undefined,
                archetype: archetypeId ?? undefined,
              },
            }
          })
          setSearchResults(profileResults)
        }
      } else {
        setSearchResults([])
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
        const rawPosts = (data ?? []) as RawPost[]

        // Sort by trending score (street_creds + comments + views) only if not searching
        const sortedPosts = searchQuery.trim()
          ? rawPosts
          : [...rawPosts].sort((a, b) => {
              const scoreA = (a.street_creds_count ?? 0) + (a.comments_count ?? 0) + (a.views_count ?? 0)
              const scoreB = (b.street_creds_count ?? 0) + (b.comments_count ?? 0) + (b.views_count ?? 0)
              return scoreB - scoreA
            })

        const sanitizedPosts: Post[] = sortedPosts.map((post) => ({
          id: post.id,
          name: post.name,
          title: post.title,
          content: post.content,
          image_url: post.image_url,
          created_at: post.created_at ?? new Date().toISOString(),
          updated_at: post.updated_at ?? post.created_at ?? new Date().toISOString(),
          street_creds_count: post.street_creds_count ?? 0,
          comments_count: post.comments_count ?? 0,
          views_count: post.views_count ?? 0,
        }))

        setPosts(sanitizedPosts)

        const authorHandles = Array.from(
          new Set(
            sanitizedPosts
              .map((post) => post.name?.trim())
              .filter((name): name is string => Boolean(name))
          )
        )

        if (authorHandles.length > 0 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          try {
            const { data: authorProfiles, error: authorProfilesError } = await supabase
              .from('userinfo')
              .select('username, archetype')
              .in('username', authorHandles)
              .eq('is_public', true)

            if (!authorProfilesError && authorProfiles) {
              const nextMap: Record<string, ArchetypeId> = {}
              ;(authorProfiles as { username: string; archetype: string | null }[]).forEach((profile) => {
                const archetypeId = normalizeArchetypeId(profile.archetype)
                if (profile.username && archetypeId) {
                  nextMap[profile.username] = archetypeId
                }
              })

              setAuthorArchetypes((prev) => {
                const updated = { ...prev }
                authorHandles.forEach((username) => {
                  if (nextMap[username]) {
                    updated[username] = nextMap[username]
                  } else {
                    delete updated[username]
                  }
                })
                return updated
              })
            } else if (authorProfilesError) {
              if (process.env.NODE_ENV !== 'production') {
                console.debug('Skipping archetype hydration (profiles query)', authorProfilesError)
              }
            }
          } catch (profileFetchErr) {
            if (process.env.NODE_ENV !== 'production') {
              console.debug('Skipping archetype hydration (exception)', profileFetchErr)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  const fetchDevs = useCallback(async () => {
    try {
      setDevsLoading(true)

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setDevs([])
        return
      }

      const { data: usersDataRaw, error: usersError } = await supabase
        .from('users')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(8)

      if (usersError) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Skipping dev roster hydration (users query)', usersError)
        }
        setDevs([])
        return
      }

      const usersData = (usersDataRaw ?? []) as RawUser[]

      if (usersData.length === 0) {
        setDevs([])
        return
      }

      const userIds = usersData.map((u) => u.id)

      const { data: profilesDataRaw, error: profilesError } = await supabase
        .from('userinfo')
        .select('user_id, username, photo_url, archetype')
        .in('user_id', userIds)
        .eq('is_public', true)

      if (profilesError) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Skipping dev roster hydration (profiles query)', profilesError)
        }
      }

      const profileMap = new Map<string, { username: string; photo_url: string | null; archetype: ArchetypeId | null }>()
      const profilesData = (profilesDataRaw ?? []) as RawUserInfo[]

      profilesData.forEach((profile) => {
        profileMap.set(profile.user_id, {
          username: profile.username,
          photo_url: profile.photo_url,
          archetype: normalizeArchetypeId(profile.archetype),
        })
      })

      const combinedDevs: DevProfile[] = usersData
        .filter((dev) => profileMap.has(dev.id))
        .map((dev) => {
          const profile = profileMap.get(dev.id)!
          return {
            id: dev.id,
            name: dev.name,
            username: profile.username ?? null,
            photoUrl: profile.photo_url ?? null,
            archetype: profile.archetype ?? null,
          }
        })

      setDevs(combinedDevs)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Skipping dev roster hydration (exception)', error)
      }
      setDevs([])
    } finally {
      setDevsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    fetchDevs()
    
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
  }, [fetchPosts, fetchDevs])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest('.profile-menu-container')) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileMenu])

  const handleNewPost = () => {
    fetchPosts()
  }

  return (
    <div className="h-screen overflow-hidden bg-black text-green-400 font-mono flex flex-col">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-[9998] border-b border-green-400/20 bg-black/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-4 md:hidden">
            {/* Top Row - Logo and Terminal Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Terminal className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                <Link href="/">
                  <h1 className="text-lg md:text-2xl font-bold glitch cursor-pointer">
                    sudonet.exe
                  </h1>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTerminalVisible(!terminalVisible)}
                  className="px-3 py-1.5 text-sm border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
                >
                  {terminalVisible ? 'HIDE' : 'INFO'}
                </button>
                
                {/* Profile Button - Mobile */}
                {user ? (
                  <div className="relative z-[10000] profile-menu-container">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-10 h-10 rounded-full border-2 border-green-400 bg-black flex items-center justify-center hover:bg-green-400 hover:text-black transition-colors relative z-[10000]"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 border border-green-400/30 z-[10001]"
                          style={{ backgroundColor: '#000000', position: 'absolute' }}
                        >
                          <div className="p-3 bg-black border-b border-green-400/20">
                            <p className="text-xs text-green-400/70">LOGGED_IN_AS:</p>
                            <p className="text-sm font-bold truncate">{user.name}</p>
                          </div>
                          <Link href={`/profile/${encodeURIComponent(user.name)}`}>
                            <button
                              onClick={() => setShowProfileMenu(false)}
                              className="w-full p-3 text-left flex items-center space-x-2 hover:bg-green-400/10 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              <span>VIEW_PROFILE</span>
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              logout()
                              setShowProfileMenu(false)
                            }}
                            className="w-full p-3 text-left flex items-center space-x-2 hover:bg-green-400/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>LOGOUT</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/auth/login">
                    <button className="w-10 h-10 rounded-full border-2 border-green-400 bg-black flex items-center justify-center hover:bg-green-400 hover:text-black transition-colors">
                      <User className="w-5 h-5" />
                    </button>
                  </Link>
                )}
              </div>
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
            
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Terminal className="w-8 h-8 text-green-400" />
              <Link href="/">
                <h1 className="text-2xl font-bold glitch cursor-pointer">
                  sudonet.exe
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
              
              <button
                onClick={() => setTerminalVisible(!terminalVisible)}
                className="px-4 py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              >
                {terminalVisible ? 'HIDE_INFO' : 'SHOW_INFO'}
              </button>
              
              {/* Profile Button - Desktop */}
              {user ? (
                <div className="relative z-[10000] profile-menu-container">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="w-10 h-10 rounded-full border-2 border-green-400 bg-black flex items-center justify-center hover:bg-green-400 hover:text-black transition-colors relative z-[10000]"
                    title={user.name}
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 border border-green-400/30 z-[10001]"
                        style={{ backgroundColor: '#000000', position: 'absolute' }}
                      >
                        <div className="p-4 bg-black border-b border-green-400/20">
                          <p className="text-xs text-green-400/70 mb-1">LOGGED_IN_AS:</p>
                          <p className="text-base font-bold truncate">{user.name}</p>
                          <p className="text-xs text-green-400/50 mt-1">User ID: {user.id.slice(0, 8)}...</p>
                        </div>
                        <Link href={`/profile/${encodeURIComponent(user.name)}`}>
                          <button
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full p-3 text-left flex items-center space-x-2 hover:bg-green-400/10 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>VIEW_PROFILE</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowProfileMenu(false)
                          }}
                          className="w-full p-3 text-left flex items-center space-x-2 hover:bg-green-400/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>LOGOUT</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/auth/login">
                  <button className="w-10 h-10 rounded-full border-2 border-green-400 bg-black flex items-center justify-center hover:bg-green-400 hover:text-black transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Indicator */}
      {searchQuery.trim() && (
        <div className="relative z-10 border-b border-green-400/20 bg-black/60 backdrop-blur-sm flex-shrink-0">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm sm:text-base">
                  Search results for: <span className="font-bold">&ldquo;{searchQuery}&rdquo;</span>
                </span>
                <span className="text-green-400/70 text-sm sm:text-base">
                  ({posts.length} posts, {searchResults.length} profiles)
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
            
            {/* Profile Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 pb-2">
                <h3 className="text-sm font-bold text-green-400 mb-2">PROFILES_FOUND:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {searchResults
                    .filter((result) => result.type === 'profile')
                    .map((result) => {
                      const profileData = result.data as { username: string; name: string; photo_url?: string; bio?: string; archetype?: ArchetypeId | null }
                      return (
                        <Link
                          key={profileData.username}
                          href={`/profile/${encodeURIComponent(profileData.username)}`}
                          className="border border-green-400/30 bg-black/50 p-3 hover:border-green-400 hover:bg-green-400/10 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 border border-green-400/50 bg-black/50 flex items-center justify-center flex-shrink-0">
                              {profileData.photo_url ? (
                                <Image
                                  src={profileData.photo_url}
                                  alt={profileData.username}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-green-400/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-bold truncate">@{profileData.username}</div>
                                {profileData.archetype && (
                                  <ArchetypeBadge archetype={profileData.archetype} className="scale-75" />
                                )}
                              </div>
                              {'bio' in profileData && profileData.bio && (
                                <div className="text-xs text-green-400/70 truncate">{profileData.bio}</div>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Layout - Responsive */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* CLI Metrics - Mobile: Full width, Desktop: 20% sidebar */}
        <div className="w-full lg:w-1/5 bg-black/20 border-b lg:border-b-0 lg:border-r border-transparent p-4 flex-shrink-0">
          <div className="lg:sticky ">
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
                  <span className="text-green-400/60">STREET_CREDS:</span>
                  <span className="text-yellow-400 font-bold">
                    {posts.reduce((sum, post) => sum + post.street_creds_count, 0)}
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

            <div className="mt-6 bg-black/80 backdrop-blur-sm p-4 font-mono text-sm border border-green-400/10">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-bold">ACTIVE_DEVS.exe</span>
              </div>

              <div className="space-y-3">
                {devsLoading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, idx) => (
                      <div key={`dev-skeleton-${idx}`} className="flex items-center space-x-3 border border-green-400/10 p-2 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-green-400/10" />
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-green-400/10 w-2/3" />
                          <div className="h-3 bg-green-400/10 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : devs.length === 0 ? (
                  <div className="border border-green-400/10 bg-black/60 p-3 text-xs text-green-400/60">
                    No devs online yet. Check back soon.
                  </div>
                ) : (
                  devs.map((dev) => (
                    <Link
                      key={dev.id}
                      href={`/profile/${encodeURIComponent(dev.username ?? dev.id)}`}
                      className="flex items-center space-x-3 border border-green-400/10 hover:border-green-400/40 hover:bg-green-400/5 transition-colors p-2"
                    >
                      <div className="w-10 h-10 rounded-full border border-green-400/40 bg-gradient-to-br from-green-500/20 to-green-400/10 flex items-center justify-center overflow-hidden">
                        {dev.photoUrl ? (
                          <Image
                            src={dev.photoUrl}
                            alt={dev.username ?? dev.name ?? 'dev avatar'}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-green-300 font-bold">
                            {(dev.name || dev.username || 'DEV')
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-green-100 truncate">{dev.name || dev.username || 'Unknown Dev'}</p>
                          {dev.archetype && (
                            <ArchetypeBadge archetype={dev.archetype} className="scale-75" />
                          )}
                        </div>
                        <p className="text-xs text-green-400/70 truncate">@{dev.username ?? dev.id.slice(0, 8)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 80% */}
        <main className="flex-1 relative z-10 px-4 py-6 flex flex-col overflow-hidden">
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
          <div className="flex flex-col xl:flex-row gap-4 flex-1 overflow-hidden min-h-0">
            {/* Left Side - Trending Posts */}
            <div className="w-full xl:w-1/2 flex flex-col min-h-0">
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-green-400 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>TRENDING_POSTS.exe</span>
                </h2>
                <p className="text-sm text-green-400/70">All-time trending content</p>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2 pb-24">
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
                      const scoreA = a.street_creds_count + a.comments_count + a.views_count
                      const scoreB = b.street_creds_count + b.comments_count + b.views_count
                      return scoreB - scoreA
                    })
                    .slice(0, 10)
                    .map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        archetype={post.name ? authorArchetypes[post.name] : undefined}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Right Side - Recent Posts */}
            <div className="w-full xl:w-1/2 flex flex-col min-h-0">
              <div className="mb-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-green-400 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>RECENT_POSTS.exe</span>
                </h2>
                <p className="text-sm text-green-400/70">Latest community activity</p>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2 pb-24">
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
                      <PostCard
                        key={`recent-${post.id}`}
                        post={post}
                        archetype={post.name ? authorArchetypes[post.name] : undefined}
                      />
                    ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      {/* <footer className="relative z-10 border-t border-green-400/20 bg-black/80 backdrop-blur-sm mt-16 mb-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-green-400/70">
            <p>Built with Next.js + Supabase | Anonymous Tech Discussions</p>
            <p>No cookies, no tracking, just pure developer chaos</p>
          </div>
        </div>
      </footer> */}

      {/* Post Form - Fixed at bottom with highest z-index */}
      <PostForm onPostCreated={handleNewPost} />
    </div>
  )
}

