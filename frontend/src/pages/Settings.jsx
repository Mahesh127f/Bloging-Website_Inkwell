import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import { Avatar } from '../components/PostCard'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  })
  const [loading, setLoading] = useState(false)

  if (!user) { navigate('/login'); return null }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.updateProfile(form)
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // Quick avatar presets
  const avatarPresets = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}&backgroundColor=b6e3f4`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}2&backgroundColor=ffd5dc`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}3&backgroundColor=c9f0d8`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}4&backgroundColor=c0aede`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}5&backgroundColor=fde68a`,
  ]

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white mb-8">Account Settings</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Profile</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-5">
          <Avatar user={{ ...user, avatar_url: form.avatar_url }} size="lg" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose an avatar</p>
            <div className="flex gap-2">
              {avatarPresets.map((url, i) => (
                <button key={i} onClick={() => setForm({ ...form, avatar_url: url })}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${form.avatar_url === url ? 'border-ink-600' : 'border-transparent hover:border-gray-300'}`}>
                  <img src={url} alt="" className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full name</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
              placeholder="Your name" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the world about yourself..." rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Avatar URL <span className="text-xs font-normal text-gray-400">(or use a preset above)</span></label>
            <input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Username</span>
            <span className="font-medium text-gray-900 dark:text-white">@{user.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100 dark:border-red-900">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400 mb-4">Sign out</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">You'll need to sign in again to access your account.</p>
        <button onClick={() => { logout(); navigate('/') }} className="px-4 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}
