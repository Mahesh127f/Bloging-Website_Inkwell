import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/PostCard'
import { readTime, timeAgo, formatDate, copyToClipboard } from '../utils'

export default function PostDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      postsAPI.get(id),
      postsAPI.getComments(id),
      postsAPI.getLike(id),
    ]).then(([postRes, commentsRes, likeRes]) => {
      setPost(postRes.data)
      setComments(commentsRes.data)
      setLiked(likeRes.data.liked)
      setLikeCount(likeRes.data.count)
    }).catch(() => navigate('/'))
    .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like posts'); return }
    try {
      const res = await postsAPI.toggleLike(id)
      setLiked(res.data.liked)
      setLikeCount(res.data.count)
    } catch {}
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!user) { toast.error('Sign in to comment'); return }
    setSubmitting(true)
    try {
      const res = await postsAPI.addComment(id, newComment.trim())
      setComments(prev => [...prev, res.data])
      setNewComment('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await postsAPI.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch {}
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await postsAPI.delete(id)
      toast.success('Post deleted')
      navigate('/')
    } catch {}
  }

  const handleShare = async () => {
    await copyToClipboard(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
        <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-8" />
        <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-xl mb-8" />
        <div className="space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700 rounded" />)}</div>
      </div>
    )
  }
  if (!post) return null

  const rt = readTime(post.content)
  const isOwner = user?.id === post.author_id

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-ink-600 transition-colors">Home</Link>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        <span className="truncate text-gray-500">{post.title}</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags?.map(t => (
          <Link key={t.id} to={`/?tag=${encodeURIComponent(t.name)}`} className="tag-pill">{t.name}</Link>
        ))}
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 dark:text-white leading-tight mb-4">{post.title}</h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
        <Link to={`/profile/${post.author?.id}`} className="flex items-center gap-3 group">
          <Avatar user={post.author} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors">
              {post.author?.full_name || post.author?.username}
            </p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at)} · {rt} min read</p>
          </div>
        </Link>
        <div className="flex items-center gap-2 ml-auto">
          {/* Views */}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {post.views}
          </span>
          {/* Like */}
          <button onClick={handleLike} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${liked ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-red-200 dark:hover:border-red-800 hover:text-red-500'}`}>
            <svg className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {likeCount}
          </button>
          {/* Share */}
          <button onClick={handleShare} className="btn-secondary py-1.5 px-3 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
          {/* Edit/Delete */}
          {isOwner && (
            <>
              <Link to={`/edit/${post.id}`} className="btn-secondary py-1.5 px-3 text-xs">Edit</Link>
              <button onClick={handleDeletePost} className="py-1.5 px-3 text-xs rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Delete</button>
            </>
          )}
        </div>
      </div>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mb-8 rounded-2xl overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-blue dark:prose-dark prose-lg max-w-none mb-12">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Author card */}
      <div className="card p-6 mb-10 flex gap-4">
        <Link to={`/profile/${post.author?.id}`}>
          <Avatar user={post.author} size="lg" />
        </Link>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Written by</p>
          <Link to={`/profile/${post.author?.id}`} className="text-base font-bold text-gray-900 dark:text-white hover:text-ink-600 dark:hover:text-ink-400 transition-colors">
            {post.author?.full_name || post.author?.username}
          </Link>
          {post.author?.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{post.author.bio}</p>}
        </div>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-6">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <div className="flex gap-3">
              <Avatar user={user} size="sm" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={3}
                  className="input-field resize-none mb-2"
                />
                <div className="flex justify-end">
                  <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary">
                    {submitting ? 'Posting...' : 'Post comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Join the conversation</p>
            <div className="flex gap-2 justify-center">
              <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Create account</Link>
            </div>
          </div>
        )}

        {/* Comment list */}
        <div className="space-y-5">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Link to={`/profile/${comment.author?.id}`}>
                <Avatar user={comment.author} size="sm" />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${comment.author?.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-ink-600 dark:hover:text-ink-400 transition-colors">
                        {comment.author?.full_name || comment.author?.username}
                      </Link>
                      <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    {user?.id === comment.author_id && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
