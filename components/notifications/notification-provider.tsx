"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean // Changed from 'read' to 'is_read' to match database schema
  created_at: string
  action_url?: string
}

interface RealtimePayload {
  new: Notification
  old?: Notification
  eventType: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter((n) => !n.is_read).length // Updated to use is_read

  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        if (!user.uid || typeof user.uid !== "string") {
          console.warn("Invalid user ID for notifications")
          return
        }

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("firebase_uid", user.uid)
          .single()

        if (userError || !userData) {
          console.warn("User not found in database:", user.uid)
          return
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userData.id) // Use database UUID instead of Firebase UID
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) {
          console.error("Error loading notifications:", error)
          return
        }

        setNotifications(data || [])
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    loadNotifications()
  }, [user])

  useEffect(() => {
    if (!user || !user.uid) return

    if (typeof user.uid !== "string") {
      console.warn("Invalid user ID for realtime notifications")
      return
    }

    const setupRealtimeSubscription = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("firebase_uid", user.uid)
        .single()

      if (userError || !userData) {
        console.warn("User not found for realtime subscription:", user.uid)
        return
      }

      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userData.id}`, // Use database UUID
          },
          (payload: RealtimePayload) => {
            const newNotification = payload.new as Notification
            setNotifications((prev) => [newNotification, ...prev])

            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000,
            })
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userData.id}`, // Use database UUID
          },
          (payload: RealtimePayload) => {
            const updatedNotification = payload.new as Notification
            setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    let cleanup: (() => void) | undefined

    setupRealtimeSubscription().then((cleanupFn) => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, [user])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle
      case "warning":
        return AlertCircle
      case "error":
        return AlertCircle
      default:
        return Info
    }
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id) // Updated to use is_read

    if (error) {
      console.error("Error marking notification as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))) // Updated to use is_read
  }

  const markAllAsRead = async () => {
    if (!user || !user.uid) return

    if (typeof user.uid !== "string") {
      console.warn("Invalid user ID for marking notifications as read")
      return
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("firebase_uid", user.uid)
      .single()

    if (userError || !userData) {
      console.warn("User not found for marking notifications as read:", user.uid)
      return
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true }) // Updated to use is_read
      .eq("user_id", userData.id)
      .eq("is_read", false) // Updated to use is_read

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true }))) // Updated to use is_read
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) {
      console.error("Error deleting notification:", error)
      return
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
