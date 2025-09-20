"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Settings } from "lucide-react"

export function FirebaseConfigNotice() {
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
          <Alert>
            <AlertDescription>
              To enable Firebase authentication, you need to add the following environment variables to your Vercel
              project:
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
            <h3 className="font-semibold">How to add environment variables:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Go to your Vercel project dashboard</li>
              <li>Navigate to Settings → Environment Variables</li>
              <li>Add each Firebase environment variable</li>
              <li>Redeploy your application</li>
            </ol>
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
        </CardContent>
      </Card>
    </div>
  )
}
