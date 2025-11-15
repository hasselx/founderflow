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

    console.log("[v0] Timeline POST - user:", user.id, "idea_id:", id)

    const { data: idea, error: fetchError } = await supabase
      .from("startup_ideas")
      .select("user_id, id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("[v0] Fetch idea error:", fetchError)
      return NextResponse.json(
        { error: "Failed to fetch idea" },
        { status: 500 }
      )
    }

    if (!idea || idea.user_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this idea" },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.phase_name || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Missing required fields: phase_name, start_date, end_date" },
        { status: 400 }
      )
    }

    const { data: phase, error: insertError } = await supabase
      .from("project_timelines")
      .insert({
        idea_id: id,
        phase_name: body.phase_name,
        phase_number: body.phase_number || 1,
        start_date: body.start_date,
        end_date: body.end_date,
        objectives: body.objectives || "",
        deliverables: body.deliverables || "",
        resources_needed: body.resources_needed || "",
        status: "planned",
        progress_percentage: 0,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json(
        { error: `Failed to add phase: ${insertError.message}` },
        { status: 500 }
      )
    }

    console.log("[v0] Phase created successfully:", phase.id)

    return NextResponse.json({
      success: true,
      phase,
      message: "Phase added successfully",
    })
  } catch (error) {
    console.error("[v0] Timeline API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: phase, error } = await supabase
      .from("project_timelines")
      .update({
        phase_name: body.phase_name,
        start_date: body.start_date,
        end_date: body.end_date,
        objectives: body.objectives,
        deliverables: body.deliverables,
        resources_needed: body.resources_needed,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Update phase error:", error)
      throw error
    }

    return NextResponse.json({ phase })
  } catch (error) {
    console.error("[v0] Update phase error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update phase" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const phaseId = searchParams.get("phaseId")

    if (!phaseId) {
      return NextResponse.json({ error: "Phase ID required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("project_timelines")
      .delete()
      .eq("id", phaseId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete phase error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete phase" },
      { status: 500 }
    )
  }
}

export async function GET(
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: phases, error } = await supabase
      .from("project_timelines")
      .select("*")
      .eq("idea_id", id)
      .order("phase_number", { ascending: true })

    if (error) throw error

    return NextResponse.json({ phases })
  } catch (error) {
    console.error("[v0] Get phases error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch phases" },
      { status: 500 }
    )
  }
}
