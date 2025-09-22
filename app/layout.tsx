import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SidebarNavigation from "@/components/sidebar-navigation"
import PageTransition from "@/components/page-transition"
import AutoUpdateProvider from "@/components/auto-update-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
})

export const metadata: Metadata = {
  title: "Flo Hiv Tool - Professional User Agent Generator for iOS & Samsung",
  description:
    "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook. Fast, secure, and reliable user agent generation tool.",
  keywords:
    "user agent generator, iOS user agent, Samsung user agent, Instagram user agent, Facebook user agent, mobile user agent",
  authors: [{ name: "Flo Hiv Tool" }],
  creator: "Flo Hiv Tool",
  publisher: "Flo Hiv Tool",
  generator: "Next.js",
  applicationName: "Flo Hiv Tool",
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
    url: "https://uagen-pro.vercel.app",
    siteName: "Flo Hiv Tool",
    title: "Flo Hiv Tool - Professional User Agent Generator",
    description:
      "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook. Fast, secure, and reliable user agent generation tool.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flo Hiv Tool - User Agent Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flo Hiv Tool - Professional User Agent Generator",
    description:
      "Generate thousands of unique, professional-grade iOS and Samsung user agents for Instagram and Facebook.",
    images: ["/og-image.png"],
    creator: "@flohivtool",
  },
  other: {
    "application-name": "Flo Hiv Tool",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Flo Hiv Tool",
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
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="devtools-pro-theme"
        >
          <AutoUpdateProvider>
            <SidebarNavigation />
            <div className="lg:ml-64">
              <PageTransition>{children}</PageTransition>
            </div>
            <Toaster />
          </AutoUpdateProvider>
        </ThemeProvider>

        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/68d116d2325347191f52c9e5/1j5oc2a03';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}
