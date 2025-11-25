import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("user_preferences").select("theme").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned, which is fine for new users
      console.error("[v0] Error fetching preferences:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ theme: data?.theme || "light" })
  } catch (error) {
    console.error("[v0] Error in GET /api/user/preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { theme } = await request.json()

    if (!theme || !["light", "dark"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    // Upsert the preference
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        theme,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("[v0] Error saving preferences:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error("[v0] Error in POST /api/user/preferences:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
