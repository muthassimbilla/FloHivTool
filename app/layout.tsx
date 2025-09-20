import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { NotificationProvider } from "@/components/notifications/notification-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://flohivtool.vercel.app"),
  title: "UAGen Pro - Professional User Agent Generator for iOS & Samsung",
  description:
    "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook. Fast, secure, and reliable user agent generation tool.",
  keywords:
    "user agent generator, iOS user agent, Samsung user agent, Instagram user agent, Facebook user agent, mobile user agent",
  authors: [{ name: "UAGen Pro" }],
  creator: "UAGen Pro",
  publisher: "UAGen Pro",
  generator: "Next.js",
  applicationName: "UAGen Pro",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.SITE_URL || "https://flohivtool.vercel.app",
    siteName: "UAGen Pro",
    title: "UAGen Pro - Professional User Agent Generator",
    description:
      "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook. Fast, secure, and reliable user agent generation tool.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UAGen Pro - User Agent Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UAGen Pro - Professional User Agent Generator",
    description:
      "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook.",
    images: ["/og-image.png"],
    creator: "@uagenpro",
  },
  other: {
    "application-name": "UAGen Pro",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "UAGen Pro",
    "format-detection": "telephone=no",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            .hero-section{min-height:100vh;padding:1rem;background:linear-gradient(135deg,#f8fafc 0%,#e0f2fe 50%,#f1f5f9 100%)}
            @media (prefers-color-scheme: dark){.hero-section{background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%)}}
            .card-optimized{background:rgba(255,255,255,0.8);backdrop-filter:blur(12px);border:none;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25)}
            @media (prefers-color-scheme: dark){.card-optimized{background:rgba(30,41,59,0.8)}}
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen">{children}</div>
            </NotificationProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
