"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Settings, AlertTriangle } from "lucide-react"

export function FirebaseConfigNotice() {
  const isProduction = process.env.NODE_ENV === "production"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-orange-500" />
            <CardTitle>Firebase Configuration Required</CardTitle>
          </div>
          <CardDescription>
            Firebase authentication is not configured. Please add the required environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProduction && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <strong>Production Deployment Issue:</strong> Firebase environment variables are missing in your Vercel
                deployment. You need to add them in your Vercel project settings and redeploy.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              To enable Firebase authentication, you need to add the following environment variables to your{" "}
              {isProduction ? "Vercel project" : "development environment"}:
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Required Environment Variables:</h3>
            <ul className="space-y-1 text-sm font-mono">
              <li>• NEXT_PUBLIC_FIREBASE_API_KEY</li>
              <li>• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
              <li>• NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
              <li>• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
              <li>• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>• NEXT_PUBLIC_FIREBASE_APP_ID</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">
              {isProduction ? "How to fix in Vercel deployment:" : "How to add environment variables:"}
            </h3>
            {isProduction ? (
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Go to your <strong>Vercel project dashboard</strong>
                </li>
                <li>
                  Navigate to <strong>Settings → Environment Variables</strong>
                </li>
                <li>Add each Firebase environment variable with their values</li>
                <li>
                  <strong>Redeploy your application</strong> (important step!)
                </li>
                <li>Wait for the new deployment to complete</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Create a <code>.env.local</code> file in your project root
                </li>
                <li>Add each Firebase environment variable</li>
                <li>Restart your development server</li>
                <li>For production, add them to Vercel project settings</li>
              </ol>
            )}
          </div>

          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <span>Get your Firebase config from the</span>
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
              >
                Firebase Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {isProduction && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Quick Fix:</strong> Go directly to your{" "}
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Vercel Dashboard
                </a>{" "}
                → Select your project → Settings → Environment Variables
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
