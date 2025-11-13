import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function BusinessPlanPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  const { data: ideas } = await supabase
    .from("startup_ideas")
    .select("id, title, description, created_at, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold text-foreground mb-2">Business Plan</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage comprehensive business plans for your startup ideas.
      </p>

      {ideas && ideas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-foreground">{idea.title}</h3>
                {idea.status && (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize">
                    {idea.status}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{idea.description}</p>
              <Link href={`/business-plan/${idea.id}`}>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Create Business Plan
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No startup ideas yet. Create one to get started with a business plan.
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
