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

    // Check if user profile already exists
    const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("id", user.id).single()

    const { error: upsertError } = await supabaseAdmin.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (upsertError) {
      console.error("[v0] User upsert error:", upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 400 })
    }

    await supabaseAdmin.from("user_domains").delete().eq("user_id", user.id)

    const domainInserts = domains.map((domain: string) => ({
      user_id: user.id,
      domain,
    }))

    const { error: domainError } = await supabaseAdmin.from("user_domains").insert(domainInserts)

    if (domainError) {
      console.error("[v0] Domain insert error:", domainError)
      return NextResponse.json({ error: domainError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Profile updated successfully" })
  } catch (error) {
    console.error("[v0] Profile completion error:", error)
    return NextResponse.json({ error: "An error occurred", details: String(error) }, { status: 500 })
  }
}
