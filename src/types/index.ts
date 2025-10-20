export type Post = {
  id: string
  name: string | null
  title: string
  content: string
  image_url: string | null
  created_at: string
  updated_at: string
  likes_count: number
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

export type Reaction = {
  id: string
  post_id: string
  type: 'like' | 'dislike' | 'laugh' | 'angry' | 'heart'
  ip_address: string
  created_at: string
}

export type TrendingPeriod = 'hour' | 'day' | 'all'

