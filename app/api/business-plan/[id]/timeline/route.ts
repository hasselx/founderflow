import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: idea, error: fetchError } = await supabase
      .from("startup_ideas")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || idea?.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const { data: phase, error: insertError } = await supabase
      .from("project_timelines")
      .insert({
        idea_id: id,
        phase_name: body.phase_name,
        phase_number: body.phase_number,
        start_date: body.start_date,
        end_date: body.end_date,
        objectives: body.objectives,
        deliverables: body.deliverables,
        resources_needed: body.resources_needed,
        status: "pending",
        progress_percentage: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json(
        { error: "Failed to add phase" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      phase,
      message: "Phase added successfully",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
