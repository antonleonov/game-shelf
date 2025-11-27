'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface User {
  id: number
  email: string
  name: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (googleId: string, email: string, name: string, picture?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUser(res.data))
        .catch(() => {
          Cookies.remove('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (googleId: string, email: string, name: string, picture?: string) => {
    try {
      console.log('Attempting login with:', { googleId, email, name, apiUrl: API_URL })
      
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        googleId,
        email,
        name,
        picture
      })
      
      if (!res.data.token) {
        throw new Error('No token received from server')
      }
      
      Cookies.set('token', res.data.token, { expires: 7 })
      setUser(res.data.user)
      console.log('Login successful for user:', res.data.user.id)
    } catch (error: any) {
      console.error('Login error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        apiUrl: API_URL
      })
      throw error
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

