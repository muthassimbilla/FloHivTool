"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Search, Activity, RefreshCw, Filter, Download, Eye } from "lucide-react"

interface ActivityLog {
  id: string
  action_type: string
  target_user_id: string | null
  action_details: any
  created_at: string
  admin_email: string
  target_email: string | null
}

interface AdminAction {
  id: string
  action_type: string
  target_user_id: string | null
  action_details: any
  created_at: string
  admin_id: string
  admin?: { email: string }
  target_user?: { email: string }
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.target_email && log.target_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.action_type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action_type === actionFilter)
    }

    setFilteredLogs(filtered)
  }, [logs, searchTerm, actionFilter])

  const fetchActivityLogs = async () => {
    try {
      // Fetch admin actions with user details
      const { data: adminActions, error } = await supabase
        .from("admin_actions")
        .select(`
          *,
          admin:admin_id(email),
          target_user:target_user_id(email)
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error

      const formattedLogs: ActivityLog[] =
        adminActions?.map((action: AdminAction) => ({
          id: action.id,
          action_type: action.action_type,
          target_user_id: action.target_user_id,
          action_details: action.action_details,
          created_at: action.created_at,
          admin_email: action.admin?.email || "Unknown Admin",
          target_email: action.target_user?.email || null,
        })) || []

      setLogs(formattedLogs)
    } catch (error) {
      console.error("Error fetching activity logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (actionType: string) => {
    const badgeConfig = {
      approve_user: { variant: "default", color: "admin-status-approved", label: "User Approved" },
      reject_user: { variant: "destructive", color: "admin-status-rejected", label: "User Rejected" },
      update_user: { variant: "secondary", color: "admin-status-pending", label: "User Updated" },
      delete_user: { variant: "destructive", color: "admin-status-rejected", label: "User Deleted" },
      create_role: { variant: "outline", color: "", label: "Role Created" },
      update_role: { variant: "outline", color: "", label: "Role Updated" },
    }

    const config = badgeConfig[actionType as keyof typeof badgeConfig] || {
      variant: "outline",
      color: "",
      label: actionType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }

    return (
      <Badge variant={config.variant as any} className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const exportLogs = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      filters: { searchTerm, actionFilter },
      logs: filteredLogs,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const actionTypes = Array.from(new Set(logs.map((log) => log.action_type)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-gray-400 mt-2">Monitor admin actions and system events</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={fetchActivityLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Activity
          </CardTitle>
          <CardDescription className="text-gray-400">Recent admin actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-400">
              {filteredLogs.length} of {logs.length} logs
            </div>
          </div>

          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Timestamp</TableHead>
                  <TableHead className="text-gray-300">Action</TableHead>
                  <TableHead className="text-gray-300">Admin</TableHead>
                  <TableHead className="text-gray-300">Target User</TableHead>
                  <TableHead className="text-gray-300">Details</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      Loading activity logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No activity logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-gray-700">
                      <TableCell>
                        <div className="text-white text-sm">{new Date(log.created_at).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString()}</div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action_type)}</TableCell>
                      <TableCell>
                        <div className="text-white text-sm">{log.admin_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white text-sm">{log.target_email || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300 text-sm max-w-xs truncate">
                          {log.action_details
                            ? JSON.stringify(log.action_details).substring(0, 50) + "..."
                            : "No details"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            alert(JSON.stringify(log.action_details, null, 2))
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
