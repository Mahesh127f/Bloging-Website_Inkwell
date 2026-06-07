import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usersAPI, postsAPI } from '../api'
import { Avatar } from '../components/PostCard'
import PostCard from '../components/PostCard'
import { formatDate } from '../utils'

export default function Profile() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      usersAPI.getProfile(id),
      postsAPI.list({ skip: 0, limit: 50 })
    ]).then(([userRes, postsRes]) => {
      setUser(userRes.data)
      const userPosts = postsRes.data.posts.filter(p => p.author_id === parseInt(id))
      setPosts(userPosts)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-pulse">
        <div className="flex gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-slate-700 rounded-xl mb-3" />
        ))}
      </div>
    )
  }

  if (!user) return <div className="text-center py-20 text-gray-400">User not found</div>

  const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0)
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Avatar user={user} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
              {user.full_name || user.username}
            </h1>
            <p className="text-sm text-gray-400 mb-2">@{user.username}</p>
            {user.bio && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{user.bio}</p>}
            <p className="text-xs text-gray-400">Member since {formatDate(user.created_at)}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLikes}</p>
            <p className="text-xs text-gray-400 mt-0.5">Likes received</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalViews}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total views</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-4">
        Posts by {user.full_name || user.username}
      </h2>

      {posts.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-gray-400">No posts yet.</p>
        </div>
      ) : (
        <div className="card px-5">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}
