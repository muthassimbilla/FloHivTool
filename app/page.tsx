"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Shield, Users, BarChart3, Bell, CreditCard } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] HomePage useEffect - user:", user, "loading:", loading)

    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        console.log("[v0] No user, redirecting to login")
        router.replace("/login")
      } else if (!user.isApproved) {
        // User pending approval
        console.log("[v0] User not approved, redirecting to pending approval")
        router.replace("/pending-approval")
      } else if (user.role === "admin") {
        // Admin user, redirect to admin panel
        console.log("[v0] Admin user, redirecting to admin")
        router.replace("/admin")
      } else if (user.isApproved) {
        // Regular approved user, show user dashboard
        console.log("[v0] Approved user, staying on dashboard")
        // For now, we'll show a simple dashboard here
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user && user.isApproved && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">User Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push("/pricing")}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pricing
                </Button>
                <span className="text-blue-200">Welcome, {user.displayName || user.email}</span>
                <Button
                  onClick={() => router.push("/logout")}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-100">
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {user.displayName || "Not provided"}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className="text-green-400">Approved</span>
                  </p>
                  <p>
                    <strong>Daily Limit:</strong> {user.userAgentLimit || 100}
                  </p>
                  <p>
                    <strong>Monthly Limit:</strong> {user.customLimit ? "Unlimited" : "1000"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-blue-100">
                <div className="space-y-2">
                  <p>
                    <strong>Today:</strong> 0 / {user.userAgentLimit || 100}
                  </p>
                  <p>
                    <strong>This Month:</strong> 0 / {user.customLimit ? "Unlimited" : "1000"}
                  </p>
                  <p>
                    <strong>Total Generated:</strong> 0
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // TODO: Navigate to user agent generator
                      alert("User Agent Generator coming soon!")
                    }}
                  >
                    Generate User Agents
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => {
                      // TODO: Navigate to history
                      alert("Generation History coming soon!")
                    }}
                  >
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={() => router.push("/pricing")}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Pricing Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-blue-100 text-center py-8">
                <p>No recent activity to display.</p>
                <p className="text-sm text-blue-300 mt-2">Start generating user agents to see your activity here.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  )
}
