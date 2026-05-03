import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoggedIn: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  )

  const decodeToken = (t: string): any => {
    try {
      return JSON.parse(atob(t.split('.')[1]))
    } catch {
      return {}
    }
  }

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    const saved = localStorage.getItem('token')
    if (!saved) return false
    return decodeToken(saved).is_admin || false
  })

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    const payload = decodeToken(newToken)
    setIsAdmin(payload.is_admin || false)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{
      token,
      login,
      logout,
      isLoggedIn: !!token,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}