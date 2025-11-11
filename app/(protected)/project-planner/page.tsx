import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function ProjectPlannerPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: ideas } = await supabase.from("startup_ideas").select("id, title").eq("user_id", user.id)

  const ideaIds = ideas?.map((i) => i.id) || []

  const { data: timelines } =
    ideaIds.length > 0
      ? await supabase
          .from("project_timelines")
          .select("id, phase_name, status, progress_percentage, idea_id, start_date, end_date")
          .in("idea_id", ideaIds)
          .order("created_at", { ascending: false })
      : { data: [] }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold text-foreground mb-2">Project Planner</h1>
      <p className="text-muted-foreground mb-8">Plan and track project timelines, phases, and milestones.</p>

      {timelines && timelines.length > 0 ? (
        <div className="space-y-4">
          {timelines.map((timeline) => {
            const ideaTitle = ideas?.find((i) => i.id === timeline.idea_id)?.title || "Unknown Project"
            return (
              <div key={timeline.id} className="p-6 border border-border rounded-lg bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{ideaTitle}</h3>
                    <p className="text-sm text-muted-foreground">{timeline.phase_name}</p>
                    {timeline.start_date && timeline.end_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(timeline.start_date).toLocaleDateString()} -{" "}
                        {new Date(timeline.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                    {timeline.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-foreground">{timeline.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${timeline.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No project timelines yet. Create a startup idea to set up project planning.
          </p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
