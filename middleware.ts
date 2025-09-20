import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

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

  // Create Supabase client for server-side auth
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Check authentication for protected routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Additional check for admin routes
      if (pathname.startsWith("/admin")) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, status")
          .eq("firebase_uid", user.id)
          .single()

        if (!profile || profile.role !== "admin" || profile.status !== "approved") {
          return NextResponse.redirect(new URL("/unauthorized", request.url))
        }
      }
    } catch (error) {
      console.error("Middleware auth error:", error)
      return NextResponse.redirect(new URL("/login", request.url))
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
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
