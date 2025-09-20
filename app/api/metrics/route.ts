import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const [{ count: totalUsers }, { count: totalGenerations }, { count: activeUsers }] = await Promise.all([
      supabase.from("user_profiles").select("*", { count: "exact", head: true }),
      supabase.from("generation_history").select("*", { count: "exact", head: true }),
      supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    ])

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
        totalGenerations: totalGenerations || 0,
        activeUsers: activeUsers || 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
