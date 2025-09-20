"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import { Search, MoreHorizontal, UserCheck, UserX, Edit, Trash2, Calendar } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  firebase_uid: string
  email: string
  display_name: string | null
  email_verified: boolean
  is_approved: boolean
  role: string
  user_agent_limit: number
  custom_limit: boolean
  subscription_end_date: string | null
  subscription_type: string
  last_login: string | null
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredUsers(filtered)
  }, [users, searchTerm])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_approved: isApproved }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_approved: isApproved } : user)))

      toast.success(`User ${isApproved ? "approved" : "rejected"} successfully`)
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase.from("users").update({ role }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)))

      toast.success("User role updated successfully")
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
  }

  const updateUserLimit = async (userId: string, limit: number, customLimit: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          user_agent_limit: limit,
          custom_limit: customLimit,
        })
        .eq("id", userId)

      if (error) throw error

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, user_agent_limit: limit, custom_limit: customLimit } : user,
        ),
      )

      toast.success("User limit updated successfully")
    } catch (error) {
      console.error("Error updating user limit:", error)
      toast.error("Failed to update user limit")
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", userId)

      if (error) throw error

      setUsers(users.filter((user) => user.id !== userId))
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const getStatusBadge = (user: User) => {
    if (!user.email_verified) {
      return <Badge variant="destructive">Unverified</Badge>
    }
    if (!user.is_approved) {
      return (
        <Badge variant="secondary" className="admin-status-pending">
          Pending
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="admin-status-approved">
        Approved
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "admin" ? "default" : "outline"}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-2">Manage user accounts, permissions, and access levels</p>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
          <CardDescription className="text-gray-400">View and manage all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="text-sm text-gray-400">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>

          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Limit</TableHead>
                  <TableHead className="text-gray-300">Subscription</TableHead>
                  <TableHead className="text-gray-300">Last Login</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{user.email.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.display_name || user.email}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="text-white">{user.custom_limit ? "Custom" : user.user_agent_limit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">{user.subscription_type}</div>
                        {user.subscription_end_date && (
                          <div className="text-xs text-gray-400">
                            Until {new Date(user.subscription_end_date).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                            <DropdownMenuLabel className="text-white">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-700" />

                            {!user.is_approved ? (
                              <DropdownMenuItem
                                onClick={() => updateUserStatus(user.id, true)}
                                className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Approve User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateUserStatus(user.id, false)}
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-700"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Revoke Access
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => updateUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                              className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {user.role === "admin" ? "Make User" : "Make Admin"}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                const newLimit = prompt(
                                  `Enter new limit for ${user.email}:`,
                                  user.user_agent_limit.toString(),
                                )
                                if (newLimit && !isNaN(Number(newLimit))) {
                                  updateUserLimit(user.id, Number(newLimit), true)
                                }
                              }}
                              className="text-purple-400 hover:text-purple-300 hover:bg-gray-700"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Set Custom Limit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuItem
                              onClick={() => deleteUser(user.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
