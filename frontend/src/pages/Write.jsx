import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { postsAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Write() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', cover_image: '', tags: '', featured: false
  })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user])

  useEffect(() => {
    if (isEdit) {
      postsAPI.get(id).then(res => {
        const p = res.data
        setForm({
          title: p.title,
          content: p.content,
          excerpt: p.excerpt,
          cover_image: p.cover_image,
          tags: p.tags?.map(t => t.name).join(', ') || '',
          featured: p.featured
        })
      })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      const res = isEdit
        ? await postsAPI.update(id, payload)
        : await postsAPI.create(payload)
      toast.success(isEdit ? 'Post updated!' : 'Post published!')
      navigate(`/post/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
          {isEdit ? 'Edit post' : 'Write a new post'}
        </h1>
        <button onClick={() => setPreview(!preview)} className="btn-secondary text-sm">
          {preview ? (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Preview</>
          )}
        </button>
      </div>

      {preview ? (
        <div className="card p-8">
          {form.cover_image && <img src={form.cover_image} alt="cover" className="w-full h-64 object-cover rounded-xl mb-6" />}
          <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-4">{form.title || 'Untitled'}</h2>
          <div className="prose prose-blue dark:prose-dark max-w-none">
            {form.content || <em className="text-gray-400">No content yet</em>}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Give your post a great title..." className="input-field text-lg font-serif" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Content * <span className="text-xs font-normal text-gray-400 ml-1">Markdown supported</span>
            </label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
              placeholder="Write your post here... Markdown is supported.&#10;&#10;## Use headings&#10;**Bold**, _italic_, `code`&#10;&#10;```python&#10;# Code blocks too!&#10;```"
              rows={18} className="input-field font-mono text-sm resize-none leading-relaxed" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Excerpt <span className="text-xs font-normal text-gray-400 ml-1">Optional — auto-generated from content if left blank</span>
            </label>
            <textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})}
              placeholder="A short summary that appears in post cards..." rows={2} className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cover image URL</label>
            <input value={form.cover_image} onChange={e => setForm({...form, cover_image: e.target.value})}
              placeholder="https://images.unsplash.com/..." className="input-field" />
            {form.cover_image && (
              <div className="mt-2 h-40 rounded-lg overflow-hidden">
                <img src={form.cover_image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags <span className="text-xs font-normal text-gray-400 ml-1">Comma-separated</span>
            </label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              placeholder="web development, javascript, tips" className="input-field" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})}
              className="w-4 h-4 rounded accent-ink-600" />
            <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">Mark as featured post</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : isEdit ? 'Update post' : 'Publish post'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}
