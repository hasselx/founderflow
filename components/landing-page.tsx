"use client"

import Link from "next/link"
import { ArrowRight, Zap, Users, TrendingUp, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function LandingPage() {
  const [stats, setStats] = useState({
    startups: 0,
    community: 0,
    funding: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient()

        // Fetch real stats from database
        const { data: startupData } = await supabase.from("startup_ideas").select("id", { count: "exact", head: true })

        const { data: discussionData } = await supabase.from("discussions").select("id", { count: "exact", head: true })

        const { data: portfolioData } = await supabase
          .from("portfolios")
          .select("financial_projections", { count: "exact" })

        let totalFunding = 0
        if (portfolioData) {
          totalFunding = portfolioData.reduce((sum: number, p: any) => {
            if (p.financial_projections?.estimated_funding) {
              return sum + p.financial_projections.estimated_funding
            }
            return sum
          }, 0)
        }

        setStats({
          startups: startupData?.length || 0,
          community: discussionData?.length || 0,
          funding: totalFunding,
        })
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                FF
              </div>
              <span className="hidden sm:inline text-xl font-bold text-foreground">FounderFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Turn Your Startup Idea Into{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Reality</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              AI-powered validation, market research, and planning tools for founders. Connect with co-founders,
              investors, and community members who believe in your vision.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {loading ? "..." : `${Math.max(stats.startups, 1)}+`}
              </div>
              <div className="text-sm text-muted-foreground">Startups Validated</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">
                {loading ? "..." : `${Math.max(stats.community, 1)}`}
              </div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
                {loading ? "..." : `$${(stats.funding / 1000000).toFixed(0)}M+`}
              </div>
              <div className="text-sm text-muted-foreground">Funding Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">From idea to execution, we've got you covered</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Validation</h3>
              <p className="text-muted-foreground">
                Get instant feedback on your idea with AI analysis of market fit, competition, and viability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Find Your Co-founder</h3>
              <p className="text-muted-foreground">
                Connect with complementary founders through our AI-powered matching system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Market Intelligence</h3>
              <p className="text-muted-foreground">
                Access real-time market trends, funding data, and competitive landscape analysis.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Project Planning</h3>
              <p className="text-muted-foreground">
                AI-generated roadmaps with timelines, milestones, and resource planning.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Community Support</h3>
              <p className="text-muted-foreground">
                Join discussions, get feedback, and network with other founders and mentors.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Investor Pitch Deck</h3>
              <p className="text-muted-foreground">
                Create professional pitch decks and portfolios to showcase your startup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Launch Your Startup?</h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of founders who are building the future with FounderFlow.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
              Get Started for Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-foreground mb-4">FounderFlow</h3>
              <p className="text-sm text-muted-foreground">Building the future of startup validation</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-primary">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 FounderFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
