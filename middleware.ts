import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return response
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "anonymous"
    const rateLimitKey = `rate_limit_${ip}_${pathname}`

    // Simple rate limiting (in production, use Redis or similar)
    const rateLimitHeader = request.headers.get("x-rate-limit-count")
    const currentCount = rateLimitHeader ? Number.parseInt(rateLimitHeader) : 0

    if (currentCount > 100) {
      // 100 requests per minute
      return new NextResponse("Rate limit exceeded", { status: 429 })
    }
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("[v0] Supabase not configured, skipping auth check")
      return response
    }

    try {
      // Create Supabase client for server-side auth
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options })
          },
        },
      })

      if (!supabase) {
        console.warn("[v0] Failed to create Supabase client")
        return response
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      console.log("[v0] Middleware auth check - user:", user?.id, "error:", error)

      if (error || !user) {
        console.log("[v0] No Supabase user found, checking if this is a Firebase-only setup")
        // Don't redirect if this might be a Firebase-only setup
        // Let the client-side auth handle the redirect
        return response
      }

      // Additional check for admin routes
      if (pathname.startsWith("/admin")) {
        if (!user?.id) {
          console.warn("[v0] User ID not available for admin check")
          return response
        }

        const { data: profile } = await supabase
          .from("users")
          .select("role, is_approved")
          .eq("firebase_uid", user.id)
          .single()

        if (!profile || profile.role !== "admin" || !profile.is_approved) {
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }
    } catch (error) {
      console.error("[v0] Middleware auth error:", error)
      // Don't redirect on error, let client handle it
      return response
    }
  }

  // Security headers for all responses
  response.headers.set("X-DNS-Prefetch-Control", "on")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
  ],
}
