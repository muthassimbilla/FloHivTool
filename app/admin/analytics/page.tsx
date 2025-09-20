"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Clock,
  Smartphone,
  Globe,
} from "lucide-react"

interface AnalyticsData {
  userGrowth: { date: string; count: number }[]
  generationStats: { platform: string; count: number }[]
  dailyActivity: { date: string; logins: number; generations: number }[]
  topUsers: { email: string; generations: number }[]
  systemMetrics: {
    totalUsers: number
    activeUsers: number
    totalGenerations: number
    avgGenerationsPerUser: number
  }
}

interface User {
  created_at: string
  email: string
  last_login: string | null
}

interface Generation {
  created_at: string
  platform: string
  firebase_uid: string
}

interface Session {
  login_time: string
  firebase_uid: string
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    generationStats: [],
    dailyActivity: [],
    topUsers: [],
    systemMetrics: {
      totalUsers: 0,
      activeUsers: 0,
      totalGenerations: 0,
      avgGenerationsPerUser: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()

      switch (timeRange) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24)
          break
        case "7d":
          startDate.setDate(startDate.getDate() - 7)
          break
        case "30d":
          startDate.setDate(startDate.getDate() - 30)
          break
        case "90d":
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      // Fetch users data
      const { data: users } = await supabase
        .from("users")
        .select("created_at, email, last_login")
        .gte("created_at", startDate.toISOString())

      // Fetch generations data
      const { data: generations } = await supabase
        .from("user_generations")
        .select("created_at, platform, firebase_uid")
        .gte("created_at", startDate.toISOString())

      // Fetch sessions data
      const { data: sessions } = await supabase
        .from("user_sessions")
        .select("login_time, firebase_uid")
        .gte("login_time", startDate.toISOString())

      // Process user growth data
      const userGrowthMap = new Map<string, number>()
      users?.forEach((user: User) => {
        const date = new Date(user.created_at).toISOString().split("T")[0]
        userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1)
      })

      const userGrowth = Array.from(userGrowthMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Process generation stats by platform
      const platformMap = new Map<string, number>()
      generations?.forEach((gen: Generation) => {
        platformMap.set(gen.platform, (platformMap.get(gen.platform) || 0) + 1)
      })

      const generationStats = Array.from(platformMap.entries())
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => b.count - a.count)

      // Process daily activity
      const activityMap = new Map<string, { logins: number; generations: number }>()

      sessions?.forEach((session: Session) => {
        const date = new Date(session.login_time).toISOString().split("T")[0]
        const current = activityMap.get(date) || { logins: 0, generations: 0 }
        activityMap.set(date, { ...current, logins: current.logins + 1 })
      })

      generations?.forEach((gen: Generation) => {
        const date = new Date(gen.created_at).toISOString().split("T")[0]
        const current = activityMap.get(date) || { logins: 0, generations: 0 }
        activityMap.set(date, { ...current, generations: current.generations + 1 })
      })

      const dailyActivity = Array.from(activityMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Process top users
      const userGenMap = new Map<string, number>()
      generations?.forEach((gen: Generation) => {
        userGenMap.set(gen.firebase_uid, (userGenMap.get(gen.firebase_uid) || 0) + 1)
      })

      // Get user emails for top generators
      const topUserIds = Array.from(userGenMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([uid]) => uid)

      const { data: topUserData } = await supabase
        .from("users")
        .select("firebase_uid, email")
        .in("firebase_uid", topUserIds)

      const topUsers =
        topUserData
          ?.map((user) => ({
            email: user.email,
            generations: userGenMap.get(user.firebase_uid) || 0,
          }))
          .sort((a, b) => b.generations - a.generations) || []

      // Calculate system metrics
      const { data: allUsers } = await supabase.from("users").select("last_login")
      const { data: allGenerations } = await supabase.from("user_generations").select("id")

      const totalUsers = allUsers?.length || 0
      const activeUsers =
        allUsers?.filter((u) => {
          if (!u.last_login) return false
          const lastLogin = new Date(u.last_login)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return lastLogin > thirtyDaysAgo
        }).length || 0

      const totalGenerations = allGenerations?.length || 0
      const avgGenerationsPerUser = totalUsers > 0 ? Math.round(totalGenerations / totalUsers) : 0

      setAnalytics({
        userGrowth,
        generationStats,
        dailyActivity,
        topUsers,
        systemMetrics: {
          totalUsers,
          activeUsers,
          totalGenerations,
          avgGenerationsPerUser,
        },
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    const data = {
      timeRange,
      generatedAt: new Date().toISOString(),
      ...analytics,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-gray-400 mt-2">Monitor system performance and user behavior</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : analytics.systemMetrics.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : analytics.systemMetrics.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Generations</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : analytics.systemMetrics.totalGenerations.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">User agents created</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Avg per User</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : analytics.systemMetrics.avgGenerationsPerUser}
            </div>
            <p className="text-xs text-gray-400">Generations per user</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              User Growth
            </CardTitle>
            <CardDescription className="text-gray-400">New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading chart data...</div>
              ) : analytics.userGrowth.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No data available</div>
              ) : (
                <div className="space-y-2">
                  {analytics.userGrowth.slice(-7).map((item, index) => (
                    <div key={item.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{new Date(item.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="bg-blue-500 h-2 rounded"
                          style={{ width: `${Math.max(item.count * 20, 10)}px` }}
                        />
                        <span className="text-sm text-white w-8 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Platform Distribution
            </CardTitle>
            <CardDescription className="text-gray-400">User agent generations by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading platform data...</div>
              ) : analytics.generationStats.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No data available</div>
              ) : (
                <div className="space-y-3">
                  {analytics.generationStats.map((item, index) => {
                    const total = analytics.generationStats.reduce((sum, stat) => sum + stat.count, 0)
                    const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0

                    return (
                      <div key={item.platform} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.platform}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-sm text-white w-12 text-right">{item.count}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Daily Activity
            </CardTitle>
            <CardDescription className="text-gray-400">Logins and generations per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading activity data...</div>
              ) : analytics.dailyActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No activity data</div>
              ) : (
                <div className="space-y-3">
                  {analytics.dailyActivity.slice(-7).map((item) => (
                    <div key={item.date} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{new Date(item.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-green-400">{item.logins} logins</span>
                          <span className="text-blue-400">{item.generations} gens</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="bg-green-500 h-1 rounded"
                          style={{ width: `${Math.max(item.logins * 5, 2)}px` }}
                        />
                        <div
                          className="bg-blue-500 h-1 rounded"
                          style={{ width: `${Math.max(item.generations * 2, 2)}px` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top Users
            </CardTitle>
            <CardDescription className="text-gray-400">Most active users by generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading user data...</div>
              ) : analytics.topUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No user data</div>
              ) : (
                <div className="space-y-3">
                  {analytics.topUsers.slice(0, 8).map((user, index) => (
                    <div key={user.email} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-300 truncate max-w-40">{user.email}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.generations} gens
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
