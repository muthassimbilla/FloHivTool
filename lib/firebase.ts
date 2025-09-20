import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { env } from "./env"

const isFirebaseConfigured = () => {
  console.log("[v0] Firebase environment variables check:")
  console.log("[v0] API_KEY:", !!env.NEXT_PUBLIC_FIREBASE_API_KEY)
  console.log("[v0] AUTH_DOMAIN:", !!env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
  console.log("[v0] PROJECT_ID:", !!env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  console.log("[v0] STORAGE_BUCKET:", !!env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
  console.log("[v0] MESSAGING_SENDER_ID:", !!env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
  console.log("[v0] APP_ID:", !!env.NEXT_PUBLIC_FIREBASE_APP_ID)

  const configured = !!(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    env.NEXT_PUBLIC_FIREBASE_APP_ID
  )

  console.log("[v0] Firebase configured:", configured)
  return configured
}

let app: any = null
let auth: any = null

if (isFirebaseConfigured()) {
  try {
    const firebaseConfig = {
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID!,
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
