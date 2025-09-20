"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  Bell,
  Shield,
  Database,
  Activity,
  FileText,
} from "lucide-react"

const sidebarItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Pending Approvals",
    href: "/admin/approvals",
    icon: UserCheck,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Activity Logs",
    href: "/admin/activity",
    icon: Activity,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "System Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Database",
    href: "/admin/database",
    icon: Database,
  },
  {
    title: "Security",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="admin-sidebar w-64 flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">UA</span>
          </div>
          <div>
            <h2 className="font-semibold text-white">UAGen Pro</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={cn("admin-sidebar-item", isActive && "active")}>
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
