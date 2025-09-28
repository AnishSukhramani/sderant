'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Post, Comment } from '@/app/page'
import { getUserIdentifier, formatTimeAgo } from '@/lib/utils'
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  ThumbsUp, 
  Laugh, 
  Angry,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentName, setCommentName] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [isReacting, setIsReacting] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const postRef = useRef<HTMLElement>(null)

  const trackView = useCallback(async () => {
    try {
      // Increment view count in database
      const { error } = await (supabase as any)
        .from('posts')
        .update({ views_count: post.views_count + 1 })
        .eq('id', post.id)

      if (error) {
        console.error('Error tracking view:', error)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [post.id, post.views_count])

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [post.id])

  const fetchUserReactions = useCallback(async () => {
    try {
      const userIdentifier = getUserIdentifier()
      // Get user's reactions
      const { data, error } = await (supabase as any)
        .from('reactions')
        .select('type')
        .eq('post_id', post.id)
        .eq('ip_address', userIdentifier)

      if (error) {
        console.error('Error fetching reactions:', error)
      } else {
        setUserReactions(data?.map((r: { type: string }) => r.type) || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }, [post.id])

  const handleReaction = async (type: 'like' | 'dislike' | 'laugh' | 'angry' | 'heart') => {
    if (isReacting) return
    
    setIsReacting(true)
    
    try {
      const userIdentifier = getUserIdentifier()
      const isReacted = userReactions.includes(type)
      
      if (isReacted) {
        // Remove reaction
        const { error } = await (supabase as any)
          .from('reactions')
          .delete()
          .eq('post_id', post.id)
          .eq('type', type)
          .eq('ip_address', userIdentifier)
        
        if (!error) {
          setUserReactions(prev => prev.filter(r => r !== type))
          // Trigger a page refresh to update counts
          setTimeout(() => window.location.reload(), 100)
        }
      } else {
        // Add reaction
        const { error } = await (supabase as any)
          .from('reactions')
          .insert({
            post_id: post.id,
            type,
            ip_address: userIdentifier
          })
        
        if (!error) {
          setUserReactions(prev => [...prev, type])
          // Trigger a page refresh to update counts
          setTimeout(() => window.location.reload(), 100)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    setIsSubmittingComment(true)
    
    try {
      const { error } = await (supabase as any)
        .from('comments')
        .insert({
          post_id: post.id,
          name: commentName.trim() || null,
          content: newComment.trim(),
        })

      if (error) {
        console.error('Error creating comment:', error)
      } else {
        setNewComment('')
        setCommentName('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-1"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )
      }
      return part
    })
  }

  return (
    <article 
      ref={postRef} 
      className={`border border-green-400/20 bg-black/50 transition-all duration-300 ${
        hasViewed ? 'border-green-400/40 bg-black/60' : ''
      }`}
    >
      {/* Post Header */}
      <div className="border-b border-green-400/20 p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-400/20 rounded-full flex items-center justify-center">
              <span className="text-green-400 font-bold text-xs">
                {post.name ? post.name[0].toUpperCase() : '?'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base">{post.title}</h3>
              <p className="text-xs text-green-400/70">
                by {post.name || 'Anonymous Developer'} • {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-green-400/70">
            <Eye className={`w-3 h-3 ${hasViewed ? 'text-green-400' : 'text-green-400/50'}`} />
            <span className={hasViewed ? 'text-green-400' : 'text-green-400/70'}>
              {post.views_count + (hasViewed ? 1 : 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-3">
        <div className="mb-3">
          <p className="whitespace-pre-wrap text-sm">{extractLinks(post.content)}</p>
        </div>
        
        {post.image_url && (
          <div className="mb-4">
            <Image
              src={post.image_url}
              alt="Post image"
              width={800}
              height={600}
              className="max-w-full h-auto rounded border border-green-400/20"
            />
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={() => handleReaction('like')}
            disabled={isReacting}
            className={`flex items-center space-x-1 px-2 py-1 border transition-colors text-xs ${
              userReactions.includes('like')
                ? 'border-green-400 bg-green-400/20 text-green-400'
                : 'border-green-400/50 hover:border-green-400 text-green-400/70'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{post.likes_count}</span>
          </button>
          
          <button
            onClick={() => handleReaction('heart')}
            disabled={isReacting}
            className={`flex items-center space-x-1 px-2 py-1 border transition-colors text-xs ${
              userReactions.includes('heart')
                ? 'border-red-400 bg-red-400/20 text-red-400'
                : 'border-red-400/50 hover:border-red-400 text-red-400/70'
            }`}
          >
            <Heart className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleReaction('laugh')}
            disabled={isReacting}
            className={`flex items-center space-x-1 px-2 py-1 border transition-colors text-xs ${
              userReactions.includes('laugh')
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                : 'border-yellow-400/50 hover:border-yellow-400 text-yellow-400/70'
            }`}
          >
            <Laugh className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleReaction('angry')}
            disabled={isReacting}
            className={`flex items-center space-x-1 px-2 py-1 border transition-colors text-xs ${
              userReactions.includes('angry')
                ? 'border-orange-400 bg-orange-400/20 text-orange-400'
                : 'border-orange-400/50 hover:border-orange-400 text-orange-400/70'
            }`}
          >
            <Angry className="w-3 h-3" />
          </button>
        </div>

        {/* Comments Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 text-green-400/70 hover:text-green-400 transition-colors text-sm"
        >
          <MessageCircle className="w-3 h-3" />
          <span>{post.comments_count} comments</span>
          {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-green-400/20 p-3 bg-black/30">
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-3 space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Name (optional)"
                className="terminal-input flex-1 text-sm"
                maxLength={50}
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="terminal-input flex-2 resize-none text-sm"
                rows={1}
                maxLength={500}
                required
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-3 py-1 bg-green-400 text-black font-bold hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isSubmittingComment ? '...' : 'POST'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-green-400/30 pl-3">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-bold text-xs">
                    {comment.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-green-400/70">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-xs">{extractLinks(comment.content)}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-green-400/70 text-xs">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </article>
  )
}