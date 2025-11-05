'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import type { Post, Comment } from '@/types'
import { getUserIdentifier, formatTimeAgo } from '@/lib/utils'
import { 
  MessageCircle, 
  Eye, 
  Award,
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
  const [hasGivenCred, setHasGivenCred] = useState(false)
  const [isGivingCred, setIsGivingCred] = useState(false)
  const [streetCredsCount, setStreetCredsCount] = useState(post.street_creds_count)
  const [hasViewed] = useState(false)
  const postRef = useRef<HTMLElement>(null)


  const fetchComments = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const checkUserStreetCred = useCallback(async () => {
    try {
      const userIdentifier = getUserIdentifier()
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('street_creds')
        .select('id')
        .eq('post_id', post.id)
        .eq('ip_address', userIdentifier)
        .maybeSingle()

      if (!error && data) {
        setHasGivenCred(true)
      } else {
        setHasGivenCred(false)
      }
    } catch (error) {
      console.error('Error checking street cred:', error)
    }
  }, [post.id])

  // Check if user has already given a street cred on mount
  useEffect(() => {
    checkUserStreetCred()
  }, [checkUserStreetCred])

  const handleStreetCred = async () => {
    if (isGivingCred) return
    
    setIsGivingCred(true)
    
    try {
      const userIdentifier = getUserIdentifier()
      
      if (hasGivenCred) {
        // Remove street cred
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('street_creds')
          .delete()
          .eq('post_id', post.id)
          .eq('ip_address', userIdentifier)
        
        if (!error) {
          setHasGivenCred(false)
          // Update the local count for instant feedback
          setStreetCredsCount(prev => Math.max(0, prev - 1))
        } else {
          console.error('Error removing street cred:', error)
        }
      } else {
        // Give street cred
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('street_creds')
          .insert({
            post_id: post.id,
            ip_address: userIdentifier
          })
        
        if (!error) {
          setHasGivenCred(true)
          // Update the local count for instant feedback
          setStreetCredsCount(prev => prev + 1)
        } else {
          console.error('Error giving street cred:', error)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsGivingCred(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    
    setIsSubmittingComment(true)
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        {/* Street Creds */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={handleStreetCred}
            disabled={isGivingCred}
            className={`flex items-center space-x-2 px-3 py-2 border transition-all duration-200 ${
              hasGivenCred
                ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400 shadow-lg shadow-yellow-400/20'
                : 'border-green-400/50 hover:border-yellow-400 hover:bg-yellow-400/10 text-green-400 hover:text-yellow-400'
            }`}
            title="Give Street Cred"
          >
            <Award className={`w-4 h-4 ${hasGivenCred ? 'fill-yellow-400' : ''}`} />
            <span className="font-bold text-sm">{streetCredsCount}</span>
            <span className="text-xs font-mono">
              {streetCredsCount === 1 ? 'CRED' : 'CREDS'}
            </span>
          </button>
        </div>

        {/* Comments Toggle */}
        <button
          onClick={() => {
            if (!showComments) {
              fetchComments()
            }
            setShowComments(!showComments)
          }}
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