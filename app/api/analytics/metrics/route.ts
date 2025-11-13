import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: ideas } = await supabase.from("startup_ideas").select("id, status, created_at").eq("user_id", user.id)

    const { data: timelines } = await supabase
      .from("project_timelines")
      .select("progress_percentage, status")
      .eq("user_id", user.id)

    const { data: teamMembers } = await supabase.from("team_members").select("id").eq("user_id", user.id)

    const { data: budgets } = await supabase.from("budgets").select("amount").eq("user_id", user.id)

    // Calculate real metrics
    const totalIdeas = ideas?.length || 0
    const activeIdeas = ideas?.filter((i) => i.status === "active").length || 0
    const avgProgress =
      timelines && timelines.length > 0
        ? Math.round(timelines.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / timelines.length)
        : 0
    const totalTeamMembers = teamMembers?.length || 0
    const totalBudget = budgets?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0

    return NextResponse.json({
      metrics: [
        {
          label: "Project Progress",
          value: `${avgProgress}%`,
          change: `${activeIdeas} active ideas`,
        },
        {
          label: "Total Ideas",
          value: totalIdeas.toString(),
          change: `${activeIdeas} active`,
        },
        {
          label: "Team Members",
          value: totalTeamMembers.toString(),
          change: `${totalTeamMembers} contributors`,
        },
        {
          label: "Total Budget",
          value: `$${(totalBudget / 1000).toFixed(0)}K`,
          change: `${totalBudget > 0 ? "Funded" : "Not funded"}`,
        },
      ],
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
