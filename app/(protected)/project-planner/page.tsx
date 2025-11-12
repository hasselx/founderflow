import { getSupabaseServerClient } from "@/lib/supabase/server"
import ProjectPlannerClient from "./project-planner-client"

export const dynamic = "force-dynamic"

export default async function ProjectPlannerPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: domainsData } = await supabase.from("user_domains").select("domain").eq("user_id", user.id)
  const userDomains = domainsData?.map((d) => d.domain) || []

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

  return <ProjectPlannerClient timelines={timelines || []} ideas={ideas || []} />
}
