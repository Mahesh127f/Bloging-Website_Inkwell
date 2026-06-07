import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('inkwell_token')
    const saved = localStorage.getItem('inkwell_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      authAPI.getMe().then(res => {
        setUser(res.data)
        localStorage.setItem('inkwell_user', JSON.stringify(res.data))
      }).catch(() => logout())
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login(username, password)
    localStorage.setItem('inkwell_token', res.data.access_token)
    const me = await authAPI.getMe()
    setUser(me.data)
    localStorage.setItem('inkwell_user', JSON.stringify(me.data))
    return me.data
  }

  const register = async (data) => {
    await authAPI.register(data)
    return login(data.username, data.password)
  }

  const logout = () => {
    localStorage.removeItem('inkwell_token')
    localStorage.removeItem('inkwell_user')
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(data)
    localStorage.setItem('inkwell_user', JSON.stringify(data))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
