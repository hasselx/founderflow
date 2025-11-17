import { NextResponse, NextRequest } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; timelineId: string }> }
) {
  try {
    const { timelineId } = await params
    
    if (!timelineId) {
      return NextResponse.json({ error: "Timeline ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data: tasks, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("timeline_id", timelineId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Supabase error fetching tasks:", error)
      throw new Error(`Failed to fetch tasks: ${error.message}`)
    }

    return NextResponse.json({ tasks: tasks || [] })
  } catch (error) {
    console.error("[v0] Get tasks error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to fetch tasks",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; timelineId: string }> }
) {
  try {
    const { id: businessPlanId, timelineId } = await params
    const body = await request.json()
    const supabase = await getSupabaseServerClient()

    if (!body.title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    const contributionPercentage = Math.min(100, Math.max(0, body.contribution_percentage || 0))
    const completionPercentage = Math.min(100, Math.max(0, body.completion_percentage || 0))

    const { data: task, error } = await supabase
      .from("project_tasks")
      .insert({
        timeline_id: timelineId,
        title: body.title,
        description: body.description || null,
        status: "pending",
        completion_percentage: completionPercentage,
        contribution_percentage: contributionPercentage,
        priority: body.priority || "medium",
        due_date: body.due_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Insert task error:", error)
      throw error
    }

    // Update phase progress based on task completion
    await updatePhaseProgressWeighted(supabase, timelineId)

    return NextResponse.json({ task })
  } catch (error) {
    console.error("[v0] Create task error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create task" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; timelineId: string }> }
) {
  try {
    const { timelineId } = await params
    const body = await request.json()
    const supabase = await getSupabaseServerClient()

    if (!body.id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const validStatuses = ["planned", "upcoming", "in_progress", "completed"]
    let normalizedStatus = body.status?.toLowerCase() || "planned"
    
    if (normalizedStatus === "in-progress") {
      normalizedStatus = "in_progress"
    }
    
    if (!validStatuses.includes(normalizedStatus)) {
      normalizedStatus = "planned"
    }

    console.log("[v0] Normalized status:", normalizedStatus)

    const updateData: any = {
      updated_at: new Date().toISOString(),
      status: normalizedStatus,
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.completion_percentage !== undefined) {
      updateData.completion_percentage = Math.min(100, Math.max(0, body.completion_percentage))
    }
    if (body.contribution_percentage !== undefined) {
      updateData.contribution_percentage = Math.min(100, Math.max(0, body.contribution_percentage))
    }
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.due_date !== undefined) updateData.due_date = body.due_date

    const { data: task, error } = await supabase
      .from("project_tasks")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    await updatePhaseProgressWeighted(supabase, timelineId)

    return NextResponse.json({ task })
  } catch (error) {
    console.error("[v0] Update task error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update task" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; timelineId: string }> }
) {
  try {
    const { timelineId } = await params
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId)

    if (error) throw error

    // Update phase progress after deletion
    await updatePhaseProgressWeighted(supabase, timelineId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete task error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete task" },
      { status: 500 }
    )
  }
}

// Helper function to update phase progress based on tasks
async function updatePhaseProgress(supabase: any, timelineId: string) {
  const { data: tasks } = await supabase
    .from("project_tasks")
    .select("completion_percentage")
    .eq("timeline_id", timelineId)

  if (tasks && tasks.length > 0) {
    const avgProgress = Math.round(
      tasks.reduce((sum: number, task: any) => sum + task.completion_percentage, 0) / tasks.length
    )

    await supabase
      .from("project_timelines")
      .update({ progress_percentage: avgProgress })
      .eq("id", timelineId)
  }
}

async function updatePhaseProgressWeighted(supabase: any, timelineId: string) {
  const { data: tasks } = await supabase
    .from("project_tasks")
    .select("completion_percentage, contribution_percentage")
    .eq("timeline_id", timelineId)

  if (tasks && tasks.length > 0) {
    // Calculate weighted progress: sum of (contribution% × completion%) for each task
    const weightedProgress = tasks.reduce((sum: number, task: any) => {
      return sum + (task.contribution_percentage / 100) * task.completion_percentage
    }, 0)

    await supabase
      .from("project_timelines")
      .update({ progress_percentage: Math.round(weightedProgress) })
      .eq("id", timelineId)
  }
}
