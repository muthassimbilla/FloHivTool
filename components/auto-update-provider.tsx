"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { autoUpdater } from "@/lib/auto-updater"
import UpdateNotification from "./update-notification"

export default function AutoUpdateProvider({ children }: { children: React.ReactNode }) {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)

  useEffect(() => {
    // Service worker functionality is not compatible with Next.js preview environment

    autoUpdater.setUpdateCallback(() => {
      setShowUpdateNotification(true)
    })

    const startTimer = setTimeout(() => {
      autoUpdater.startUpdateMonitoring()
    }, 5000) // Wait 5 seconds after page load

    // Cleanup on unmount
    return () => {
      clearTimeout(startTimer)
      autoUpdater.stopUpdateMonitoring()
    }
  }, [])

  const handleUpdate = () => {
    setShowUpdateNotification(false)
    autoUpdater.applyUpdate()
  }

  const handleDismiss = () => {
    setShowUpdateNotification(false)
  }

  return (
    <>
      {children}
      {showUpdateNotification && <UpdateNotification onUpdate={handleUpdate} onDismiss={handleDismiss} />}
    </>
  )
}
