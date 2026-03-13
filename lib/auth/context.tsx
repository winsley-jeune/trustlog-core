'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// The shape of everything our auth context provides.
// Every component in the app can call useAuth() to get this.
type AuthContextType = {
  user: User | null           // the Supabase auth user
  userType: 'human' | 'agent' | null  // which kind of user
  agentId: string | null      // if agent, their agent row ID
  loading: boolean            // are we still checking auth?
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userType: null,
  agentId: null,
  loading: true,
  signOut: async () => {},
})

// This provider wraps the entire app.
// It watches Supabase auth state and tells every child component
// when the user logs in, logs out, or their session changes.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<'human' | 'agent' | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get the current session on first load
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        // Read the user type we stored during signup
        setUserType(user.user_metadata?.type || null)
        setAgentId(user.user_metadata?.agent_id || null)
      }
      setLoading(false)
    })

    // Subscribe to future auth changes — login, logout, token refresh
    // This is what makes the UI react instantly when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setUserType(session?.user?.user_metadata?.type || null)
        setAgentId(session?.user?.user_metadata?.agent_id || null)
        setLoading(false)
      }
    )

    // Clean up the subscription when the component unmounts
    // Without this, you'd have memory leaks and duplicate listeners
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, userType, agentId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — lets any component access auth with one line:
// const { user, userType, signOut } = useAuth()
export const useAuth = () => useContext(AuthContext)