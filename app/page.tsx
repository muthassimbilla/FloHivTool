"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

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
        console.log("[v0] Approved user, redirecting to dashboard")
        router.replace("/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-white">{loading ? "Loading..." : "Redirecting..."}</p>
          </CardContent>
        </Card>
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
