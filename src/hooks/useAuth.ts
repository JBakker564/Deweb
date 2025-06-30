import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { success: true, user: data.user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      return { success: false, error: message }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      return { success: false, error: message }
    }
  }

  // Sign up (for creating admin accounts)
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      return { success: true, user: data.user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      return { success: false, error: message }
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    signUp
  }
}