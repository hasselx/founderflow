import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message, category } = body

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("user_feedback")
      .insert({
        user_id: user.id,
        subject,
        message,
        category: category || "general",
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating feedback:", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in feedback API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
