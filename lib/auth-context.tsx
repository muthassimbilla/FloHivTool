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
    console.log("[v0] Converting Firebase user to AuthUser:", firebaseUser.uid)

    try {
      const { data: supabaseUser, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUser.uid)
        .single()

      console.log("[v0] Supabase user data:", supabaseUser)
      console.log("[v0] Supabase error:", error)

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
    } catch (error) {
      console.error("[v0] Error converting Firebase user:", error)
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        isApproved: false,
        role: "user",
      }
    }
  }

  const syncUserWithSupabase = async (firebaseUser: FirebaseUser) => {
    console.log("[v0] Syncing user with Supabase:", firebaseUser.uid)

    if (!supabase) {
      console.warn("[v0] Supabase not available, skipping sync")
      return
    }

    const userData = {
      firebase_uid: firebaseUser.uid,
      email: firebaseUser.email,
      display_name: firebaseUser.displayName,
      email_verified: firebaseUser.emailVerified,
      last_login: new Date().toISOString(),
    }

    try {
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUser.uid)
        .single()

      console.log("[v0] Existing user check:", existingUser)
      console.log("[v0] Select error:", selectError)

      if (existingUser) {
        console.log("[v0] Updating existing user")
        const { error: updateError } = await supabase
          .from("users")
          .update(userData)
          .eq("firebase_uid", firebaseUser.uid)

        if (updateError) {
          console.error("[v0] Error updating user:", updateError)
        } else {
          console.log("[v0] User updated successfully")
        }
      } else {
        console.log("[v0] Creating new user")
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            ...userData,
            is_approved: false,
            role: "user",
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Error creating user:", insertError)
        } else {
          console.log("[v0] New user created successfully:", newUser)
        }
      }
    } catch (error) {
      console.error("[v0] Error syncing user with Supabase:", error)
    }
  }

  useEffect(() => {
    if (!auth) {
      console.warn("[v0] Firebase auth not initialized - authentication features disabled")
      setLoading(false)
      return
    }

    console.log("[v0] Setting up Firebase auth state listener")
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[v0] Auth state changed:", firebaseUser?.uid || "null")

      if (firebaseUser) {
        try {
          await syncUserWithSupabase(firebaseUser)
          const authUser = await convertToAuthUser(firebaseUser)
          console.log("[v0] Setting user:", authUser)
          setUser(authUser)
        } catch (error) {
          console.error("[v0] Error syncing user:", error)
          setUser(null)
        }
      } else {
        console.log("[v0] No Firebase user, setting user to null")
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase authentication not configured")
    }
    console.log("[v0] Attempting sign in for:", email)
    await signInWithEmailAndPassword(auth, email, password)
    console.log("[v0] Sign in successful")
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase authentication not configured")
    }
    console.log("[v0] Attempting sign up for:", email)
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    if (firebaseUser) {
      console.log("[v0] Sign up successful, sending verification email")
      await sendEmailVerification(firebaseUser)
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase authentication not configured")
    }
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    if (!auth) {
      throw new Error("Firebase authentication not configured")
    }
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error("Firebase authentication not configured")
    }
    await sendPasswordResetEmail(auth, email)
  }

  const resendVerification = async () => {
    if (!auth || !auth.currentUser) {
      throw new Error("Firebase authentication not configured or user not logged in")
    }
    await sendEmailVerification(auth.currentUser)
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
