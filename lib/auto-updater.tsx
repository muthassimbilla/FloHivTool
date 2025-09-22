// Auto-update utility for detecting and applying updates without hard refresh
export class AutoUpdater {
  private static instance: AutoUpdater
  private updateCheckInterval: NodeJS.Timeout | null = null
  private lastUpdateCheck = 0
  private readonly CHECK_INTERVAL = 30000 // 30 seconds
  private onUpdateAvailable?: () => void

  private constructor() {}

  static getInstance(): AutoUpdater {
    if (!AutoUpdater.instance) {
      AutoUpdater.instance = new AutoUpdater()
    }
    return AutoUpdater.instance
  }

  setUpdateCallback(callback: () => void) {
    this.onUpdateAvailable = callback
  }

  // Start monitoring for updates
  startUpdateMonitoring() {
    if (typeof window === "undefined") return

    // Check for updates immediately
    this.checkForUpdates()

    // Set up periodic checks
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates()
    }, this.CHECK_INTERVAL)

    // Listen for visibility change to check when user returns
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && Date.now() - this.lastUpdateCheck > this.CHECK_INTERVAL) {
        this.checkForUpdates()
      }
    })

    window.addEventListener("online", () => {
      this.checkForUpdates()
    })
  }

  private async checkForUpdates() {
    try {
      this.lastUpdateCheck = Date.now()

      // Check if service worker has updates
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()

          // Check if there's a waiting service worker
          if (registration.waiting) {
            this.showUpdateNotification()
          }
        }
      }

      // Check for new version via API
      const response = await fetch("/api/version", {
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const { version, buildTime } = await response.json()
        const currentVersion = localStorage.getItem("app-version")

        if (currentVersion && currentVersion !== version) {
          this.applyUpdate()
        } else {
          localStorage.setItem("app-version", version)
        }
      }
    } catch (error) {
      console.log("[v0] Update check failed:", error)
    }
  }

  // Show update notification to user
  private showUpdateNotification() {
    if (this.onUpdateAvailable) {
      this.onUpdateAvailable()
      return
    }

    // Create a subtle notification
    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300"
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>নতুন আপডেট পাওয়া গেছে!</span>
        <button onclick="this.parentElement.parentElement.remove(); window.location.reload();" class="ml-2 text-xs underline">
          আপডেট করুন
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  private async applyUpdate() {
    try {
      // Update service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }
      }

      // Soft reload - reload current page content
      if (window.location.pathname !== "/") {
        // For non-home pages, use Next.js router for smooth transition
        const { Router } = await import("next/router")
        if (Router.router) {
          Router.router.reload()
        } else {
          window.location.reload()
        }
      } else {
        // For home page, just reload
        window.location.reload()
      }
    } catch (error) {
      console.log("[v0] Auto update failed:", error)
      // Fallback to hard refresh
      window.location.reload()
    }
  }

  // Stop monitoring
  stopUpdateMonitoring() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
      this.updateCheckInterval = null
    }
  }
}

// Export singleton instance
export const autoUpdater = AutoUpdater.getInstance()
