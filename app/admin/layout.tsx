"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (!user.isApproved) {
        router.push("/pending-approval")
        return
      }

      if (user.role !== "admin") {
        router.push("/dashboard")
        return
      }

      setIsAuthorized(true)
    }
  }, [user, loading, router])

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center admin-theme bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="admin-theme bg-background text-foreground min-h-screen">
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
