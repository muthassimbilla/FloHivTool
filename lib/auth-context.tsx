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

    if (!supabase) {
      console.warn("[v0] Supabase not available, returning basic user data")
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        displayName: firebaseUser.displayName,
        isApproved: false,
        role: "user",
      }
    }

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
      console.warn("[v0] Please configure Supabase integration to save user data")
      return
    }

    try {
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select(
          "id, firebase_uid, email, display_name, email_verified, is_approved, role, user_agent_limit, custom_limit, subscription_type, last_login",
        )
        .eq("firebase_uid", firebaseUser.uid)
        .maybeSingle()

      console.log("[v0] Existing user check:", existingUser)
      console.log("[v0] Select error:", selectError)

      if (selectError && selectError.code !== "PGRST116") {
        console.error("[v0] Error checking existing user:", selectError)
        return
      }

      if (existingUser) {
        console.log("[v0] Updating existing user")
        const updateData = {
          email: firebaseUser.email,
          display_name: firebaseUser.displayName,
          email_verified: firebaseUser.emailVerified,
          last_login: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
          .from("users")
          .update(updateData)
          .eq("firebase_uid", firebaseUser.uid)

        if (updateError) {
          console.error("[v0] Error updating user:", updateError)
        } else {
          console.log("[v0] User updated successfully")
        }
      } else {
        console.log("[v0] Creating new user")

        const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

        console.log("[v0] Current user count:", count)
        console.log("[v0] Count error:", countError)

        const isFirstUser = count === 0
        console.log("[v0] Is first user:", isFirstUser)

        const insertData = {
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          display_name: firebaseUser.displayName,
          email_verified: firebaseUser.emailVerified,
          is_approved: isFirstUser,
          role: isFirstUser ? "admin" : "user",
          user_agent_limit: 100,
          custom_limit: false,
          subscription_type: "7_days",
          last_login: new Date().toISOString(),
        }

        console.log("[v0] Insert data:", JSON.stringify(insertData, null, 2))

        const { error: insertError } = await supabase.from("users").insert(insertData)

        if (insertError) {
          console.error("[v0] Error creating user:", insertError.message)
          console.error("[v0] Insert error details:", JSON.stringify(insertError, null, 2))

          if (insertError.code === "23505") {
            console.log("[v0] Duplicate key detected, trying update instead")
            const { error: updateError } = await supabase
              .from("users")
              .update({
                email: firebaseUser.email || "",
                display_name: firebaseUser.displayName,
                email_verified: firebaseUser.emailVerified,
                last_login: new Date().toISOString(),
              })
              .eq("firebase_uid", firebaseUser.uid)

            if (updateError) {
              console.error("[v0] Error updating duplicate user:", updateError)
            } else {
              console.log("[v0] Duplicate user updated successfully")
            }
          }
        } else {
          console.log("[v0] New user created successfully")
          if (isFirstUser) {
            console.log("[v0] First user created as admin!")
          }
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

    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      console.log("[v0] Firebase user created successfully:", firebaseUser.uid)

      if (firebaseUser) {
        console.log("[v0] Sign up successful, sending verification email")
        await sendEmailVerification(firebaseUser)
        console.log("[v0] Verification email sent")

        console.log("[v0] Forcing immediate Supabase sync")
        if (supabase) {
          await syncUserWithSupabase(firebaseUser)
          console.log("[v0] Supabase sync completed")
        } else {
          console.warn("[v0] Supabase not configured - user data will not be saved to database")
          console.warn("[v0] Please add Supabase integration to save user information")
        }
      }
    } catch (error) {
      console.error("[v0] Sign up error:", error)
      throw error
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
