"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { UserCheck, UserX, Mail, Clock } from "lucide-react"
import { toast } from "sonner"

interface PendingUser {
  id: string
  firebase_uid: string
  email: string
  display_name: string | null
  email_verified: boolean
  created_at: string
  last_login: string | null
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      setPendingUsers(data || [])
    } catch (error) {
      console.error("Error fetching pending users:", error)
      toast.error("Failed to fetch pending users")
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "approve" | "reject") => {
    setProcessingIds((prev) => new Set(prev).add(userId))

    try {
      if (action === "approve") {
        const { error } = await supabase.from("users").update({ is_approved: true }).eq("id", userId)

        if (error) throw error

        // Create notification for approved user
        await supabase.from("notifications").insert({
          user_id: userId,
          title: "Account Approved",
          message: "Your account has been approved! You now have full access to UAGen Pro.",
          type: "success",
        })

        toast.success("User approved successfully")
      } else {
        // For rejection, we could either delete the user or mark them as rejected
        const { error } = await supabase.from("users").delete().eq("id", userId)

        if (error) throw error

        toast.success("User rejected and removed")
      }

      // Remove from pending list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      toast.error(`Failed to ${action} user`)
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const bulkApprove = async () => {
    if (!confirm(`Are you sure you want to approve all ${pendingUsers.length} pending users?`)) {
      return
    }

    try {
      const userIds = pendingUsers.map((user) => user.id)

      const { error } = await supabase.from("users").update({ is_approved: true }).in("id", userIds)

      if (error) throw error

      // Create notifications for all approved users
      const notifications = pendingUsers.map((user) => ({
        user_id: user.id,
        title: "Account Approved",
        message: "Your account has been approved! You now have full access to UAGen Pro.",
        type: "success",
      }))

      await supabase.from("notifications").insert(notifications)

      setPendingUsers([])
      toast.success(`Successfully approved ${userIds.length} users`)
    } catch (error) {
      console.error("Error bulk approving users:", error)
      toast.error("Failed to bulk approve users")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pending Approvals</h1>
        <p className="text-gray-400 mt-2">Review and approve new user registrations</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-medium">{pendingUsers.length} users awaiting approval</span>
        </div>

        {pendingUsers.length > 0 && (
          <Button onClick={bulkApprove} className="bg-green-600 hover:bg-green-700">
            <UserCheck className="w-4 h-4 mr-2" />
            Approve All
          </Button>
        )}
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-white">Pending Users</CardTitle>
          <CardDescription className="text-gray-400">
            Users waiting for admin approval to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Email Status</TableHead>
                  <TableHead className="text-gray-300">Registration Date</TableHead>
                  <TableHead className="text-gray-300">Last Activity</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      Loading pending users...
                    </TableCell>
                  </TableRow>
                ) : pendingUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="w-12 h-12 text-gray-600" />
                        <p>No pending approvals</p>
                        <p className="text-sm">All users have been processed</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm text-white">{user.email.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {user.display_name || user.email.split("@")[0]}
                            </div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.email_verified ? (
                          <Badge variant="default" className="admin-status-approved">
                            <Mail className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Mail className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-white">{new Date(user.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(user.created_at).toLocaleTimeString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never logged in"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, "approve")}
                            disabled={processingIds.has(user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction(user.id, "reject")}
                            disabled={processingIds.has(user.id)}
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
