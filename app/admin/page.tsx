"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Users, UserCheck, Clock, Activity, TrendingUp, AlertTriangle } from "lucide-react"

interface User {
  is_approved: boolean
  created_at: string
}

interface Session {
  login_time: string
}

interface DashboardStats {
  totalUsers: number
  pendingApprovals: number
  approvedUsers: number
  totalGenerations: number
  activeToday: number
  systemAlerts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    approvedUsers: 0,
    totalGenerations: 0,
    activeToday: 0,
    systemAlerts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch user statistics
      const { data: users } = await supabase.from("users").select("is_approved, created_at")
      const { data: generations } = await supabase.from("user_generations").select("created_at")
      const { data: sessions } = await supabase.from("user_sessions").select("login_time")

      const totalUsers = users?.length || 0
      const pendingApprovals = users?.filter((u: User) => !u.is_approved).length || 0
      const approvedUsers = users?.filter((u: User) => u.is_approved).length || 0
      const totalGenerations = generations?.length || 0

      // Calculate active today
      const today = new Date().toISOString().split("T")[0]
      const activeToday = sessions?.filter((s: Session) => s.login_time && s.login_time.startsWith(today)).length || 0

      setStats({
        totalUsers,
        pendingApprovals,
        approvedUsers,
        totalGenerations,
        activeToday,
        systemAlerts: 2, // Mock data
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      description: "Awaiting approval",
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Approved Users",
      value: stats.approvedUsers,
      description: "Active users",
      icon: UserCheck,
      color: "text-green-400",
    },
    {
      title: "Total Generations",
      value: stats.totalGenerations,
      description: "User agent generations",
      icon: Activity,
      color: "text-purple-400",
    },
    {
      title: "Active Today",
      value: stats.activeToday,
      description: "Users logged in today",
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      title: "System Alerts",
      value: stats.systemAlerts,
      description: "Requires attention",
      icon: AlertTriangle,
      color: "text-red-400",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-2">Overview of your UAGen Pro system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Card key={card.title} className="admin-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{loading ? "..." : card.value.toLocaleString()}</div>
              <p className="text-xs text-gray-400">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-gray-400">Latest system events and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">New user registration</p>
                  <p className="text-xs text-gray-400">user@example.com - 2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">User agent generated</p>
                  <p className="text-xs text-gray-400">iOS platform - 5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-white">User approved</p>
                  <p className="text-xs text-gray-400">admin@example.com - 10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white">System Status</CardTitle>
            <CardDescription className="text-gray-400">Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Database</span>
                <span className="text-sm text-green-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Authentication</span>
                <span className="text-sm text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API Response</span>
                <span className="text-sm text-green-400">Fast (120ms)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Storage</span>
                <span className="text-sm text-yellow-400">85% Used</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
