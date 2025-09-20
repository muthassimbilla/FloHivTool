"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "./firebase"
import { supabase } from "./supabase"

interface AuthUser {
  uid: string
  email: string | null
  emailVerified: boolean
  displayName: string | null
  isApproved: boolean
  role: "user" | "admin"
  subscriptionEndDate?: string
  userAgentLimit?: number
  customLimit?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const convertToAuthUser = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    // Get user data from Supabase
    const { data: supabaseUser } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUser.uid)
      .single()

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      isApproved: supabaseUser?.is_approved || false,
      role: supabaseUser?.role || "user",
      subscriptionEndDate: supabaseUser?.subscription_end_date,
      userAgentLimit: supabaseUser?.user_agent_limit,
      customLimit: supabaseUser?.custom_limit,
    }
  }

  const syncUserWithSupabase = async (firebaseUser: FirebaseUser) => {
    const userData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      display_name: firebaseUser.displayName,
      email_verified: firebaseUser.emailVerified,
      last_login: new Date().toISOString(),
    }

    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUser.uid)
      .single()

    if (existingUser) {
      // Update existing user
      await supabase.from("users").update(userData).eq("firebase_uid", firebaseUser.uid)
    } else {
      // Create new user (pending approval)
      await supabase.from("users").insert({
        ...userData,
        is_approved: false,
        role: "user",
        created_at: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          await syncUserWithSupabase(firebaseUser)
          const authUser = await convertToAuthUser(firebaseUser)
          setUser(authUser)
        } catch (error) {
          console.error("Error syncing user:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    if (firebaseUser) {
      await sendEmailVerification(firebaseUser)
    }
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    resendVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
