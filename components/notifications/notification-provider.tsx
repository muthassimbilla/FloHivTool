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
  read: boolean
  created_at: string
  action_url?: string
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

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.uid)
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
    if (!user) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
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
          filter: `user_id=eq.${user.uid}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) => prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id)

    if (error) {
      console.error("Error marking notification as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = async () => {
    if (!user) return

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.uid)
      .eq("read", false)

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
