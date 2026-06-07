import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inkwell_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inkwell_token')
      localStorage.removeItem('inkwell_user')
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => {
    const form = new FormData()
    form.append('username', username)
    form.append('password', password)
    return api.post('/auth/login', form)
  },
  getMe: () => api.get('/users/me/profile'),
  updateProfile: (data) => api.put('/users/me', data),
}

export const postsAPI = {
  list: (params) => api.get('/posts', { params }),
  featured: () => api.get('/posts/featured'),
  get: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  getLike: (id) => api.get(`/posts/${id}/like`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  getComments: (id) => api.get(`/posts/${id}/comments`),
  addComment: (id, content) => api.post(`/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
}

export const tagsAPI = {
  list: () => api.get('/tags'),
}

export const usersAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
}

export default api
