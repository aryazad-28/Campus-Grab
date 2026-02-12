'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'campus-grab-user'

// Demo users for when Supabase is not configured
const DEMO_USERS = [
  { id: 'demo1', name: 'Demo Student', email: 'student@demo.com', password: 'demo123' },
]

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null
  return {
    id: supabaseUser.id,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email || ''
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for demo user in localStorage first
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setIsLoading(false)
        return
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null))
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    // Demo mode when Supabase not configured
    if (!supabase) {
      const newUser = { id: `user_${Date.now()}`, name, email }
      setUser(newUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      return { success: true }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { success: true, error: 'Please check your email to verify your account' }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signIn = async (email: string, password: string) => {
    // Demo mode when Supabase not configured
    if (!supabase) {
      // Check demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (demoUser) {
        const { password: _, ...userData } = demoUser
        setUser(userData)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
        return { success: true }
      }
      // Allow any email/password in demo mode for testing
      const newUser = { id: `user_${Date.now()}`, name: email.split('@')[0], email }
      setUser(newUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      return { success: true }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { success: false, error: 'Google sign-in requires Supabase configuration' }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/menu`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { success: false, error: 'Password reset requires Supabase configuration' }
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
