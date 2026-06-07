import { Link } from 'react-router-dom'
import { readTime, timeAgo, getInitials, avatarColor } from '../utils'

export default function PostCard({ post, featured = false }) {
  const rt = readTime(post.content)

  if (featured) {
    return (
      <Link to={`/post/${post.id}`} className="group block card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {post.cover_image && (
          <div className="overflow-hidden h-52">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags?.slice(0, 2).map(t => (
              <span key={t.id} className="tag-pill">{t.name}</span>
            ))}
          </div>
          <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors leading-snug">{post.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar user={post.author} size="sm" />
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{post.author?.full_name || post.author?.username}</p>
                <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                {post.like_count || 0}
              </span>
              <span>{rt} min read</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <article className="flex gap-4 py-5 border-b border-gray-100 dark:border-slate-800 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Avatar user={post.author} size="xs" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{post.author?.full_name || post.author?.username}</span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
        </div>
        <Link to={`/post/${post.id}`}>
          <h3 className="text-base font-bold font-serif text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-ink-600 dark:group-hover:text-ink-400 transition-colors leading-snug">{post.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {post.tags?.slice(0, 2).map(t => (
              <span key={t.id} className="tag-pill">{t.name}</span>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto">{rt} min read</span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {post.like_count || 0}
          </span>
        </div>
      </div>
      {post.cover_image && (
        <Link to={`/post/${post.id}`} className="shrink-0 w-24 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </Link>
      )}
    </article>
  )
}

export function Avatar({ user, size = 'sm' }) {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' }
  const cls = sizes[size]
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt={user.username} className={`${cls} rounded-full object-cover shrink-0`} />
  }
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-semibold shrink-0 ${avatarColor(user?.full_name || user?.username)}`}>
      {getInitials(user?.full_name || user?.username)}
    </div>
  )
}
