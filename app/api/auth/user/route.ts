import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("full_name, email, avatar_url")
      .eq("id", authUser.id)
      .single()

    return NextResponse.json({
      user: {
        id: authUser.id,
        email: userData?.email || authUser.email,
        full_name: userData?.full_name || authUser.user_metadata?.full_name || "User",
        avatar_url: userData?.avatar_url || null,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
