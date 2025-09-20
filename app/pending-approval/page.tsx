"use client"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Mail, LogOut } from "lucide-react"
import Link from "next/link"

export default function PendingApprovalPage() {
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Please log in to continue.</p>
            <Button asChild className="w-full mt-4">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Account Pending Approval</CardTitle>
          <CardDescription className="text-center">Your account is waiting for admin approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Thank you for registering! Your account (<strong>{user.email}</strong>) is currently pending approval from
              our administrators.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>What happens next:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Our team will review your account</li>
              <li>You'll receive an email notification once approved</li>
              <li>After approval, you'll have full access to UAGen Pro</li>
            </ul>
          </div>

          {!user.emailVerified && (
            <Alert variant="destructive">
              <AlertDescription>
                Please verify your email address to complete the registration process.
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <Button asChild variant="outline" className="w-full mb-2 bg-transparent">
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
            <Button onClick={logout} variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
