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
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-primary hover:underline mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Business Plan</h1>
      <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-6 sm:mb-8">
        Create and manage comprehensive business plans for your startup ideas.
      </p>

      {ideas && ideas.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-4 sm:p-6 border border-border rounded-lg bg-card hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-2">{idea.title}</h3>
                {idea.status && (
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize whitespace-nowrap ml-2">
                    {idea.status}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-4 line-clamp-2">{idea.description}</p>
              <Link href={`/business-plan/${idea.id}`} className="inline-block w-full">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium">
                  Create Business Plan
                </button>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8 text-center">
          <p className="text-muted-foreground mb-4 text-xs sm:text-sm md:text-base">
            No startup ideas yet. Create one to get started with a business plan.
          </p>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm">
              Go to Dashboard
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
