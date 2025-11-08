'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Terminal, User, Mail, Phone, MapPin, Github, Linkedin, 
  Twitter, Instagram, Facebook, FileText, AlertCircle, ArrowLeft, Edit
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserInfo } from '@/types'
import { ArchetypeBadge } from '@/components/ArchetypeBadge'
import { getArchetypeMeta } from '@/lib/archetypes'

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

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Refetch profile when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    let isInitialMount = true
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialMount) {
        // Small delay to ensure database has updated
        setTimeout(() => {
          router.refresh()
          fetchProfile()
        }, 100)
      }
      isInitialMount = false
    }

    const handleFocus = () => {
      if (!isInitialMount) {
        setTimeout(() => {
          router.refresh()
          fetchProfile()
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
  }, [fetchProfile, router])

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

  const archetypeMeta = profile.archetype ? getArchetypeMeta(profile.archetype) : null

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
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
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
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-green-400 bg-black/95 backdrop-blur-sm"
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
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Info */}
              <div className="md:col-span-2 space-y-6">
                {/* Personal Information */}
                <section>
                  <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                    <User className="w-5 h-5" />
                    <h2 className="text-xl font-bold">PERSONAL_INFORMATION</h2>
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
                </section>

                {/* Bio */}
                {profile.bio && (
                  <section>
                    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                      <FileText className="w-5 h-5" />
                      <h2 className="text-xl font-bold">BIO</h2>
                    </div>
                    <p className="text-green-400/90 leading-relaxed">{profile.bio}</p>
                  </section>
                )}

                {/* About */}
                {profile.about && (
                  <section>
                    <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-green-400/30">
                      <Terminal className="w-5 h-5" />
                      <h2 className="text-xl font-bold">ABOUT</h2>
                    </div>
                    <div className="text-green-400/90 leading-relaxed whitespace-pre-wrap">{profile.about}</div>
                  </section>
                )}

                {/* Address */}
                {(profile.address_line1 || profile.city || profile.country) && (
                  <section>
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
                  <section>
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
              </div>

              {/* Right Column - Photo */}
              <div className="md:col-span-1">
                <div className="border-2 border-green-400/50 bg-black/80 p-4 sticky top-8">
                  <div className="text-xs text-green-400/70 mb-2 text-center">OPERATIVE_PHOTO</div>
                  <div className="aspect-[3/4] bg-black/50 border border-green-400/30 mb-3 relative overflow-hidden">
                    {profile.photo_url ? (
                      <Image
                        src={profile.photo_url}
                        alt={profile.username}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <User className="w-24 h-24 text-green-400/30" />
                      </div>
                    )}
                  </div>
                  
                  {/* Barcode */}
                  <div className="mb-3">
                    <div className="h-12 bg-black border border-green-400/30 flex items-center justify-center text-xs">
                      <div className="flex space-x-px">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-green-400"
                            style={{ height: `${Math.random() * 80 + 20}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-center mt-1 text-green-400/70">
                      ID: {profile.id.slice(0, 16).toUpperCase()}
                    </div>
                  </div>

                  {/* Classification Stamp */}
                  <div className="border border-red-400/50 bg-red-900/20 p-3 text-center">
                    <div className="text-red-400 font-bold text-lg mb-1">CLASSIFIED</div>
                    <div className="text-xs text-red-400/70">AUTHORIZED PERSONNEL ONLY</div>
                  </div>
                </div>
              </div>
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

