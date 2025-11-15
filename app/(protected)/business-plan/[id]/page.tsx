import { ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from 'next/navigation'
import BusinessPlanEditor from './business-plan-editor'

export const dynamic = "force-dynamic"

export default async function BusinessPlanEditorPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    const { data: idea, error } = await supabase
      .from("startup_ideas")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !idea) {
      console.error("[v0] Error fetching business plan:", error)
      redirect("/business-plan")
    }

    const { data: phases } = await supabase
      .from("project_timelines")
      .select("*")
      .eq("idea_id", id)
      .order("phase_number", { ascending: true })

    return <BusinessPlanEditor initialIdea={idea} timelinePhases={phases || []} />
  } catch (error) {
    console.error("[v0] Business plan page error:", error)
    redirect("/business-plan")
  }
}
