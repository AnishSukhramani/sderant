'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Terminal, User, Mail, Phone, MapPin, Github, Linkedin, 
  Twitter, Instagram, Facebook, FileText, AlertCircle, ArrowLeft, Edit,
  Activity as ActivityIcon, Sparkles, Radar, Gauge, GraduationCap, Briefcase, Cpu
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserInfo, Post } from '@/types'
import { ArchetypeBadge } from '@/components/ArchetypeBadge'
import { getArchetypeMeta } from '@/lib/archetypes'
import type { Database } from '@/lib/database.types'

type RawPost = Database['public']['Tables']['posts']['Row']

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  // Decode URL-encoded username (handles spaces and special characters)
  const username = decodeURIComponent(params.username as string)
  
  const [profile, setProfile] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activity, setActivity] = useState<Post[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // First, try to find by username
      let { data, error: fetchError } = await supabase
        .from('userinfo')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      // Log detailed error for debugging - stringify to see actual contents
      if (fetchError && fetchError.code !== 'PGRST116') {
        try {
          const errorStr = JSON.stringify(fetchError, null, 2)
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Profile fetch error (stringified):', errorStr)
            console.debug('Profile fetch error (raw):', fetchError)
          }
        } catch (e) {
          if (process.env.NODE_ENV !== 'production') {
            console.debug('Could not stringify profile fetch error:', e)
            console.debug('Raw error object:', fetchError)
          }
        }
      }

      const shouldFallbackLookup = (!data || (fetchError && fetchError.code !== 'PGRST116')) && user

      // If not found by username, try to find by user_id if it's the current user
      if (shouldFallbackLookup) {
        // Try to find user by name in users table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData } = await (supabase as any)
          .from('users')
          .select('id, name')
          .eq('name', username)
          .single()

        if (userData && userData.id === user.id) {
          // Try to find profile by user_id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: profileData, error: profileError } = await (supabase as any)
            .from('userinfo')
            .select('*')
            .eq('user_id', userData.id)
            .single()

          if (!profileError && profileData) {
            data = profileData
            fetchError = null
          } else if (profileError) {
            // Profile doesn't exist, try to create it
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { data: newProfile, error: createError } = await (supabase as any)
                .from('userinfo')
                .insert([{
                  user_id: userData.id,
                  username: username,
                  is_public: true
                }])
                .select()
                .single()

              if (!createError && newProfile) {
                data = newProfile
                fetchError = null
              } else {
                console.error('Error creating profile:', createError)
              }
            } catch (createErr) {
              console.error('Exception creating profile:', createErr)
            }
          }
        }
      }

      if (fetchError || !data) {
        // If it's the current user trying to view their own profile that doesn't exist, redirect to edit
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: userData } = await (supabase as any)
            .from('users')
            .select('id, name')
            .eq('name', username)
            .single()

          if (userData && userData.id === user.id) {
            // Redirect to edit page to create profile
            router.push(`/profile/${encodeURIComponent(username)}/edit`)
            return
          }
        }
        
        // Better error message - try to extract meaningful error info
        let errorMsg = 'Profile not found'
        if (fetchError) {
          try {
            errorMsg = fetchError.message || fetchError.code || JSON.stringify(fetchError) || 'Unknown error'
          } catch {
            errorMsg = String(fetchError) || 'Unknown error'
          }
        }

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile - Final:', {
            username,
            error: fetchError,
            errorString: JSON.stringify(fetchError),
            errorMsg,
            hasData: !!data,
            errorType: typeof fetchError
          })
        } else if (process.env.NODE_ENV !== 'production') {
          console.debug('Profile not found (non-critical):', {
            username,
            error: fetchError?.code,
            hasData: !!data,
          })
        }
        
        // Check for common error types
        const errorStr = errorMsg.toLowerCase()
        let userMessage = `Profile not found for "${username}".`
        
        if (errorStr.includes('relation') || errorStr.includes('does not exist')) {
          userMessage += ' The userinfo table may not exist yet. Please run the userinfo-schema.sql migration in Supabase.'
        } else if (errorStr.includes('permission') || errorStr.includes('policy')) {
          userMessage += ' Access denied. Check Row Level Security policies in Supabase.'
        } else if (errorStr.includes('PGRST116')) {
          userMessage += ' No profile found. The user may not have created a profile yet.'
        } else {
          userMessage += ' The user may not have created a profile yet.'
        }
        
        setError(userMessage)
        return
      }

      const profileData = data as UserInfo | null
      setProfile(profileData as UserInfo)
      
      // Check if this is the current user's profile
      if (user && profileData && profileData.user_id === user.id) {
        setIsOwnProfile(true)
      }
    } catch (err) {
      console.error('Exception in fetchProfile:', err)
      setError('An error occurred loading the profile. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }, [username, user, router])

  const fetchActivity = useCallback(async () => {
    if (!username) {
      setActivity([])
      setActivityLoading(false)
      setActivityError(null)
      return
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setActivity([])
      setActivityLoading(false)
      setActivityError('Supabase environment is not configured.')
      return
    }

    try {
      setActivityLoading(true)
      setActivityError(null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: postsError } = await (supabase as any)
        .from('posts')
        .select('*')
        .eq('name', username)
        .order('created_at', { ascending: false })
        .limit(20)

      if (postsError) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('Activity fetch error:', postsError)
        }
        setActivity([])
        setActivityError('Unable to retrieve activity feed.')
        return
      }

      const rawPosts = (data ?? []) as RawPost[]
      const sanitizedPosts: Post[] = rawPosts.map((post) => ({
        id: post.id,
        name: post.name,
        title: post.title,
        content: post.content ?? '',
        image_url: post.image_url ?? null,
        created_at: post.created_at ?? new Date().toISOString(),
        updated_at: post.updated_at ?? post.created_at ?? new Date().toISOString(),
        street_creds_count: post.street_creds_count ?? 0,
        comments_count: post.comments_count ?? 0,
        views_count: post.views_count ?? 0,
      }))

      setActivity(sanitizedPosts)
    } catch (err) {
      console.error('Exception fetching activity:', err)
      setActivity([])
      setActivityError('Activity feed is offline. Please try again.')
    } finally {
      setActivityLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  // Refetch profile when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    let isInitialMount = true
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialMount) {
        // Small delay to ensure database has updated
        setTimeout(() => {
          router.refresh()
          fetchProfile()
          fetchActivity()
        }, 100)
      }
      isInitialMount = false
    }

    const handleFocus = () => {
      if (!isInitialMount) {
        setTimeout(() => {
          router.refresh()
          fetchProfile()
          fetchActivity()
        }, 100)
      }
    }

    // Set initial mount flag after a brief delay
    setTimeout(() => {
      isInitialMount = false
    }, 1000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchProfile, fetchActivity, router])

  const archetypeMeta = useMemo(
    () => (profile?.archetype ? getArchetypeMeta(profile.archetype) : null),
    [profile?.archetype]
  )
  const activityStats = useMemo(() => {
    if (!activity.length) {
      return {
        totalMissions: 0,
        lastActive: null as string | null,
        signalStrength: 0,
        resonance: 0,
        totalCreds: 0,
      }
    }

    const lastActive = activity[0]?.created_at ?? activity[0]?.updated_at ?? null
    const totalCreds = activity.reduce((sum, post) => sum + (post.street_creds_count ?? 0), 0)
    const totalComments = activity.reduce((sum, post) => sum + (post.comments_count ?? 0), 0)
    const totalViews = activity.reduce((sum, post) => sum + (post.views_count ?? 0), 0)

    const signalStrength = Math.min(
      100,
      Math.round(
        totalCreds * 1.5 +
          activity.length * 6 +
          Math.min(30, totalComments * 2) +
          Math.min(24, totalViews * 0.05)
      )
    )

    const resonance = Math.min(
      100,
      Math.round((totalComments * 4 + totalCreds * 2) / Math.max(1, activity.length))
    )

    return {
      totalMissions: activity.length,
      lastActive,
      signalStrength,
      resonance,
      totalCreds,
    }
  }, [activity])
  const techItems = useMemo(() => {
    if (!profile?.tech) return []
    return profile.tech
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }, [profile?.tech])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
          <p className="text-lg">LOADING_PROFILE...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-red-400/50 bg-red-900/20 p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2 text-red-400">PROFILE_NOT_FOUND</h1>
          <p className="text-red-300/80 mb-6">{error || 'The requested profile does not exist.'}</p>
          <Link href="/app">
            <button className="px-6 py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors">
              RETURN_TO_TERMINAL
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none opacity-10" />
      
      {/* Scan lines */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.02) 2px, rgba(0, 255, 65, 0.02) 4px)',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '0px 100px'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-green-400/20 bg-black/90 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/app" className="flex items-center space-x-2 hover:text-green-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">BACK_TO_TERMINAL</span>
          </Link>
          {isOwnProfile && (
            <Link href={`/profile/${encodeURIComponent(username)}/edit`}>
              <button className="px-4 py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>EDIT_PROFILE</span>
              </button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - CIA/FBI Document Style */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-green-400 bg-black/95 backdrop-blur-sm w-full"
        >
          {/* Document Header */}
          <div className="border-b-2 border-green-400 p-6 bg-green-400/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-green-400/70 mb-1">CLASSIFIED DOCUMENT</div>
                <h1 className="text-3xl font-bold glitch mb-2">OPERATIVE_PROFILE</h1>
                <div className="text-sm text-green-400/70">
                  CLEARANCE: <span className="text-green-400">TOP_SECRET</span>
                </div>
              </div>
              <div className="text-right text-xs text-green-400/70">
                <div>DOC_ID: {profile.id.slice(0, 8).toUpperCase()}</div>
                <div>CREATED: {new Date(profile.created_at).toLocaleDateString()}</div>
                <div>STATUS: <span className="text-green-400">ACTIVE</span></div>
              </div>
            </div>
            {archetypeMeta && (
              <div className="mt-4 max-w-md">
                <ArchetypeBadge archetype={profile.archetype} variant="profile" />
              </div>
            )}
          </div>

          {/* Document Body */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-10">
              <motion.section
                className="flex-1 space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <motion.div
                    className="order-2 lg:order-1 space-y-6"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    {/* Personal Information */}
                    <section className="relative overflow-hidden border border-green-400/20 bg-black/70">
                      <div className="absolute inset-0 opacity-40">
                        <motion.div
                          className="absolute inset-0 bg-[linear-gradient(115deg,rgba(0,255,65,0.05)_0%,rgba(0,255,65,0)_55%,rgba(0,255,65,0.12)_100%)]"
                          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-screen" />
                      </div>
                      <div className="relative z-10 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <User className="w-5 h-5" />
                          <h2 className="text-xl font-bold tracking-tight">PERSONAL_INFORMATION</h2>
                        </div>
                        
                        <div className="space-y-3">
                          <InfoField label="NAME" value={profile.username} />
                          <InfoField label="USERNAME" value={`@${profile.username}`} />
                          {archetypeMeta && (
                            <div className="grid grid-cols-3 gap-4 items-center">
                              <div className="text-green-400/70 text-sm">ARCHETYPE:</div>
                              <div className="col-span-2 flex items-center gap-2">
                                <ArchetypeBadge archetype={profile.archetype} variant="label" />
                                <span className="text-[0.65rem] uppercase tracking-wide text-green-400/50">
                                  {archetypeMeta.description}
                                </span>
                              </div>
                            </div>
                          )}
                          {profile.gender && (
                            <InfoField label="GENDER" value={profile.gender.toUpperCase().replace(/_/g, ' ')} />
                          )}
                          {profile.email && (
                            <div className="flex items-start space-x-2">
                              <Mail className="w-4 h-4 mt-1 text-green-400/70" />
                              <InfoField label="EMAIL" value={profile.email} />
                            </div>
                          )}
                          {profile.phone && (
                            <div className="flex items-start space-x-2">
                              <Phone className="w-4 h-4 mt-1 text-green-400/70" />
                              <InfoField label="PHONE" value={profile.phone} />
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Bio */}
                    {profile.bio && (
                      <section className="border border-green-400/20 bg-black/70 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <motion.div
                            className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,65,0.25),transparent_60%)]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                          />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                            <FileText className="w-5 h-5" />
                            <h2 className="text-xl font-bold">BIO</h2>
                          </div>
                          <p className="text-green-400/90 leading-relaxed">{profile.bio}</p>
                        </div>
                      </section>
                    )}

                    {/* About */}
                    {profile.about && (
                      <section className="border border-green-400/20 bg-black/70 p-6 relative">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/5 to-transparent"
                          animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                            <Terminal className="w-5 h-5" />
                            <h2 className="text-xl font-bold">ABOUT</h2>
                          </div>
                          <div className="text-green-400/90 leading-relaxed whitespace-pre-wrap">{profile.about}</div>
                        </div>
                      </section>
                    )}

                    {profile.education && (
                      <section className="border border-green-400/20 bg-black/70 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <GraduationCap className="w-5 h-5" />
                          <h2 className="text-xl font-bold">EDUCATION</h2>
                        </div>
                        <div className="text-green-400/90 leading-relaxed whitespace-pre-wrap">
                          {profile.education}
                        </div>
                      </section>
                    )}

                    {profile.experience && (
                      <section className="border border-green-400/20 bg-black/70 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <Briefcase className="w-5 h-5" />
                          <h2 className="text-xl font-bold">EXPERIENCE</h2>
                        </div>
                        <div className="text-green-400/90 leading-relaxed whitespace-pre-wrap">
                          {profile.experience}
                        </div>
                      </section>
                    )}

                    {techItems.length > 0 && (
                      <section className="border border-green-400/20 bg-black/70 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <Cpu className="w-5 h-5" />
                          <h2 className="text-xl font-bold">TECH</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {techItems.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 text-xs uppercase tracking-[0.3em] border border-green-400/30 bg-black/60 text-green-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Address */}
                    {(profile.address_line1 || profile.city || profile.country) && (
                      <section className="border border-green-400/20 bg-black/70 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <MapPin className="w-5 h-5" />
                          <h2 className="text-xl font-bold">LOCATION</h2>
                        </div>
                        <div className="space-y-1 text-green-400/90">
                          {profile.address_line1 && <div>{profile.address_line1}</div>}
                          {profile.address_line2 && <div>{profile.address_line2}</div>}
                          <div>
                            {[profile.city, profile.state, profile.postal_code].filter(Boolean).join(', ')}
                          </div>
                          {profile.country && <div>{profile.country}</div>}
                        </div>
                      </section>
                    )}

                    {/* Social Links */}
                    {(profile.github_url || profile.linkedin_url || profile.twitter_url || profile.instagram_url || profile.facebook_url) && (
                      <section className="border border-green-400/20 bg-black/70 p-6">
                        <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                          <Terminal className="w-5 h-5" />
                          <h2 className="text-xl font-bold">SOCIAL_NETWORKS</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {profile.github_url && (
                            <SocialLink icon={Github} label="GITHUB" url={profile.github_url} />
                          )}
                          {profile.linkedin_url && (
                            <SocialLink icon={Linkedin} label="LINKEDIN" url={profile.linkedin_url} />
                          )}
                          {profile.twitter_url && (
                            <SocialLink icon={Twitter} label="X (TWITTER)" url={profile.twitter_url} />
                          )}
                          {profile.instagram_url && (
                            <SocialLink icon={Instagram} label="INSTAGRAM" url={profile.instagram_url} />
                          )}
                          {profile.facebook_url && (
                            <SocialLink icon={Facebook} label="FACEBOOK" url={profile.facebook_url} />
                          )}
                        </div>
                      </section>
                    )}
                  </motion.div>

                  {/* Operative photo & dossier */}
                  <motion.div
                    className="order-1 lg:order-2"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.45 }}
                  >
                    <div className="border-2 border-green-400/50 bg-black/80 p-4 sticky top-8">
                      <div className="relative">
                        <motion.div
                          className="absolute -inset-2 bg-gradient-to-br from-green-400/20 via-transparent to-green-400/10 blur-lg"
                          animate={{ opacity: [0.25, 0.6, 0.25] }}
                          transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                        />
                        <div className="relative z-10">
                          <div className="text-xs text-green-400/70 mb-2 text-center tracking-[0.3em]">
                            OPERATIVE_PHOTO
                          </div>
                          <div className="aspect-[3/4] bg-black/50 border border-green-400/30 mb-3 relative overflow-hidden">
                            <motion.div
                              className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,255,65,0.15)_50%,transparent_100%)] mix-blend-screen"
                              animate={{ backgroundPosition: ['0% 0%', '0% 200%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            {profile.photo_url ? (
                              <Image
                                src={profile.photo_url}
                                alt={profile.username}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 60vw, 320px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <User className="w-24 h-24 text-green-400/30" />
                              </div>
                            )}
                            <motion.div
                              className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.6 }}
                            />
                            <div className="absolute inset-3 border border-green-400/20 pointer-events-none" />
                          </div>
                          <div className="space-y-3">
                            <div className="h-12 bg-black border border-green-400/30 flex items-center justify-center text-xs overflow-hidden">
                              <motion.div
                                className="flex space-x-px"
                                animate={{ x: ['0%', '-25%'] }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                              >
                                {Array.from({ length: 60 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-1 bg-green-400"
                                    style={{ height: `${Math.random() * 80 + 20}%` }}
                                  />
                                ))}
                              </motion.div>
                            </div>
                            <div className="text-xs text-center text-green-400/70 tracking-[0.25em]">
                              ID: {profile.id.slice(0, 16).toUpperCase()}
                            </div>
                            <div className="border border-red-400/50 bg-red-900/20 p-3 text-center relative overflow-hidden">
                              <motion.div
                                className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(248,113,113,0.15),transparent)]"
                                animate={{ backgroundPosition: ['0% 0%', '150% 150%'] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                              />
                              <div className="relative z-10">
                                <div className="text-red-400 font-bold text-lg mb-1 tracking-[0.4em]">CLASSIFIED</div>
                                <div className="text-xs text-red-400/70">AUTHORIZED PERSONNEL ONLY</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.section>

              {/* Activity Feed */}
              <motion.aside
                className="lg:w-[38%] space-y-6"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
              >
                <div className="relative border border-green-400/25 bg-black/70 overflow-hidden">
                  <motion.div
                    className="absolute -inset-24 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,255,65,0.15),transparent,rgba(0,255,65,0.08),transparent)] blur-3xl opacity-50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <ActivityIcon className="w-5 h-5 text-green-300" />
                          <h2 className="text-xl font-bold">OPERATIVE_ACTIVITY</h2>
                        </div>
                        <p className="text-xs text-green-400/70 tracking-[0.2em] mt-1 uppercase">
                          Signal trace for @{profile.username}
                        </p>
                      </div>
                      <motion.div
                        className="w-14 h-14 rounded-full border border-green-400/40 flex items-center justify-center bg-black/60"
                        animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.35)', '0 0 40px rgba(34,197,94,0.15)'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                        >
                          <Radar className="w-6 h-6 text-green-300" />
                        </motion.div>
                      </motion.div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 text-xs border border-green-400/20 bg-black/40 p-3">
                      <StatBadge icon={Sparkles} label="MISSIONS" value={activityStats.totalMissions.toString().padStart(2, '0')} />
                      <StatBadge icon={Gauge} label="SIGNAL" value={`${activityStats.signalStrength}%`} />
                      <StatBadge icon={Terminal} label="CREDS" value={activityStats.totalCreds.toString().padStart(2, '0')} />
                    </div>

                    <motion.div
                      className="mt-6 h-2 rounded-full bg-green-400/10 overflow-hidden"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-300"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.max(5, activityStats.resonance)}%` }}
                        transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                      />
                    </motion.div>
                    <div className="mt-2 text-[0.7rem] text-green-400/60 uppercase tracking-[0.3em]">
                      Resonance Index {activityStats.resonance}%
                    </div>
                  </div>
                </div>

                <div className="relative border border-green-400/20 bg-black/80 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 opacity-30 bg-[linear-gradient(135deg,rgba(0,255,65,0.12),transparent_55%,rgba(0,255,65,0.08)_80%)]"
                    animate={{ backgroundPosition: ['0% 0%', '120% 120%'] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="relative z-10 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm tracking-[0.2em] text-green-400/60 uppercase">
                        Mission Log
                      </span>
                      <div className="text-xs text-green-400/70">
                        {activityStats.lastActive
                          ? `Last ping: ${new Date(activityStats.lastActive).toLocaleString()}`
                          : 'Awaiting first transmission'}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-green-400/60 via-green-400/10 to-transparent" />
                      <div className="pl-8 space-y-4 max-h-[420px] overflow-y-auto pr-2">
                        {activityLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <motion.div
                                key={`activity-skeleton-${idx}`}
                                className="border border-green-400/10 bg-black/60 p-4 animate-pulse"
                              >
                                <div className="h-3 bg-green-400/10 w-1/4 mb-2" />
                                <div className="h-4 bg-green-400/15 w-3/4 mb-1" />
                                <div className="h-3 bg-green-400/10 w-2/3" />
                              </motion.div>
                            ))}
                          </div>
                        ) : activityError ? (
                          <div className="border border-red-400/50 bg-red-900/30 p-4 text-xs text-red-200">
                            {activityError}
                          </div>
                        ) : activity.length === 0 ? (
                          <div className="border border-green-400/20 bg-black/50 p-6 text-center text-sm text-green-400/70">
                            No logged missions using @{profile.username} yet. Deploy via `uname` in the terminal to broadcast.
                          </div>
                        ) : (
                          activity.map((post, index) => (
                            <motion.div
                              key={post.id}
                              className="relative border border-green-400/20 bg-black/70 p-4 group overflow-hidden"
                              initial={{ opacity: 0, y: 16 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true, amount: 0.2 }}
                              transition={{ delay: index * 0.05, duration: 0.35 }}
                            >
                              <div className="absolute left-[-1.45rem] top-4 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.9)]" />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,rgba(0,255,65,0.18),transparent_65%)]" />
                              <div className="relative z-10 space-y-2">
                                <div className="flex items-center justify-between text-[0.7rem] text-green-400/60 uppercase tracking-[0.3em]">
                                  <span>#{String(index + 1).padStart(2, '0')}</span>
                                  <span>{new Date(post.created_at).toLocaleString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-green-100 leading-tight">
                                  {post.title}
                                </h3>
                                {post.content && (
                                  <p className="text-sm text-green-400/80 leading-relaxed line-clamp-3">
                                    {post.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-green-400/60 uppercase tracking-[0.25em] pt-2 border-t border-green-400/10">
                                  <span>Creds: {post.street_creds_count}</span>
                                  <span>Comms: {post.comments_count}</span>
                                  <span>Signals: {post.views_count}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>

          {/* Document Footer */}
          <div className="border-t-2 border-green-400 p-4 bg-green-400/5 text-xs text-green-400/70 text-center">
            <div>DOCUMENT CLASSIFICATION: TOP SECRET // NOFORN</div>
            <div>LAST UPDATED: {new Date(profile.updated_at).toLocaleString()}</div>
            <div className="mt-2">⚠ WARNING: UNAUTHORIZED ACCESS IS PROHIBITED ⚠</div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

// Helper Components
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-green-400/70 text-sm">{label}:</div>
      <div className="col-span-2 text-green-400 font-mono">{value}</div>
    </div>
  )
}

function SocialLink({ icon: Icon, label, url }: { icon: React.ComponentType<{ className?: string }>; label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 p-3 border border-green-400/30 hover:border-green-400 hover:bg-green-400/10 transition-colors group"
    >
      <Icon className="w-5 h-5 text-green-400/70 group-hover:text-green-400" />
      <span className="text-sm font-mono">{label}</span>
    </a>
  )
}

function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <motion.div
      className="relative overflow-hidden border border-green-400/20 bg-black/60 p-3 flex flex-col gap-1 group"
      whileHover={{ y: -3, boxShadow: '0 0 20px rgba(34,197,94,0.25)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.18),transparent_70%)]"
          animate={{ scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>
      <div className="flex items-center gap-2 text-green-400/70 uppercase tracking-[0.25em] text-[0.65rem]">
        <Icon className="w-3.5 h-3.5 text-green-300" />
        {label}
      </div>
      <div className="text-2xl font-bold text-green-100">{value}</div>
    </motion.div>
  )
}

