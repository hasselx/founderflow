import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user has completed profile
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      )

      const { data: userProfile } = await supabaseAdmin.from("users").select("role").eq("id", data.user.id).single()

      // If no profile, redirect to role selection
      if (!userProfile || !userProfile.role) {
        return NextResponse.redirect(new URL("/auth/role-select", request.url))
      }

      // Profile complete, redirect to dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page
  return NextResponse.redirect(new URL("/auth/error", request.url))
}
