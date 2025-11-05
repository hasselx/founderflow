import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    // Fetch discussions from the database
    const { data: discussions, error } = await supabase
      .from("discussions")
      .select(
        `
        id,
        title,
        content,
        created_at,
        user_id,
        category,
        users (full_name, email)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] Failed to fetch discussions:", error)
      return NextResponse.json({ discussions: [] })
    }

    return NextResponse.json({ discussions: discussions || [] })
  } catch (error) {
    console.error("[v0] Discussions API error:", error)
    return NextResponse.json({ discussions: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { title, content, category } = await request.json()

    const { data: discussion, error } = await supabase.from("discussions").insert([
      {
        title,
        content,
        category,
        user_id: user.id,
      },
    ])

    if (error) {
      console.error("[v0] Failed to create discussion:", error)
      return NextResponse.json({ error: "Failed to create discussion" }, { status: 400 })
    }

    return NextResponse.json({ discussion })
  } catch (error) {
    console.error("[v0] POST discussions error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
