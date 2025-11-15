import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

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
        { error: "Not authorized to update this plan" },
        { status: 403 }
      )
    }

    const body = await request.json()

    const { error: updateError } = await supabase
      .from("startup_ideas")
      .update({
        title: body.title,
        description: body.description,
        problem: body.problem,
        solution: body.solution,
        target_market: body.target_market,
        business_model: body.business_model,
        value_proposition: body.value_proposition,
        estimated_funding: body.estimated_funding,
        team_size: body.team_size,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update business plan" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Business plan updated successfully",
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
