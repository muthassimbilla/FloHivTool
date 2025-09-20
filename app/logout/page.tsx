"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout()
        router.push("/login")
      } catch (error) {
        console.error("Logout error:", error)
        router.push("/login")
      }
    }

    handleLogout()
  }, [logout, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Logging out...</p>
        </CardContent>
      </Card>
    </div>
  )
}
