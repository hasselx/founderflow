import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function BusinessPlanEditorPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: idea } = await supabase
    .from("startup_ideas")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!idea) {
    redirect("/business-plan")
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/business-plan" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Business Plans
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{idea.title}</h1>
          <p className="text-muted-foreground">{idea.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Executive Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Executive Summary</h2>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Problem</h3>
                <p className="text-sm">{idea.problem || "Define the problem your startup solves"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Solution</h3>
                <p className="text-sm">{idea.solution || "Explain your solution"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Target Market</h3>
                <p className="text-sm">{idea.target_market || "Define your target market"}</p>
              </div>
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Business Model</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Revenue Model</h3>
                <p className="text-sm text-muted-foreground">
                  {idea.business_model || "Subscription, Freemium, or other"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Estimated Funding Needed</h3>
                <p className="text-sm text-muted-foreground">
                  ${idea.estimated_funding ? (idea.estimated_funding / 1000000).toFixed(1) + "M" : "TBD"}
                </p>
              </div>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Market Analysis</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Value Proposition</h3>
                <p className="text-sm text-muted-foreground">
                  {idea.value_proposition || "What makes your solution unique?"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Team Size</h3>
                <p className="text-sm text-muted-foreground">{idea.team_size || 0} members</p>
              </div>
            </div>
          </div>

          {/* Financial Projections */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Financial Projections</h2>
            <p className="text-sm text-muted-foreground">
              Build detailed financial projections for the next 3-5 years including revenue forecasts, expenses, and
              cash flow analysis.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Year 1 Revenue:</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Year 3 Revenue:</span>
                <span>TBD</span>
              </div>
              <div className="flex justify-between">
                <span>Break-even Point:</span>
                <span>TBD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 border border-accent rounded-lg p-6">
          <p className="text-sm text-foreground">
            💡 <strong>Tip:</strong> This is a draft business plan generated from your startup idea. Use this as a
            starting point and refine each section with detailed research and analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
