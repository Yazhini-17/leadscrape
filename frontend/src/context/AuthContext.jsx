import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('leadscrape_user') || 'null') } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('leadscrape_token') || null)
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token

  async function login(email, password) {
    setIsLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { access_token, user: userData } = res.data
      localStorage.setItem('leadscrape_token', access_token)
      localStorage.setItem('leadscrape_user', JSON.stringify(userData))
      setToken(access_token)
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  async function register(email, fullName, password) {
    setIsLoading(true)
    try {
      const res = await api.post('/api/auth/register', { email, full_name: fullName, password })
      const { access_token, user: userData } = res.data
      localStorage.setItem('leadscrape_token', access_token)
      localStorage.setItem('leadscrape_user', JSON.stringify(userData))
      setToken(access_token)
      setUser(userData)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('leadscrape_token')
    localStorage.removeItem('leadscrape_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
