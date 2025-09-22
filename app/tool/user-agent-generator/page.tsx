"use client"

import { useCallback } from "react"

import { useState, useEffect, memo, startTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Copy, Download, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import type { GenerationHistory } from "@/lib/supabase" // Declared the variable here

import GeneratorControls from "@/components/GeneratorControls"

const CustomModal = dynamic(() => import("@/components/CustomModal"), {
  loading: () => null,
  ssr: false,
})

const ProgressModal = dynamic(() => import("@/components/ProgressModal"), {
  loading: () => null,
  ssr: false,
})

const LoadingSkeleton = memo(() => (
  <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-2xl rounded-2xl">
    <CardContent className="p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4 relative z-10" />
      </div>
      <p className="text-slate-600 dark:text-slate-300 font-medium">Loading data...</p>
    </CardContent>
  </Card>
))

LoadingSkeleton.displayName = "LoadingSkeleton"

let supabaseModulesCache = null
const loadSupabaseModules = async () => {
  if (supabaseModulesCache) return supabaseModulesCache

  try {
    const module = await import("@/lib/supabase")
    supabaseModulesCache = {
      DeviceModel: module.DeviceModel,
      IOSVersion: module.IOSVersion,
      AppVersion: module.AppVersion,
      Configuration: module.Configuration,
      GenerationHistory: module.GenerationHistory,
      BlacklistedUserAgent: module.BlacklistedUserAgent,
      AndroidDeviceModel: module.AndroidDeviceModel,
      AndroidBuildNumber: module.AndroidBuildNumber,
      AndroidAppVersion: module.AndroidAppVersion,
      InstagramDeviceModel: module.InstagramDeviceModel,
      InstagramVersion: module.InstagramVersion,
      ChromeVersion: module.ChromeVersion,
      ResolutionDpi: module.ResolutionDpi,
      PixelFacebookDeviceModel: module.PixelFacebookDeviceModel,
      PixelFacebookBuildNumber: module.PixelFacebookBuildNumber,
      PixelFacebookAppVersion: module.PixelFacebookAppVersion,
      PixelInstagramDeviceModel: module.PixelInstagramDeviceModel,
      PixelInstagramVersion: module.InstagramVersion,
      PixelInstagramChromeVersion: module.ChromeVersion,
      PixelInstagramResolutionDpi: module.ResolutionDpi,
      SamsungInstagramBuildNumber: module.InstagramBuildNumber,
      UserAgentHistory: module.GenerationHistory, // Using GenerationHistory as UserAgentHistory
      FacebookBuildNumber: module.FacebookBuildNumber, // Added for Samsung Facebook
      InstagramBuildNumber: module.InstagramBuildNumber, // Added for Samsung Instagram
    }
    return supabaseModulesCache
  } catch (error) {
    console.error("Error loading Supabase modules:", error)
    return null
  }
}

const AppHeader = memo(() => (
  <div className="text-center space-y-4 mb-8">
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
        <Smartphone className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        User Agent Generator
      </h1>
    </div>
    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
      Generate unique, realistic user agents for iOS, Android, Instagram, and Facebook applications
    </p>
  </div>
))

AppHeader.displayName = "AppHeader"

export default function UserAgentGenerator() {
  const [platform, setPlatform] = useState("")
  const [appType, setAppType] = useState("")
  // Changed default quantity to 1
  const [quantity, setQuantity] = useState(1)
  // Added type annotation for userAgents
  const [userAgents, setUserAgents] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  // Added type annotation for history
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<"generator">("generator")
  const [connectionError, setConnectionError] = useState(null)
  const [accessKey, setAccessKey] = useState(null) // Added accessKey state

  const [supabaseModules, setSupabaseModules] = useState(null)

  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Modal states
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
    showCancel: false,
  })

  // Progress Modal state
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    progress: 0,
    type: "info",
    showCancel: false,
  })

  const [dataState, setDataState] = useState({
    deviceModels: [],
    iosVersions: [],
    appVersions: [],
    configurations: {},
    blacklistedUAs: new Set(),
    androidDeviceModels: [],
    androidBuildNumbers: [],
    androidAppVersions: [],
    instagramDeviceModels: [],
    instagramVersions: [],
    chromeVersions: [],
    resolutionDpis: [],
  })

  const [allCopied, setAllCopied] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)

  const [pixelFacebookDeviceModels, setPixelFacebookDeviceModels] = useState([])
  const [pixelFacebookBuildNumbers, setPixelFacebookBuildNumbers] = useState([])
  const [pixelFacebookAppVersions, setPixelFacebookAppVersions] = useState([])
  const [pixelInstagramDeviceModels, setPixelInstagramDeviceModels] = useState([])
  const [pixelInstagramVersions, setPixelInstagramVersions] = useState([])
  const [pixelInstagramChromeVersions, setPixelInstagramChromeVersions] = useState([])
  const [pixelInstagramResolutionDpis, setPixelInstagramResolutionDpis] = useState([])

  // Added deviceType state for Samsung Facebook generation
  const [deviceType, setDeviceType] = useState("")

  const {
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
  } = dataState

  useEffect(() => {
    let mounted = true

    const initializeSupabase = async () => {
      try {
        const modules = await loadSupabaseModules()
        if (mounted) {
          setSupabaseModules(modules)
          setConnectionError(null)
        }
      } catch (error) {
        if (mounted) {
          setConnectionError(error.message)
          console.error("Failed to initialize Supabase:", error)
        }
      }
    }

    startTransition(() => {
      initializeSupabase()
    })

    return () => {
      mounted = false
    }
  }, [])

  const showModal = useCallback((title, message, type = "info", onConfirm = () => {}, showCancel = false) => {
    setModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      showCancel,
    })
  }, [])

  const showProgressModal = useCallback((title, message, progress = 0, type = "info", showCancel = false) => {
    setProgressModal({
      isOpen: true,
      title,
      message,
      progress,
      type,
      showCancel,
    })
  }, [])

  const hideProgressModal = useCallback(() => {
    setProgressModal((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const loadData = useCallback(async () => {
    if (!supabaseModules || isDataLoaded) return

    try {
      setConnectionError(null)
      console.log("[v0] Starting data loading...")

      const {
        DeviceModel,
        IOSVersion,
        AppVersion,
        Configuration,
        BlacklistedUserAgent,
        AndroidDeviceModel,
        AndroidBuildNumber,
        AndroidAppVersion,
        InstagramDeviceModel,
        InstagramVersion,
        ChromeVersion,
        ResolutionDpi,
        PixelFacebookDeviceModel,
        PixelFacebookBuildNumber,
        PixelFacebookAppVersion,
        PixelInstagramDeviceModel,
        PixelInstagramVersion,
        PixelInstagramChromeVersion,
        PixelInstagramResolutionDpi,
      } = supabaseModules

      const loadBatch1 = Promise.all([
        DeviceModel?.list() || Promise.resolve([]),
        IOSVersion?.list() || Promise.resolve([]),
        AppVersion?.list() || Promise.resolve([]),
        Configuration?.list() || Promise.resolve([]),
      ])

      const loadBatch2 = Promise.all([
        BlacklistedUserAgent?.list() || Promise.resolve([]),
        AndroidDeviceModel?.list() || Promise.resolve([]),
        AndroidBuildNumber?.list() || Promise.resolve([]),
        AndroidAppVersion?.list() || Promise.resolve([]),
      ])

      const loadBatch3 = Promise.all([
        InstagramDeviceModel?.list() || Promise.resolve([]),
        InstagramVersion?.list() || Promise.resolve([]),
        ChromeVersion?.list() || Promise.resolve([]),
        ResolutionDpi?.list() || Promise.resolve([]),
      ])

      const loadBatch4 = Promise.all([
        PixelFacebookDeviceModel?.list() || Promise.resolve([]),
        PixelFacebookBuildNumber?.list() || Promise.resolve([]),
        PixelFacebookAppVersion?.list() || Promise.resolve([]),
        PixelInstagramDeviceModel?.list() || Promise.resolve([]),
        PixelInstagramVersion?.list() || Promise.resolve([]),
        PixelInstagramChromeVersion?.list() || Promise.resolve([]),
        PixelInstagramResolutionDpi?.list() || Promise.resolve([]),
      ])

      const [batch1, batch2, batch3, batch4] = await Promise.all([loadBatch1, loadBatch2, loadBatch3, loadBatch4])

      const [devices, ios, apps, configs] = batch1
      const [blacklisted, androidDevices, androidBuilds, androidApps] = batch2
      const [instaDevices, instaVersions, chromeVersions, resolutionDpis] = batch3
      const [
        pixelFbDevices,
        pixelFbBuilds,
        pixelFbApps,
        pixelInstaDevices,
        pixelInstaVersions,
        pixelInstaChromes,
        pixelInstaResolutions,
      ] = batch4

      console.log("[v0] Pixel Facebook devices loaded:", pixelFbDevices?.length || 0)
      console.log("[v0] Pixel Facebook builds loaded:", pixelFbBuilds?.length || 0)
      console.log("[v0] Pixel Facebook apps loaded:", pixelFbApps?.length || 0)
      console.log("[v0] Pixel Instagram devices loaded:", pixelInstaDevices?.length || 0)
      console.log("[v0] Pixel Instagram versions loaded:", pixelInstaVersions?.length || 0)
      console.log("[v0] Pixel Instagram chrome versions loaded:", pixelInstaChromes?.length || 0)
      console.log("[v0] Pixel Instagram resolutions loaded:", pixelInstaResolutions?.length || 0)
      console.log("[v0] Samsung Instagram devices loaded:", instaDevices?.length || 0)
      console.log("[v0] Samsung Instagram versions loaded:", instaVersions?.length || 0)
      console.log("[v0] Samsung Chrome versions loaded:", chromeVersions?.length || 0)
      console.log("[v0] Samsung Resolution DPIs loaded:", resolutionDpis?.length || 0)

      startTransition(() => {
        const configsObj = {}
        configs.forEach((config) => {
          try {
            configsObj[config.config_key] = JSON.parse(config.config_value)
          } catch (e) {
            configsObj[config.config_key] = config.config_value
          }
        })

        const blacklistSet = new Set(blacklisted.map((b) => b.user_agent))

        setDataState({
          deviceModels: devices.filter((d) => d.is_active),
          iosVersions: ios.filter((v) => v.is_active),
          appVersions: apps.filter((a) => a.is_active),
          androidDeviceModels: androidDevices.filter((d) => d.is_active),
          androidBuildNumbers: androidBuilds.filter((b) => b.is_active),
          androidAppVersions: androidApps.filter((a) => a.is_active),
          instagramDeviceModels: instaDevices.filter((d) => d.is_active),
          instagramVersions: instaVersions.filter((v) => v.is_active),
          chromeVersions: chromeVersions.filter((v) => v.is_active),
          resolutionDpis: resolutionDpis.filter((r) => r.is_active),
          configurations: configsObj,
          blacklistedUAs: blacklistSet,
        })
      })

      console.log("[v0] Setting Pixel Facebook device models:", pixelFbDevices?.length || 0)
      console.log("[v0] Setting Pixel Instagram device models:", pixelInstaDevices?.length || 0)

      setPixelFacebookDeviceModels(pixelFbDevices || [])
      setPixelFacebookBuildNumbers(pixelFbBuilds || [])
      setPixelFacebookAppVersions(pixelFbApps || [])
      setPixelInstagramDeviceModels(pixelInstaDevices || [])
      setPixelInstagramVersions(pixelInstaVersions || [])
      setPixelInstagramChromeVersions(pixelInstaChromes || [])
      setPixelInstagramResolutionDpis(pixelInstaResolutions || [])

      console.log("[v0] Data loading completed successfully")
      setIsDataLoaded(true)
    } catch (error) {
      console.error("Error loading data:", error)
      setConnectionError("Failed to load data. Please check your connection and try again.")
    }
  }, [supabaseModules, isDataLoaded])

  const loadHistory = useCallback(async () => {
    if (!supabaseModules || !isDataLoaded) return

    try {
      const { UserAgentHistory } = supabaseModules
      if (!UserAgentHistory) {
        console.error("UserAgentHistory module not available")
        return
      }
      const history = await UserAgentHistory.list()
      setHistory(history.slice(0, 50))
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }, [supabaseModules, isDataLoaded])

  useEffect(() => {
    if (supabaseModules && !isDataLoaded) {
      loadData()
    }
  }, [supabaseModules, isDataLoaded])

  useEffect(() => {
    if (supabaseModules && isDataLoaded) {
      loadHistory()
    }
  }, [supabaseModules, isDataLoaded])

  const handleHistoryDownload = useCallback(
    async (historyItem) => {
      if (!historyItem.user_agents || historyItem.user_agents.length === 0) {
        showModal("❌ No Data!", "No user agents found in this history.", "error")
        return
      }

      showModal(
        "📥 Download History",
        `Do you want to download ${historyItem.user_agents.length} user agents again?`,
        "info",
        async () => {
          setModal((prev) => ({ ...prev, isOpen: false }))

          try {
            const content = historyItem.user_agents.join("\n")
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url

            const appTypeDisplay = historyItem.app_type.replace("android_", "android-")
            const timestamp = new Date(historyItem.generated_at).toISOString().slice(0, 19).replace(/:/g, "-")
            a.download = `${appTypeDisplay}_user_agents_${timestamp}.txt`

            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            showModal(
              "✅ Download Successful!",
              `${historyItem.user_agents.length} user agents downloaded successfully.`,
              "success",
            )
          } catch (error) {
            console.error("Error downloading from history:", error)
            showModal("❌ Download Failed!", "Error occurred while downloading!", "error")
          }
        },
        true,
      )
    },
    [showModal],
  )

  const handleHistoryCopy = useCallback(
    async (historyItem) => {
      if (!historyItem.user_agents || historyItem.user_agents.length === 0) {
        showModal("❌ No Data!", "No user agents found in this history.", "error")
        return
      }

      try {
        const content = historyItem.user_agents.join("\n")
        await navigator.clipboard.writeText(content)

        showModal(
          "✅ Copy Successful!",
          `${historyItem.user_agents.length} user agents copied successfully.`,
          "success",
        )
      } catch (error) {
        console.error("Error copying from history:", error)
        showModal("❌ Copy Failed!", "Error occurred while copying!", "error")
      }
    },
    [showModal],
  )

  const parseIOSVersion = (version) => {
    return version.split(".").map(Number)
  }

  const compareVersions = (v1, v2) => {
    const version1 = parseIOSVersion(v1)
    const version2 = parseIOSVersion(v2)

    for (let i = 0; i < Math.max(version1.length, version2.length); i++) {
      const a = version1[i] || 0
      const b = version2[i] || 0
      if (a < b) return -1
      if (a > b) return 1
    }
    return 0
  }

  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)]
  }

  const extractModelIdentifier = (modelName) => {
    if (!modelName) return modelName
    const match = modelName.match(/^([^\s(]+)/)
    return match ? match[1] : modelName
  }

  const getApiLevel = (version) => {
    const apiLevels = {
      "7.0": "24",
      "7.1": "25",
      "8.0": "26",
      "8.1": "27",
      "9": "28",
      "10": "29",
      "11": "30",
      "12": "31",
      "13": "33",
      "14": "34",
      "15": "35",
      "16": "36",
    }
    return apiLevels[version] || "35" // Latest API level as fallback
  }

  const generateAndroidInstagramUserAgent = async (cachedBuildNumbers = null) => {
    try {
      if (!instagramDeviceModels.length || !instagramVersions.length || !chromeVersions.length) {
        console.error("Missing Instagram configuration data")
        return null
      }

      const versionPairs = {
        "7": "24/7.0",
        "7.1": "25/7.1",
        "8": "26/8.0",
        "8.1": "27/8.1",
        "9": "28/9",
        "10": "29/10",
        "11": "30/11",
        "12": "31/12",
        "13": "33/13",
        "14": "34/14",
        "15": "35/15",
      }

      const languageConfig = configurations.languages
      if (!languageConfig) {
        throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
      }

      let languagePercentages: { [key: string]: number }
      try {
        languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
      } catch (error) {
        throw new Error("Invalid language configuration format in database")
      }

      const samsungDevices = instagramDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")

      if (samsungDevices.length === 0) {
        console.log("[v0] No Samsung devices found, using all devices")
      }

      const devicePool = samsungDevices.length > 0 ? samsungDevices : instagramDeviceModels
      const device = devicePool[Math.floor(Math.random() * devicePool.length)]
      const androidVersion = device.android_version.toString()

      const versionPair = versionPairs[androidVersion] || `28/${androidVersion}`

      let instagramBuildNumbers = cachedBuildNumbers
      if (!instagramBuildNumbers) {
        const { InstagramBuildNumber } = supabaseModules
        instagramBuildNumbers = (await InstagramBuildNumber?.list()) || []
      }

      let matchingBuildNumbers = instagramBuildNumbers.filter((bn) => bn.android_version === androidVersion)

      if (matchingBuildNumbers.length === 0) {
        const androidVersionNum = Number.parseFloat(androidVersion)
        matchingBuildNumbers = instagramBuildNumbers.filter((bn) => {
          const bnVersion = Number.parseFloat(bn.android_version)
          return Math.abs(bnVersion - androidVersionNum) <= 2
        })

        if (matchingBuildNumbers.length === 0) {
          matchingBuildNumbers = instagramBuildNumbers.filter((bn) => bn.is_active !== false)
        }

        if (matchingBuildNumbers.length === 0) {
          matchingBuildNumbers = instagramBuildNumbers
        }
      }

      if (matchingBuildNumbers.length === 0) {
        throw new Error(
          `No build numbers found for Samsung device with Android version ${androidVersion}. Please add build numbers in admin panel.`,
        )
      }

      const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      const buildNumber = selectedBuildNumber.build_number

      const resolutions = Array.isArray(device.resolutions)
        ? device.resolutions
        : device.resolutions.split(",").map((r) => r.trim())
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]

      const matchingDpis = resolutionDpis.filter((rd) => rd.resolution === resolution)
      const dpiOptions = matchingDpis.length > 0 ? matchingDpis[0].dpis.map((d) => `${d}dpi`) : ["420dpi"]
      const dpi = dpiOptions[Math.floor(Math.random() * dpiOptions.length)]

      const language = getWeightedRandomLanguage(languagePercentages)

      const instagramVersion = instagramVersions[Math.floor(Math.random() * instagramVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const instagramVersionString =
        instagramVersion.version || instagramVersion.app_version || instagramVersion.toString()
      const chromeVersionString = chromeVersion.version || chromeVersion.chrome_version || chromeVersion.toString()

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${device.model || "Unknown"} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersionString} Mobile Safari/537.36 ` +
        `Instagram ${instagramVersionString} Android (${versionPair}; ${dpi}; ${resolution}; samsung; ${device.model || "Unknown"}; ${device.model || "Unknown"}; qcom; ${language}; 123456789)`

      return userAgent
    } catch (error) {
      console.error("Error generating Samsung Instagram user agent:", error)
      return null
    }
  }

  const generateSamsungFacebookUserAgent = async () => {
    try {
      if (!androidDeviceModels.length || !androidAppVersions.length) {
        console.error("Missing Facebook configuration data")
        return null
      }

      const languageConfig = configurations.languages
      if (!languageConfig) {
        throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
      }

      let languagePercentages: { [key: string]: number }
      try {
        languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
      } catch (error) {
        throw new Error("Invalid language configuration format in database")
      }

      // Filter Samsung devices
      const samsungDevices = androidDeviceModels.filter((device) => device.manufacturer?.toLowerCase() === "samsung")

      console.log("[v0] Total Facebook devices:", androidDeviceModels.length)
      console.log("[v0] Samsung Facebook devices:", samsungDevices.length)

      if (samsungDevices.length === 0) {
        console.log("[v0] No Samsung devices found, using all devices")
      }

      const devicePool = samsungDevices.length > 0 ? samsungDevices : androidDeviceModels
      const device = devicePool[Math.floor(Math.random() * devicePool.length)]
      const androidVersion = device.android_version.toString()

      console.log("[v0] Selected Samsung device:", device.model_name, "Android version:", androidVersion)

      // Get Facebook build numbers from facebook_build_numbers table
      const { FacebookBuildNumber } = supabaseModules
      const facebookBuildNumbers = (await FacebookBuildNumber?.list()) || []

      console.log("[v0] Total Facebook build numbers available:", facebookBuildNumbers.length)
      console.log(
        "[v0] Available Android versions in Facebook build numbers:",
        [...new Set(facebookBuildNumbers.map((bn) => bn.android_version))].sort(),
      )

      // Match build numbers with device Android version
      let matchingBuildNumbers = facebookBuildNumbers.filter((bn) => bn.android_version === androidVersion)

      if (matchingBuildNumbers.length === 0) {
        console.log(
          `[v0] No exact Facebook build numbers for Android ${androidVersion}, trying Samsung-compatible versions`,
        )

        const androidVersionNum = Number.parseFloat(androidVersion)

        // First try: Find build numbers for same or newer Android versions
        let compatibleVersions = facebookBuildNumbers.filter((bn) => {
          const bnVersion = Number.parseFloat(bn.android_version)
          return bnVersion >= androidVersionNum && bnVersion <= androidVersionNum + 2
        })

        // Second try: If no newer versions, try older versions
        if (compatibleVersions.length === 0) {
          compatibleVersions = facebookBuildNumbers.filter((bn) => {
            const bnVersion = Number.parseFloat(bn.android_version)
            return Math.abs(bnVersion - androidVersionNum) <= 2
          })
        }

        // Third try: Use any active build numbers
        if (compatibleVersions.length === 0) {
          console.log("[v0] No compatible Facebook build numbers found, using any active build numbers")
          compatibleVersions = facebookBuildNumbers.filter((bn) => bn.is_active !== false)
        }

        // Final fallback: Use any build number
        if (compatibleVersions.length === 0) {
          console.log("[v0] No active Facebook build numbers found, using any available build numbers")
          compatibleVersions = facebookBuildNumbers
        }

        matchingBuildNumbers = compatibleVersions
        console.log(`[v0] Found ${compatibleVersions.length} compatible Facebook build numbers for Samsung device`)
      }

      if (matchingBuildNumbers.length === 0) {
        throw new Error(
          `No Facebook build numbers found for Samsung device with Android version ${androidVersion}. Please add build numbers in admin panel.`,
        )
      }

      const selectedBuildNumber = matchingBuildNumbers[Math.floor(Math.random() * matchingBuildNumbers.length)]
      const buildNumber = selectedBuildNumber.build_number
      console.log(
        "[v0] Selected Facebook build number:",
        buildNumber,
        "for Android version:",
        selectedBuildNumber.android_version,
      )

      const fbVersions = androidAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = androidAppVersions.filter((a) => a.app_type === "chrome")

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = extractModelIdentifier(device.model_name)

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelIdentifier} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version};IABMV/${fbVersion.iabmv};]`

      console.log("[v0] Generated Samsung Facebook user agent successfully")
      return userAgent
    } catch (error) {
      console.error("Error generating Samsung Facebook user agent:", error)
      return null
    }
  }

  const generateAndroidUserAgent = async () => {
    try {
      if (appType === "instagram") {
        return await generateAndroidInstagramUserAgent()
      }

      if (deviceType === "samsung") {
        return await generateSamsungFacebookUserAgent()
      }

      const device = androidDeviceModels[Math.floor(Math.random() * androidDeviceModels.length)]
      if (!device) throw new Error("No Android device models available")

      const buildNumber = androidBuildNumbers.find((b) => b.android_version === device.android_version)
      if (!buildNumber) throw new Error(`No build number found for ${device.android_version}`)

      const fbVersions = androidAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = androidAppVersions.filter((a) => a.app_type === "chrome")

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = extractModelIdentifier(device.model_name)

      const userAgent =
        `Mozilla/5.0 (Linux; ${device.android_version}; ${modelIdentifier} Build/${buildNumber.build_number}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version};IABMV/${fbVersion.iabmv};]`

      return userAgent
    } catch (error) {
      console.error("Error generating Android user agent:", error)
      return null
    }
  }

  const getWeightedRandomLanguage = (percentages) => {
    // Filter out languages with 0% usage
    const validLanguages = Object.entries(percentages).filter(([lang, percentage]) => percentage > 0)

    if (validLanguages.length === 0) {
      throw new Error("No languages with valid percentages found")
    }

    // Calculate total percentage of valid languages
    const totalPercentage = validLanguages.reduce((sum, [lang, percentage]) => sum + percentage, 0)

    if (totalPercentage <= 0) {
      throw new Error("Total language percentage must be greater than 0")
    }

    // Normalize percentages to ensure they sum to 100
    const normalizedLanguages = validLanguages.map(([lang, percentage]) => [lang, (percentage / totalPercentage) * 100])

    const random = Math.random() * 100
    let cumulative = 0

    for (const [lang, percentage] of normalizedLanguages) {
      cumulative += percentage
      if (random <= cumulative) {
        return lang
      }
    }

    // Fallback to first valid language if something goes wrong
    return normalizedLanguages[0][0]
  }

  const generatePixelUserAgent = async () => {
    try {
      console.log("[v0] Generating Pixel user agent, appType:", appType)
      console.log("[v0] Available Pixel Facebook devices:", pixelFacebookDeviceModels?.length || 0)
      console.log("[v0] Available Pixel Instagram devices:", pixelInstagramDeviceModels?.length || 0)

      if (appType === "instagram") {
        return await generatePixelInstagramUserAgent()
      }

      if (!pixelFacebookDeviceModels || pixelFacebookDeviceModels.length === 0) {
        console.log("[v0] No Pixel Facebook device models available")
        throw new Error("No Pixel device models available")
      }

      if (!pixelFacebookAppVersions || pixelFacebookAppVersions.length === 0) {
        console.log("[v0] No Pixel Facebook app versions available")
        throw new Error("No Pixel app versions available")
      }

      // Use Pixel Facebook device data
      const device = pixelFacebookDeviceModels[Math.floor(Math.random() * pixelFacebookDeviceModels.length)]
      console.log("[v0] Selected Pixel device:", device)

      console.log("[v0] Using device build number:", device.build_number)

      const fbVersions = pixelFacebookAppVersions.filter((a) => a.app_type === "facebook")
      const chromeVersions = pixelFacebookAppVersions.filter((a) => a.app_type === "chrome")

      console.log("[v0] Facebook versions available:", fbVersions?.length || 0)
      console.log("[v0] Chrome versions available:", chromeVersions?.length || 0)

      if (fbVersions.length === 0 || chromeVersions.length === 0) {
        throw new Error("No Facebook or Chrome versions available for Pixel")
      }

      const fbVersion = fbVersions[Math.floor(Math.random() * fbVersions.length)]
      const chromeVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)]

      const modelIdentifier = device.model_name || device.device_model || "Pixel"

      const userAgent =
        `Mozilla/5.0 (Linux; ${device.android_version || "13"}; ${modelIdentifier} Build/${device.build_number || "TQ3A.230901.001"}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version || "136.0.7195.102"} Mobile Safari/537.36 ` +
        `[FB_IAB/FB4A;FBAV/${fbVersion.version || "445.0.0.33.118"};IABMV/${fbVersion.iabmv || "1"};]`

      console.log("[v0] Generated Pixel Facebook user agent:", userAgent)
      return userAgent
    } catch (error) {
      console.error("Error generating Pixel user agent:", error)
      return null
    }
  }

  const generatePixelInstagramUserAgent = async () => {
    try {
      console.log("[v0] Generating Pixel Instagram user agent")
      console.log("[v0] Available devices:", pixelInstagramDeviceModels?.length || 0)
      console.log("[v0] Available versions:", pixelInstagramVersions?.length || 0)

      if (!pixelInstagramDeviceModels || pixelInstagramDeviceModels.length === 0) {
        console.log("[v0] No Pixel Instagram device models available")
        throw new Error("No Pixel Instagram device models available")
      }

      if (!pixelInstagramVersions || pixelInstagramVersions.length === 0) {
        console.log("[v0] No Pixel Instagram versions available")
        throw new Error("No Pixel Instagram versions available")
      }

      if (!pixelInstagramChromeVersions || pixelInstagramChromeVersions.length === 0) {
        console.log("[v0] No Pixel Instagram Chrome versions available")
        throw new Error("No Pixel Instagram Chrome versions available")
      }

      if (!pixelInstagramResolutionDpis || pixelInstagramResolutionDpis.length === 0) {
        console.log("[v0] No Pixel Instagram resolution DPIs available")
        throw new Error("No Pixel Instagram resolution DPIs available")
      }

      const device = pixelInstagramDeviceModels[Math.floor(Math.random() * pixelInstagramDeviceModels.length)]
      const version = pixelInstagramVersions[Math.floor(Math.random() * pixelInstagramVersions.length)]
      const chromeVersion =
        pixelInstagramChromeVersions[Math.floor(Math.random() * pixelInstagramChromeVersions.length)]
      const resolutionDpi =
        pixelInstagramResolutionDpis[Math.floor(Math.random() * pixelInstagramResolutionDpis.length)]

      console.log("[v0] Selected device:", device)
      console.log("[v0] Selected version:", version)
      console.log("[v0] Selected chrome version:", chromeVersion)
      console.log("[v0] Selected resolution DPI:", resolutionDpi)

      const modelIdentifier = device.model || device.model_name || device.device_model || "Pixel"

      const manufacturer = device.manufacturer ? `Google/${device.manufacturer}` : "Google/google"

      const deviceCodename = device.code || device.device_codename || "panther"
      const doubleCodename = `${deviceCodename}; ${deviceCodename}`

      const buildNumber =
        device.build_number ||
        (() => {
          throw new Error("No build number found for this device. Please configure build numbers in admin panel.")
        })()
      const androidVersion = device.android_version || 13
      const apiLevel = getApiLevel(androidVersion.toString()) || "35"

      const userAgent =
        `Mozilla/5.0 (Linux; Android ${androidVersion}; ${modelIdentifier} Build/${buildNumber}) ` +
        `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 ` +
        `Chrome/${chromeVersion.version || "136.0.7195.102"} Mobile Safari/537.36 ` +
        `Instagram ${version.version || "312.0.0.37.103"} Android (${apiLevel}/${androidVersion}; ${resolutionDpi.dpi || "420"}dpi; ` +
        `${resolutionDpi.resolution || "1440x3040"}; ${manufacturer}; ${modelIdentifier}; ${doubleCodename}; ${device.locale || "en_US"}; ${version.version_code || version.unique_id || "312001103"})`

      console.log("[v0] Generated Pixel Instagram user agent:", userAgent)
      return userAgent
    } catch (error) {
      console.error("Error generating Pixel Instagram user agent:", error)
      return null
    }
  }

  const generateUserAgent = (
    platform,
    appType,
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
  ) => {
    if (platform === "pixel") {
      return generatePixelUserAgent()
    } else if (platform === "android") {
      return generateAndroidUserAgent()
    } else {
      try {
        const device = getRandomElement(deviceModels)
        if (!device) throw new Error("No device models available")

        const validIOSVersions = iosVersions.filter((ios) => {
          const versionCompareMin = compareVersions(ios.version, device.min_ios_version)
          const versionCompareMax = compareVersions(ios.version, device.max_ios_version)
          return versionCompareMin >= 0 && versionCompareMax <= 0
        })

        if (validIOSVersions.length === 0) {
          return generateUserAgent(
            platform,
            appType,
            deviceModels,
            iosVersions,
            appVersions,
            configurations,
            blacklistedUAs,
            androidDeviceModels,
            androidBuildNumbers,
            androidAppVersions,
            instagramDeviceModels,
            instagramVersions,
            chromeVersions,
            resolutionDpis,
          )
        }

        const iosVersion = getRandomElement(validIOSVersions)
        const appVersionsForType = appVersions.filter((app) => app.app_type === appType)

        if (appVersionsForType.length === 0) {
          throw new Error(`No app versions available for ${appType}`)
        }

        const appVersion = getRandomElement(appVersionsForType)

        const languageConfig = configurations.languages
        if (!languageConfig) {
          throw new Error("Language configuration not found in database. Please configure languages in admin panel.")
        }

        let languagePercentages: { [key: string]: number }
        try {
          languagePercentages = typeof languageConfig === "string" ? JSON.parse(languageConfig) : languageConfig
        } catch (error) {
          throw new Error("Invalid language configuration format in database")
        }

        const language = getWeightedRandomLanguage(languagePercentages)

        const deviceResolutions = device.resolutions && device.resolutions.length > 0 ? device.resolutions : []
        const deviceScaling = device.screen_scaling && device.screen_scaling.length > 0 ? device.screen_scaling : []

        if (deviceResolutions.length === 0) {
          throw new Error(`Device ${device.model_name} has no resolution data in database`)
        }
        if (deviceScaling.length === 0) {
          throw new Error(`Device ${device.model_name} has no scaling data in database`)
        }

        let userAgent

        const modelIdentifier = extractModelIdentifier(device.model_name)

        if (appType === "instagram") {
          console.log("[v0] Generating Instagram iOS user agent...")
          console.log("[v0] Device resolutions:", deviceResolutions)
          console.log("[v0] Device scaling:", deviceScaling)
          console.log("[v0] Selected resolution:", getRandomElement(deviceResolutions))
          console.log("[v0] Selected scaling:", getRandomElement(deviceScaling))

          userAgent =
            `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion.version.replace(/\./g, "_")} like Mac OS X) ` +
            `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
            `Instagram ${appVersion.version} (${modelIdentifier}; iOS ${iosVersion.version.replace(/\./g, "_")}; ${language}; ` +
            `scale=${getRandomElement(deviceScaling)}; ${getRandomElement(deviceResolutions)}; ${appVersion.build_number})`

          console.log("[v0] Generated Instagram iOS user agent:", userAgent)
        } else {
          const fbss = getRandomElement(deviceScaling.map((s) => s.replace(".00", "")))
          const extra = Math.random() < 0.1 ? ";FBOP/80" : ""

          let fbrv = appVersion.fbrv
          if (fbrv) {
            fbrv = fbrv.toString()
          } else {
            fbrv = (Math.floor(Math.random() * 999999) + 700000000).toString()
          }

          const fbrv_part = extra ? "" : `;FBOP/5;FBRV/${fbrv}`
          const iabmv = Math.random() < 0.9 ? ";IABMV/1" : ""

          userAgent =
            `Mozilla/5.0 (iPhone; CPU iPhone OS ${iosVersion.version.replace(/\./g, "_")} like Mac OS X) ` +
            `AppleWebKit/${iosVersion.webkit_version} (KHTML, like Gecko) Mobile/${iosVersion.build_number} ` +
            `[FBAN/FBIOS;FBAV/${appVersion.version};FBBV/${appVersion.build_number};FBDV/${modelIdentifier};FBMD/iPhone;FBSN/iOS;` +
            `FBSV/${iosVersion.version};FBSS/${fbss};FBID/phone;FBLC/${language}${extra}${fbrv_part}${iabmv}]`
        }

        return userAgent
      } catch (error) {
        console.error("Error generating user agent:", error)
        return null
      }
    }
  }

  // Renamed generateUserAgents to handleGenerate and adjusted parameters
  const handleGenerate = useCallback(async () => {
    if (!supabaseModules || connectionError) {
      showModal("❌ Database Connection Error!", "No database connection. Please refresh the page.", "error")
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)
    setUserAgents([])

    showProgressModal("🚀 User Agent Generation Started", "Processing started...", 0, "info", true)

    try {
      const newUserAgents = []
      const usedUserAgents = new Set()

      const maxAttempts = Math.max(quantity * 100, 50000)
      let attempts = 0
      let consecutiveFailures = 0
      const maxConsecutiveFailures = 500
      let lastProgressUpdate = 0

      let cachedInstagramBuildNumbers = null
      if (platform === "android" && appType === "instagram") {
        const { InstagramBuildNumber } = supabaseModules
        cachedInstagramBuildNumbers = (await InstagramBuildNumber?.list()) || []
        console.log(`[v0] Cached ${cachedInstagramBuildNumbers.length} Instagram build numbers`)
      }

      console.log(`[v0] Starting generation: ${quantity} requested`)
      console.log(`[v0] Blacklisted UAs: ${blacklistedUAs.size}`)

      while (
        newUserAgents.length < quantity &&
        attempts < maxAttempts &&
        consecutiveFailures < maxConsecutiveFailures
      ) {
        attempts++

        let userAgent = null

        try {
          if (platform === "android") {
            if (appType === "instagram") {
              userAgent = await generateAndroidInstagramUserAgent(cachedInstagramBuildNumbers)
            } else if (appType === "facebook") {
              if (deviceType === "samsung") {
                userAgent = await generateSamsungFacebookUserAgent()
              } else {
                userAgent = await generateAndroidUserAgent()
              }
            } else {
              userAgent = await generateAndroidUserAgent()
            }
          } else if (platform === "ios") {
            userAgent = generateUserAgent(
              platform,
              appType,
              deviceModels,
              iosVersions,
              appVersions,
              configurations,
              blacklistedUAs,
              androidDeviceModels,
              androidBuildNumbers,
              androidAppVersions,
              instagramDeviceModels,
              instagramVersions,
              chromeVersions,
              resolutionDpis,
            )
          } else if (platform === "pixel") {
            userAgent = await generatePixelUserAgent()
          }

          if (userAgent && !newUserAgents.includes(userAgent)) {
            newUserAgents.push(userAgent)
            consecutiveFailures = 0
          } else {
            consecutiveFailures++
          }
        } catch (error) {
          console.error("Error generating user agent:", error)
          consecutiveFailures++
        }

        const now = Date.now()
        if (now - lastProgressUpdate > 100) {
          lastProgressUpdate = now
          const progress = Math.round((newUserAgents.length / quantity) * 100)
          const successRate = attempts > 0 ? Math.round((newUserAgents.length / attempts) * 100) : 0

          startTransition(() => {
            setGenerationProgress(progress)
            setProgressModal((prev) => ({
              ...prev,
              progress,
              message: `⚡ ${newUserAgents.length}/${quantity} unique user agents generated\n📊 Success rate: ${successRate}%\n🔄 Attempts: ${attempts}/${maxAttempts}`,
            }))
          })

          await new Promise((resolve) => setTimeout(resolve, 1))
        }

        if (newUserAgents.length < quantity && attempts < maxAttempts && consecutiveFailures < maxConsecutiveFailures) {
          if (platform === "android" && appType === "instagram") {
            // No delay needed since we're using cached data
          } else if (consecutiveFailures > 50) {
            await new Promise((resolve) => setTimeout(resolve, 200))
          } else if (consecutiveFailures > 20) {
            await new Promise((resolve) => setTimeout(resolve, 50))
          } else {
            await new Promise((resolve) => setTimeout(resolve, 10))
          }
        }
      }

      const finalUserAgents = newUserAgents.slice(0, quantity)
      const actualGenerated = finalUserAgents.length

      startTransition(() => {
        setUserAgents(finalUserAgents)
      })

      if (actualGenerated === quantity) {
        setProgressModal((prev) => ({
          ...prev,
          progress: 100,
          title: "✅ Job Successful",
          message: `🎉 ${quantity} unique user agents generated successfully!\n⚡ Total attempts: ${attempts}\n✨ Job completed!`,
          type: "success",
          showCancel: false,
        }))

        // Auto close after 2 seconds
        setTimeout(() => {
          hideProgressModal()
        }, 2000)
      } else if (actualGenerated > 0) {
        setProgressModal((prev) => ({
          ...prev,
          progress: Math.round((actualGenerated / quantity) * 100),
          title: "⚠️ Job Partially Successful",
          message: `📊 ${actualGenerated} out of ${quantity} unique user agents generated\nWarning: Could not generate more due to blacklist and duplicate avoidance`,
          type: "warning",
          showCancel: false,
        }))

        setTimeout(() => {
          hideProgressModal()
        }, 3000)
      } else {
        setProgressModal((prev) => ({
          ...prev,
          progress: 0,
          title: "❌ Job Failed",
          message: `💥 No unique user agents could be generated\n🚫 All possible combinations may be blacklisted or used`,
          type: "error",
          showCancel: false,
        }))

        setTimeout(() => {
          hideProgressModal()
        }, 3000)
      }

      console.log(`[v0] Generation completed: ${actualGenerated}/${quantity} generated in ${attempts} attempts`)
    } catch (error) {
      console.error("Error generating user agents:", error)
      setProgressModal((prev) => ({
        ...prev,
        progress: 0,
        title: "❌ Job Failed",
        message: `💥 Error occurred while generating user agents\n🔄 Please try again`,
        type: "error",
        showCancel: false,
      }))

      setTimeout(() => {
        hideProgressModal()
      }, 3000)
    } finally {
      setIsGenerating(false)
    }
  }, [
    platform,
    appType,
    quantity,
    supabaseModules,
    connectionError,
    deviceModels,
    iosVersions,
    appVersions,
    configurations,
    blacklistedUAs,
    androidDeviceModels,
    androidBuildNumbers,
    androidAppVersions,
    instagramDeviceModels,
    instagramVersions,
    chromeVersions,
    resolutionDpis,
    deviceType,
    showModal,
    showProgressModal,
    hideProgressModal,
    setUserAgents,
    setGenerationProgress,
    setIsGenerating,
    startTransition,
    setProgressModal,
  ])

  const addToBlacklist = async () => {
    if (!userAgents.length) return false

    try {
      console.log(`Adding ${userAgents.length} user agents to blacklist...`)

      showProgressModal("⚙️ Processing", "Blacklisting user agents...", 0, "info", false)

      const finalAppType = platform === "android" ? `android_${appType}` : appType
      const { BlacklistedUserAgent } = supabaseModules

      const batchSize = 50 // Increased batch size for better performance
      const totalBatches = Math.ceil(userAgents.length / batchSize)

      for (let batch = 0; batch < totalBatches; batch++) {
        const batchStart = batch * batchSize
        const batchEnd = Math.min(batchStart + batchSize, userAgents.length)
        const batchUAs = userAgents.slice(batchStart, batchEnd)

        const batchDataMap = new Map()

        batchUAs.forEach((ua) => {
          const hash = btoa(ua)
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 32)

          // Only add if hash doesn't exist in this batch
          if (!batchDataMap.has(hash)) {
            batchDataMap.set(hash, {
              user_agent: ua,
              hash,
              downloaded_by: "anonymous@example.com",
              app_type: finalAppType,
            })
          }
        })

        // Convert map to array for bulk upsert
        const batchData = Array.from(batchDataMap.values())

        try {
          // Use bulk upsert for much better performance
          await BlacklistedUserAgent.bulkCreateOrUpdate(batchData)
        } catch (error) {
          console.error(`Error blacklisting batch ${batch + 1}:`, error)
          throw error
        }

        const progress = Math.round(((batch + 1) / totalBatches) * 100)
        startTransition(() => {
          setProgressModal((prev) => ({
            ...prev,
            progress,
            message: `🔒 ${batchEnd}/${userAgents.length} user agents processed...`,
          }))
        })

        // No delay needed with bulk operations
      }

      console.log(`Successfully blacklisted ${userAgents.length} user agents`)

      await loadData()

      hideProgressModal()
      return true
    } catch (error) {
      console.error("Error during blacklisting process:", error)
      hideProgressModal()
      return false
    }
  }

  const handleDownload = useCallback(async () => {
    if (!userAgents.length) return

    try {
      // const historyId = await GenerationHistory.create({
      //   app_type: appType,
      //   quantity: userAgents.length,
      //   user_agents: userAgents,
      //   is_downloaded: true,
      //   created_by: accessKey?.access_key || "anonymous",
      // })

      const text = userAgents.join("\n")
      const blob = new Blob([text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `user-agents-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // loadHistory()

      showModal("✅ Download Successful!", `${userAgents.length} user agents downloaded successfully.`, "success")
    } catch (error) {
      console.error("Error downloading file:", error)
      showModal("❌ Error!", "Error occurred while downloading.", "error")
    }
  }, [userAgents, showModal])

  const handleCopyAll = useCallback(async () => {
    if (userAgents.length === 0) return

    try {
      const text = userAgents.join("\n")
      await navigator.clipboard.writeText(text)

      // const historyId = await GenerationHistory.create({
      //   app_type: appType,
      //   quantity: userAgents.length,
      //   user_agents: userAgents,
      //   is_downloaded: false,
      //   created_by: accessKey?.access_key || "anonymous",
      // })

      // loadHistory()

      showModal("✅ Copy Successful!", `${userAgents.length} user agents copied successfully.`, "success")
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      showModal("❌ Error!", "Error occurred while copying.", "error")
    }
  }, [userAgents, showModal])

  const copyToClipboard = useCallback((text, index) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }, [])

  // Removed unused startTransition import
  // Removed unused copyAllUserAgents and downloadUserAgents functions
  // Removed unused handleGenerate function
  // Removed unused copyToClipboard function
  // Removed unused handleHistoryDownload and handleHistoryCopy functions
  // Removed unused addToBlacklist function
  // Removed unused handleDownload and handleCopyAll functions
  // Removed unused accessKey state
  // Removed unused currentHistoryId state
  // Removed unused generationProgress state
  // Removed unused isLoadingHistory state
  // Removed unused connectionError state
  // Removed unused modal state
  // Removed unused progressModal state
  // Removed unused dataState state
  // Removed unused allCopied state
  // Removed unused copiedIndex state
  // Removed unused pixelFacebookDeviceModels state
  // Removed unused pixelFacebookBuildNumbers state
  // Removed unused pixelFacebookAppVersions state
  // Removed unused pixelInstagramDeviceModels state
  // Removed unused pixelInstagramVersions state
  // Removed unused pixelInstagramChromeVersions state
  // Removed unused pixelInstagramResolutionDpis state
  // Removed unused deviceType state
  // Removed unused supabaseModules state
  // Removed unused isDataLoaded state
  // Removed unused loadSupabaseModules function
  // Removed unused loadData function
  // Removed unused loadHistory function
  // Removed unused showModal function
  // Removed unused showProgressModal function
  // Removed unused hideProgressModal function
  // Removed unused parseIOSVersion function
  // Removed unused compareVersions function
  // Removed unused getRandomElement function
  // Removed unused extractModelIdentifier function
  // Removed unused getApiLevel function
  // Removed unused generateAndroidInstagramUserAgent function
  // Removed unused generateSamsungFacebookUserAgent function
  // Removed unused generateAndroidUserAgent function
  // Removed unused getWeightedRandomLanguage function
  // Removed unused generatePixelUserAgent function
  // Removed unused generatePixelInstagramUserAgent function
  // Removed unused generateUserAgent function

  // Added a beautiful header section
  const headerStyle = {
    background: "linear-gradient(to right, #6366F1, #8B5CFE, #3B82F6)",
    color: "white",
  }

  return (
    // Updated background gradient and removed overflow-hidden
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20" />
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-64 w-96 h-96 bg-indigo-200/30 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="space-y-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardContent className="p-0">
              <nav className="flex rounded-lg overflow-hidden" role="tablist"></nav>
            </CardContent>
          </Card>

          {activeTab === "generator" && (
            <div className="space-y-8">
              <GeneratorControls
                platform={platform}
                setPlatform={setPlatform}
                appType={appType}
                setAppType={setAppType}
                quantity={quantity}
                setQuantity={setQuantity}
                isGenerating={isGenerating}
                // Changed onGenerate prop to onGenerate={handleGenerate}
                onGenerate={handleGenerate}
              />

              {userAgents.length > 0 && (
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-slate-900 dark:text-slate-100">
                        Generated User Agents ({userAgents.length})
                      </span>
                      <div className="flex gap-2">
                        {/* Changed button text and removed unused props */}
                        <Button
                          onClick={handleCopyAll}
                          variant="outline"
                          size="sm"
                          className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          size="sm"
                          className="bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {userAgents.map((ua, index) => (
                        <div
                          key={index}
                          className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <code className="text-sm text-slate-700 dark:text-slate-300 flex-1 break-all">{ua}</code>
                            {/* Removed unused props and changed onClick handler */}
                            <Button
                              onClick={() => copyToClipboard(ua, index)}
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Modal */}
      {progressModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
            <div
              className={`px-6 py-4 ${
                progressModal.type === "success"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : progressModal.type === "error"
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : progressModal.type === "warning"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-indigo-500 to-blue-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{progressModal.title}</h3>
                {(progressModal.type === "success" ||
                  progressModal.type === "error" ||
                  progressModal.type === "warning") && (
                  <button
                    onClick={hideProgressModal}
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-3 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ease-out ${
                      progressModal.type === "success"
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : progressModal.type === "error"
                          ? "bg-gradient-to-r from-red-400 to-rose-500"
                          : progressModal.type === "warning"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                            : "bg-gradient-to-r from-indigo-400 to-blue-500"
                    }`}
                    style={{ width: `${progressModal.progress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                  {progressModal.progress}%
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {progressModal.message}
                </div>
              </div>

              {progressModal.showCancel && (
                <div className="flex justify-center">
                  <Button
                    onClick={hideProgressModal}
                    variant="outline"
                    size="sm"
                    className="px-6 py-2 font-medium bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regular Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100">
            <div
              className={`px-6 py-4 ${
                modal.type === "success"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : modal.type === "error"
                    ? "bg-gradient-to-r from-red-500 to-rose-500"
                    : modal.type === "warning"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-indigo-500 to-blue-500"
              }`}
            >
              <h3 className="text-xl font-bold text-white">{modal.title}</h3>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {modal.message}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {modal.showCancel && (
                  <Button
                    onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                    variant="outline"
                    size="sm"
                    className="px-6 py-2 font-medium"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={() => {
                    modal.onConfirm()
                    setModal((prev) => ({ ...prev, isOpen: false }))
                  }}
                  size="sm"
                  className="px-6 py-2 font-medium"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
