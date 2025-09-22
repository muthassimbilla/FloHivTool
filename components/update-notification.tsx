"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Download, RefreshCw } from "lucide-react"

interface UpdateNotificationProps {
  onUpdate: () => void
  onDismiss: () => void
}

export default function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Small delay for UX
    onUpdate()
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for animation
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">নতুন আপডেট পাওয়া গেছে!</h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              আপনার অ্যাপটি আপডেট করুন নতুন ফিচার এবং উন্নতির জন্য।
            </p>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  "এখনই আপডেট করুন"
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 text-xs h-7"
              >
                পরে করব
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 p-0 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
