// Auto-update utility for detecting and applying updates without hard refresh
export class AutoUpdater {
  private static instance: AutoUpdater
  private updateCheckInterval: NodeJS.Timeout | null = null
  private lastUpdateCheck = 0
  private readonly CHECK_INTERVAL = 300000 // 5 minutes instead of 30 seconds
  private onUpdateAvailable?: () => void
  private lastUpdateTime = 0
  private readonly UPDATE_COOLDOWN = 60000 // 1 minute cooldown between updates

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

    const now = Date.now()
    if (now - this.lastUpdateTime < this.UPDATE_COOLDOWN) {
      console.log("[v0] Update monitoring skipped due to cooldown")
      return
    }

    // Check for updates immediately
    this.checkForUpdates()

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
    }

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
      setTimeout(() => {
        this.checkForUpdates()
      }, 2000)
    })
  }

  private async checkForUpdates() {
    try {
      this.lastUpdateCheck = Date.now()

      if (Date.now() - this.lastUpdateTime < this.UPDATE_COOLDOWN) {
        return
      }

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
          this.showUpdateNotification()
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
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
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

  async applyUpdate() {
    try {
      this.lastUpdateTime = Date.now()

      // Update service worker
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }
      }

      const response = await fetch("/api/version", { cache: "no-cache" })
      if (response.ok) {
        const { version } = await response.json()
        localStorage.setItem("app-version", version)
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
