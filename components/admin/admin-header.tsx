"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Settings, LogOut, User } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"

export function AdminHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="admin-header h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users, logs, settings..."
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-700 text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-white">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin</p>
                <p className="text-xs leading-none text-gray-400">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
