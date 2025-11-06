'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Terminal, User, Mail, Phone, MapPin, Github, Linkedin, 
  Twitter, Instagram, Facebook, Upload, X, Loader2, AlertCircle, ArrowLeft, Save
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { UserInfo } from '@/types'
import type { Database } from '@/lib/supabase'

type UserInfoRow = Database['public']['Tables']['userinfo']['Row']
type UserInfoInsert = Database['public']['Tables']['userinfo']['Insert']
type UserInfoUpdate = Database['public']['Tables']['userinfo']['Update']

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  // Decode URL-encoded username (handles spaces and special characters)
  const username = decodeURIComponent(params.username as string)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState<Partial<UserInfo>>({
    username: '',
    gender: null,
    email: '',
    phone: '',
    bio: '',
    about: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    facebook_url: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('userinfo')
        .select('*')
        .eq('username', username)
        .single()

      if (fetchError) {
        console.error('Error fetching profile:', fetchError)
        
        // If profile doesn't exist, create it
        if (user) {
          const insertData: UserInfoInsert = {
            user_id: user.id,
            username: username,
            is_public: true
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: newProfile, error: createError } = await (supabase as any)
            .from('userinfo')
            .insert([insertData])
            .select()
            .single()

          if (createError) {
            setError('Failed to create profile')
            return
          }
          setProfile(newProfile as Partial<UserInfo>)
        }
        return
      }

      // Check if this is the current user's profile
      const userInfoData = data as UserInfoRow | null
      if (user && userInfoData && userInfoData.user_id !== user.id) {
        setError('You can only edit your own profile')
        setTimeout(() => router.push(`/profile/${username}`), 2000)
        return
      }

      setProfile(userInfoData as Partial<UserInfo>)
      if (userInfoData && userInfoData.photo_url) {
        setPhotoPreview(userInfoData.photo_url)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred loading the profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB')
        return
      }
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photo || !user) return null

    try {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let photoUrl = profile.photo_url

      // Upload photo if there's a new one
      if (photo) {
        const uploadedUrl = await uploadPhoto()
        if (uploadedUrl) {
          photoUrl = uploadedUrl
        } else {
          setError('Failed to upload photo, but profile will be saved')
        }
      }

      // First, check if profile already exists for this user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingProfile, error: checkError } = await (supabase as any)
        .from('userinfo')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Prepare profile data - convert empty strings to null for optional fields
      const profileData: UserInfoUpdate = {
        user_id: user.id,
        username: username,
        photo_url: photoUrl || null,
        gender: profile.gender || null,
        email: profile.email?.trim() || null,
        phone: profile.phone?.trim() || null,
        bio: profile.bio?.trim() || null,
        about: profile.about?.trim() || null,
        github_url: profile.github_url?.trim() || null,
        linkedin_url: profile.linkedin_url?.trim() || null,
        twitter_url: profile.twitter_url?.trim() || null,
        instagram_url: profile.instagram_url?.trim() || null,
        facebook_url: profile.facebook_url?.trim() || null,
        address_line1: profile.address_line1?.trim() || null,
        address_line2: profile.address_line2?.trim() || null,
        city: profile.city?.trim() || null,
        state: profile.state?.trim() || null,
        country: profile.country?.trim() || null,
        postal_code: profile.postal_code?.trim() || null,
        is_public: profile.is_public !== undefined ? profile.is_public : true,
      }

      let upsertData, upsertError

      // Try using the database function first (bypasses RLS)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: functionResult, error: functionError } = await (supabase as any).rpc('update_userinfo_profile', {
            p_user_id: user.id,
            p_username: username,
            p_photo_url: profileData.photo_url,
            p_gender: profileData.gender,
            p_email: profileData.email,
            p_phone: profileData.phone,
            p_bio: profileData.bio,
            p_about: profileData.about,
            p_github_url: profileData.github_url,
            p_linkedin_url: profileData.linkedin_url,
            p_twitter_url: profileData.twitter_url,
            p_instagram_url: profileData.instagram_url,
            p_facebook_url: profileData.facebook_url,
            p_address_line1: profileData.address_line1,
            p_address_line2: profileData.address_line2,
            p_city: profileData.city,
            p_state: profileData.state,
            p_country: profileData.country,
            p_postal_code: profileData.postal_code,
            p_is_public: profileData.is_public,
          })

        if (!functionError && functionResult) {
          upsertData = Array.isArray(functionResult) ? functionResult[0] : functionResult
          upsertError = null
          console.log('✅ Profile saved successfully via database function')
        } else {
          // Function doesn't exist or failed, fall back to direct update
          console.warn('Function update failed, trying direct update:', functionError)
          throw functionError
        }
      } catch {
        // Fallback to direct update/insert
        console.log('Using fallback update method')
        
        if (existingProfile && !checkError) {
          // Don't include id in update payload - we filter by id in the .eq() clause
          const updateData: UserInfoUpdate = { ...profileData }
          delete updateData.id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (supabase as any)
            .from('userinfo')
            .update(updateData)
            .eq('id', existingProfile.id)
            .select()
          upsertData = result.data
          upsertError = result.error
        } else {
          // Profile doesn't exist, insert new one
          const insertData: UserInfoInsert = profileData as UserInfoInsert
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (supabase as any)
            .from('userinfo')
            .insert([insertData])
            .select()
          upsertData = result.data
          upsertError = result.error
        }
      }

      // Log detailed error for debugging
      if (upsertError) {
        try {
          const errorStr = JSON.stringify(upsertError, null, 2)
          console.error('=== PROFILE SAVE ERROR ===')
          console.error('Error (stringified):', errorStr)
          console.error('Error (raw):', upsertError)
          console.error('Error message:', upsertError?.message)
          console.error('Error code:', upsertError?.code)
          console.error('Error details:', upsertError?.details)
          console.error('Error hint:', upsertError?.hint)
          console.error('Profile data being saved:', JSON.stringify(profileData, null, 2))
          console.error('User ID:', user.id)
          console.error('Username:', username)
          console.error('Existing profile ID:', existingProfile?.id)
          console.error('=========================')
        } catch (e) {
          console.error('Could not stringify error:', e)
          console.error('Raw error object:', upsertError)
        }
        
        // Better error message
        let errorMsg = 'Failed to save profile'
        try {
          const msg = upsertError?.message || upsertError?.code || JSON.stringify(upsertError) || 'Unknown error'
          errorMsg = msg
          
          if (msg.toLowerCase().includes('relation') || msg.toLowerCase().includes('does not exist')) {
            errorMsg = 'The userinfo table does not exist. Please run the userinfo-schema.sql migration in Supabase.'
          } else if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('policy') || msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('new row violates')) {
            errorMsg = 'Access denied by Row Level Security. Run fix-userinfo-rls.sql or fix-userinfo-rls-simple.sql in Supabase SQL Editor to fix this.'
          } else if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('duplicate')) {
            errorMsg = 'A profile with this username already exists.'
          } else if (msg.toLowerCase().includes('function') && msg.toLowerCase().includes('does not exist')) {
            errorMsg = 'Database function not found. Run fix-userinfo-rls.sql in Supabase SQL Editor to create it.'
          }
        } catch {
          // Use default error message
        }
        
        setError(errorMsg)
        return
      }

      // If no data returned but no error, verify the save worked by fetching the profile
      if (!upsertData || (Array.isArray(upsertData) && upsertData.length === 0)) {
        console.warn('No data returned from save operation, verifying...')
        
        // Verify by fetching the profile
        const { data: verifyData, error: verifyError } = await supabase
          .from('userinfo')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (verifyError || !verifyData) {
          console.error('Could not verify profile save:', verifyError)
          setError('Profile may have been saved, but could not verify. Please refresh the page.')
          return
        }

        // Profile exists, save was successful
        console.log('Profile verified successfully:', verifyData)
      }

      // Success - profile saved
      setSuccess(true)
      setTimeout(() => {
        // Add timestamp to force refresh on profile page
        router.push(`/profile/${encodeURIComponent(username)}?t=${Date.now()}`)
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred saving the profile')
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none opacity-10" />

      {/* Header */}
      <header className="relative z-10 border-b border-green-400/20 bg-black/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/profile/${encodeURIComponent(username)}`} className="flex items-center space-x-2 hover:text-green-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">BACK_TO_PROFILE</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-green-400/30 bg-black/95 backdrop-blur-sm p-8"
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold glitch mb-2">EDIT_PROFILE.exe</h1>
            <p className="text-green-400/70">Update your operative information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Upload */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>PHOTO</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-48 h-64 border-2 border-green-400/50 bg-black/50 relative overflow-hidden">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt="Profile photo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-16 h-16 text-green-400/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 border border-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center space-x-2 mb-3"
                  >
                    <Upload className="w-4 h-4" />
                    <span>UPLOAD_PHOTO</span>
                  </button>
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null)
                        setPhotoPreview(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="px-4 py-2 text-red-400 border border-red-400/50 hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>REMOVE_PHOTO</span>
                    </button>
                  )}
                  <p className="text-xs text-green-400/70 mt-3">
                    Max file size: 5MB<br />
                    Recommended: 3:4 ratio (passport style)
                  </p>
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>PERSONAL_INFORMATION</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  label="USERNAME"
                  value={profile.username || ''}
                  onChange={(val) => setProfile({ ...profile, username: val })}
                  placeholder="username"
                  disabled
                />
                <FormField
                  label="GENDER"
                  type="select"
                  value={profile.gender || ''}
                  onChange={(val) => setProfile({ ...profile, gender: (val || null) as UserInfoRow['gender'] })}
                  options={[
                    { value: '', label: 'Select...' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                  ]}
                />
                <FormField
                  label="EMAIL"
                  type="email"
                  value={profile.email || ''}
                  onChange={(val) => setProfile({ ...profile, email: val })}
                  placeholder="operative@classified.gov"
                  icon={Mail}
                />
                <FormField
                  label="PHONE"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(val) => setProfile({ ...profile, phone: val })}
                  placeholder="+1 (555) 000-0000"
                  icon={Phone}
                />
              </div>
            </section>

            {/* Bio */}
            <section>
              <h2 className="text-xl font-bold mb-4">SHORT_BIO</h2>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Brief description (recommended max 160 characters)"
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors font-mono"
              />
              <div className="text-xs text-green-400/70 mt-1">
                {(profile.bio || '').length} / 160 characters
              </div>
            </section>

            {/* About */}
            <section>
              <h2 className="text-xl font-bold mb-4">ABOUT</h2>
              <textarea
                value={profile.about || ''}
                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                placeholder="Detailed information about you..."
                rows={6}
                className="w-full px-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors font-mono"
              />
            </section>

            {/* Social Links */}
            <section>
              <h2 className="text-xl font-bold mb-4">SOCIAL_NETWORKS</h2>
              <div className="space-y-3">
                <FormField
                  label="GITHUB"
                  value={profile.github_url || ''}
                  onChange={(val) => setProfile({ ...profile, github_url: val })}
                  placeholder="https://github.com/username"
                  icon={Github}
                />
                <FormField
                  label="LINKEDIN"
                  value={profile.linkedin_url || ''}
                  onChange={(val) => setProfile({ ...profile, linkedin_url: val })}
                  placeholder="https://linkedin.com/in/username"
                  icon={Linkedin}
                />
                <FormField
                  label="X (TWITTER)"
                  value={profile.twitter_url || ''}
                  onChange={(val) => setProfile({ ...profile, twitter_url: val })}
                  placeholder="https://x.com/username"
                  icon={Twitter}
                />
                <FormField
                  label="INSTAGRAM"
                  value={profile.instagram_url || ''}
                  onChange={(val) => setProfile({ ...profile, instagram_url: val })}
                  placeholder="https://instagram.com/username"
                  icon={Instagram}
                />
                <FormField
                  label="FACEBOOK"
                  value={profile.facebook_url || ''}
                  onChange={(val) => setProfile({ ...profile, facebook_url: val })}
                  placeholder="https://facebook.com/username"
                  icon={Facebook}
                />
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>LOCATION</span>
              </h2>
              <div className="space-y-3">
                <FormField
                  label="ADDRESS_LINE_1"
                  value={profile.address_line1 || ''}
                  onChange={(val) => setProfile({ ...profile, address_line1: val })}
                  placeholder="Street address"
                />
                <FormField
                  label="ADDRESS_LINE_2"
                  value={profile.address_line2 || ''}
                  onChange={(val) => setProfile({ ...profile, address_line2: val })}
                  placeholder="Apartment, suite, etc."
                />
                <div className="grid md:grid-cols-2 gap-3">
                  <FormField
                    label="CITY"
                    value={profile.city || ''}
                    onChange={(val) => setProfile({ ...profile, city: val })}
                    placeholder="City"
                  />
                  <FormField
                    label="STATE"
                    value={profile.state || ''}
                    onChange={(val) => setProfile({ ...profile, state: val })}
                    placeholder="State/Province"
                  />
                  <FormField
                    label="POSTAL_CODE"
                    value={profile.postal_code || ''}
                    onChange={(val) => setProfile({ ...profile, postal_code: val })}
                    placeholder="ZIP/Postal code"
                  />
                  <FormField
                    label="COUNTRY"
                    value={profile.country || ''}
                    onChange={(val) => setProfile({ ...profile, country: val })}
                    placeholder="Country"
                  />
                </div>
              </div>
            </section>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-400/50 p-4 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-400/50 p-4 flex items-center space-x-2">
                <Save className="w-5 h-5 text-green-400" />
                <p className="text-green-400">Profile saved successfully! Redirecting...</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-green-400 text-black font-bold text-lg hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>SAVE_PROFILE</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  )
}

// Helper Component
function FormField({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  icon: Icon,
  disabled = false,
  options
}: { 
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  type?: string
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
  options?: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm mb-2 text-green-400/70">{label}:</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/50" />
        )}
        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-black/50 border border-green-400/30 text-green-400 focus:border-green-400 focus:outline-none transition-colors`}
            disabled={disabled}
          >
            {options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors`}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  )
}

