import { initializeApp, getApps } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Auth
export const auth = getAuth(app)

// Connect to emulator in development
if (process.env.NODE_ENV === "development" && !auth.emulatorConfig) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099")
  } catch (error) {
    console.log("Auth emulator connection failed:", error)
  }
}

export default app
