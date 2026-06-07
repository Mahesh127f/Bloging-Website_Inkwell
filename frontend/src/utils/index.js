import { formatDistanceToNow, format } from 'date-fns'

export const readTime = (content) => {
  const words = content?.trim().split(/\s+/).length || 0
  return Math.max(1, Math.ceil(words / 200))
}

export const timeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return ''
  }
}

export const formatDate = (date) => {
  try {
    return format(new Date(date), 'MMM d, yyyy')
  } catch {
    return ''
  }
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const avatarColor = (name) => {
  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700']
  let hash = 0
  for (const c of (name || '')) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
