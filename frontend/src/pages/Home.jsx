import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { postsAPI, tagsAPI } from '../api'
import PostCard from '../components/PostCard'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [featured, setFeatured] = useState([])
  const [posts, setPosts] = useState([])
  const [tags, setTags] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const activeTag = searchParams.get('tag') || ''
  const search = searchParams.get('search') || ''
  const LIMIT = 8

  useEffect(() => {
    tagsAPI.list().then(res => setTags(res.data))
  }, [])

  useEffect(() => {
    if (!activeTag && !search) {
      postsAPI.featured().then(res => setFeatured(res.data))
    } else {
      setFeatured([])
    }
  }, [activeTag, search])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    postsAPI.list({ skip: 0, limit: LIMIT, tag: activeTag || undefined, search: search || undefined })
      .then(res => {
        setPosts(res.data.posts)
        setTotal(res.data.total)
        setPages(res.data.pages)
      })
      .finally(() => setLoading(false))
  }, [activeTag, search])

  const loadMore = () => {
    const nextPage = page + 1
    postsAPI.list({ skip: (nextPage - 1) * LIMIT, limit: LIMIT, tag: activeTag || undefined, search: search || undefined })
      .then(res => {
        setPosts(prev => [...prev, ...res.data.posts])
        setPage(nextPage)
      })
  }

  const setTag = (tag) => {
    const params = {}
    if (tag) params.tag = tag
    setSearchParams(params)
  }

  const clearFilters = () => setSearchParams({})

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero — only on fresh home */}
      {!activeTag && !search && (
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-900 dark:text-white mb-4">
            Ideas worth reading.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Explore thoughtful writing on technology, design, and the craft of building things.
          </p>
        </div>
      )}

      {/* Active filters */}
      {(activeTag || search) && (
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white">
            {search ? `Results for "${search}"` : `Tagged: ${activeTag}`}
          </h2>
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
            Clear
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          {/* Featured grid */}
          {featured.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-ink-600 rounded-full" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Featured</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {featured.map(post => <PostCard key={post.id} post={post} featured />)}
              </div>
            </section>
          )}

          {/* Post list */}
          <section>
            {featured.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Latest</h2>
              </div>
            )}
            {loading ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 py-5 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
                      <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/2" />
                    </div>
                    <div className="w-24 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No posts found.</p>
                <button onClick={clearFilters} className="mt-3 text-ink-600 dark:text-ink-400 text-sm hover:underline">Browse all posts</button>
              </div>
            ) : (
              <>
                <div>
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>
                {page < pages && (
                  <div className="text-center mt-8">
                    <button onClick={loadMore} className="btn-secondary px-8">Load more</button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Topics */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTag(activeTag === tag ? '' : tag)}
                  className={`tag-pill transition-all ${activeTag === tag ? 'bg-ink-600 text-white dark:bg-ink-600 dark:text-white' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card p-5 bg-gradient-to-br from-ink-50 to-blue-50 dark:from-ink-950 dark:to-slate-800 border-ink-100 dark:border-ink-900">
            <h3 className="text-sm font-bold text-ink-900 dark:text-ink-100 mb-2">Start writing today</h3>
            <p className="text-xs text-ink-700 dark:text-ink-300 mb-4">Share your knowledge with the world. It's free and takes 30 seconds.</p>
            <Link to="/register" className="btn-primary w-full justify-center text-xs">Create account →</Link>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Community</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total posts</span>
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Topics</span>
                <span className="font-semibold text-gray-900 dark:text-white">{tags.length}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
