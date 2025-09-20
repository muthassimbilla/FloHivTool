"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Send, Users, Bell, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  user?: {
    email: string
    full_name: string
  }
}

interface User {
  id: string
  email: string
  full_name: string
  status: string
}

export default function NotificationsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    recipient: "all",
    specificUser: "",
    title: "",
    message: "",
    type: "info",
  })

  useEffect(() => {
    loadUsers()
    loadNotifications()
  }, [])

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, status")
      .eq("status", "approved")
      .order("full_name")

    if (error) {
      console.error("Error loading users:", error)
      return
    }

    setUsers(data || [])
  }

  const loadNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        user:user_profiles(email, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error loading notifications:", error)
      return
    }

    setNotifications(data || [])
  }

  const sendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      let targetUsers: string[] = []

      if (formData.recipient === "all") {
        targetUsers = users.map((u) => u.id)
      } else if (formData.recipient === "specific" && formData.specificUser) {
        targetUsers = [formData.specificUser]
      }

      if (targetUsers.length === 0) {
        toast({
          title: "Error",
          description: "No recipients selected",
          variant: "destructive",
        })
        return
      }

      // Create notifications for all target users
      const notificationsToSend = targetUsers.map((userId) => ({
        user_id: userId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        read: false,
      }))

      const { error } = await supabase.from("notifications").insert(notificationsToSend)

      if (error) throw error

      toast({
        title: "Success",
        description: `Notification sent to ${targetUsers.length} user(s)`,
      })

      // Reset form
      setFormData({
        recipient: "all",
        specificUser: "",
        title: "",
        message: "",
        type: "info",
      })

      // Reload notifications
      loadNotifications()
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
      return
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast({
      title: "Success",
      description: "Notification deleted",
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Send notifications to users and manage notification history</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>Send notifications to users about important updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipients</Label>
              <Select
                value={formData.recipient}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, recipient: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      All Users ({users.length})
                    </div>
                  </SelectItem>
                  <SelectItem value="specific">
                    <div className="flex items-center gap-2">Specific User</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.recipient === "specific" && (
              <div className="space-y-2">
                <Label htmlFor="specificUser">Select User</Label>
                <Select
                  value={formData.specificUser}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, specificUser: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={3}
              />
            </div>

            <Button onClick={sendNotification} disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>History of sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications sent yet</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {notification.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            To: {notification.user.full_name} ({notification.user.email})
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
