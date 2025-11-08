export type ArchetypeId = 'corpo' | 'mercenary' | 'fixer' | 'nomad' | 'street_kid' | 'netrunner'

export type Post = {
  id: string
  name: string | null
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  street_creds_count: number
  comments_count: number
  views_count: number
}

export type Comment = {
  id: string
  post_id: string
  name: string | null
  content: string
  created_at: string
  updated_at: string
}

export type StreetCred = {
  id: string
  post_id: string
  ip_address: string
  created_at: string
}

export type User = {
  id: string
  name: string
  username_hash: string
  created_at: string
}

export type UserInfo = {
  id: string
  user_id: string
  username: string
  photo_url: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  email: string | null
  phone: string | null
  bio: string | null
  about: string | null
  github_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string | null
  postal_code: string | null
  archetype: ArchetypeId | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type TrendingPeriod = 'hour' | 'day' | 'all'

