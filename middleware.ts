import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    // Check if user is authenticated and approved
    // This will be handled by the admin components themselves
    // since we need to verify Firebase token and Supabase data
    return NextResponse.next()
  }

  // Protected user routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/profile")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
}
