import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { role, domains } = await request.json()

    // Get authenticated user client
    const supabase = await getSupabaseServerClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Create or update user profile with admin client (bypasses RLS)
    const { error: upsertError } = await supabaseAdmin.from("users").upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      role,
    })

    if (upsertError) {
      console.error("[v0] User upsert error:", upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 400 })
    }

    // Insert user domains with regular authenticated client
    const domainInserts = domains.map((domain: string) => ({
      user_id: user.id,
      domain,
    }))

    const { error: domainError } = await supabase.from("user_domains").insert(domainInserts)

    if (domainError) {
      console.error("[v0] Domain insert error:", domainError)
      return NextResponse.json({ error: domainError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Profile completion error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
