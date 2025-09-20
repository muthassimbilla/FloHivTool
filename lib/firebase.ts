import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { env } from "./env"

const isFirebaseConfigured = () => {
  const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  const messagingSenderId =
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const appId = env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID

  console.log("[v0] Firebase environment variables check:")
  console.log("[v0] API_KEY:", !!apiKey)
  console.log("[v0] AUTH_DOMAIN:", !!authDomain)
  console.log("[v0] PROJECT_ID:", !!projectId)
  console.log("[v0] STORAGE_BUCKET:", !!storageBucket)
  console.log("[v0] MESSAGING_SENDER_ID:", !!messagingSenderId)
  console.log("[v0] APP_ID:", !!appId)

  const configured = !!(apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId)

  console.log("[v0] Firebase configured:", configured)
  return configured
}

let app: any = null
let auth: any = null

if (isFirebaseConfigured()) {
  try {
    const firebaseConfig = {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId:
        env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    }

    // Initialize Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

    // Initialize Firebase Auth
    auth = getAuth(app)

    console.log("[v0] Firebase initialized successfully")
  } catch (error) {
    console.error("[v0] Failed to initialize Firebase:", error)
    app = null
    auth = null
  }
} else {
  console.warn("[v0] Firebase configuration not available - Firebase features will be disabled")
}

export { auth }
export default app
