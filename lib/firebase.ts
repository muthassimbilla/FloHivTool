import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { env } from "./env"

const isFirebaseConfigured = () => {
  return !!(
    env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
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

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Failed to initialize Firebase:", error)
    app = null
    auth = null
  }
} else {
  console.warn("Firebase configuration not available - Firebase features will be disabled")
}

export { auth }
export default app
