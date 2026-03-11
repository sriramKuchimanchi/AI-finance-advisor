import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('fa_token')
    if (!savedToken) { setLoading(false); return }

    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) { setToken(savedToken); setUser(data.user) }
        else localStorage.removeItem('fa_token')
      })
      .catch(() => localStorage.removeItem('fa_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('fa_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }

  const logout = async () => {
    if (token) {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {})
    }
    localStorage.removeItem('fa_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}