"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Code, Settings, Smartphone, Menu, X, Clock, Home } from "lucide-react"
import ThemeToggle from "./theme-toggle"

const navItems = [
  { name: "Home", href: "/tool", icon: Home, status: "Active" },
  { name: "User Agent Generator", href: "/tool/user-agent-generator", icon: Smartphone, status: "Active" },
  { name: "Duplicate Checker", href: "/tool/api-tester", icon: Code, status: "Coming Soon" },
  { name: "Address Generator", href: "/tool/config-generator", icon: Settings, status: "Coming Soon" },
]

export default function SidebarNavigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const isActive = (href: string, name: string) => {
    if (name === "Home") {
      return pathname === "/tool"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/50 dark:border-slate-700/50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Flo Hiv Tool
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 mb-4">
                Navigation
              </div>
              {navItems.map((item) => {
                const IconComponent = item.icon
                const itemIsActive = isActive(item.href, item.name)
                const isAvailable = item.status === "Active"
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group ${
                      itemIsActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : isAvailable
                          ? "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${
                        itemIsActive
                          ? "text-white"
                          : isAvailable
                            ? "text-slate-500 dark:text-slate-400 group-hover:text-blue-500"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="text-sm">{item.name}</div>
                      {!isAvailable && <div className="text-xs text-slate-400 dark:text-slate-500">Coming Soon</div>}
                    </div>
                    {itemIsActive && <div className="w-2 h-2 rounded-full bg-white/60"></div>}
                    {!isAvailable && <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
                  </a>
                )
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-6 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
              <ThemeToggle />
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">Flo Hiv Tool © 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        ) : (
          <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
      )}
    </>
  )
}
