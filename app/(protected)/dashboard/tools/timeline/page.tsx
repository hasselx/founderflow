import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

export default async function TimelinePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <div>Not authenticated</div>

  // Fetch user's ideas
  const { data: ideas } = await supabase.from("startup_ideas").select("id, title").eq("user_id", user.id).limit(5)

  // Fetch timelines for user's ideas
  const ideaIds = ideas?.map((i) => i.id) || []
  const { data: timelines } =
    ideaIds.length > 0 ? await supabase.from("project_timelines").select("*").in("idea_id", ideaIds) : { data: [] }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <Link href="/project-planner" className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">Project Timeline</h1>
        <p className="text-muted-foreground mb-8">Track your project phases and milestones</p>

        {!timelines || timelines.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No project timelines yet. Create a startup idea first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {timelines.map((timeline) => (
              <Card key={timeline.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{timeline.phase_name}</CardTitle>
                  <CardDescription>
                    {timeline.start_date} to {timeline.end_date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Progress</span>
                      <span className="text-sm text-muted-foreground">{timeline.progress_percentage}%</span>
                    </div>
                    <Progress value={timeline.progress_percentage || 0} className="h-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Objectives</p>
                    <p className="text-sm text-muted-foreground">{timeline.objectives}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Deliverables</p>
                    <p className="text-sm text-muted-foreground">{timeline.deliverables}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
