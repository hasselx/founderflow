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
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      )

      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from("users")
        .select("id, role, email, full_name")
        .eq("id", data.user.id)
        .single()

      // If no profile exists, create one and redirect to role selection
      if (profileError || !userProfile) {
        await supabaseAdmin.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        return NextResponse.redirect(new URL("/auth/role-select", request.url))
      }

      // If profile exists but no role, redirect to role selection
      if (!userProfile.role || userProfile.role === "") {
        return NextResponse.redirect(new URL("/auth/role-select", request.url))
      }

      // User has complete profile, redirect to dashboard
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page if no code or auth failed
  return NextResponse.redirect(new URL("/auth/login?error=callback_failed", request.url))
}
