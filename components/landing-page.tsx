"use client"

import Link from "next/link"
import {
  ArrowRight,
  Zap,
  Users,
  TrendingUp,
  Lightbulb,
  Target,
  BarChart3,
  Rocket,
  FileText,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from "@/components/ui/marquee"

const features = [
  { name: "AI Idea Validation", icon: Lightbulb },
  { name: "Market Research", icon: BarChart3 },
  { name: "Competitor Analysis", icon: Target },
  { name: "Business Planning", icon: FileText },
  { name: "Project Roadmaps", icon: Rocket },
  { name: "Co-founder Matching", icon: Users },
  { name: "Pitch Deck Builder", icon: Zap },
  { name: "Community Support", icon: MessageSquare },
  { name: "Funding Tracker", icon: TrendingUp },
]

export default function LandingPage() {
  const [stats, setStats] = useState({
    startups: 0,
    community: 0,
    funding: 0,
  })
  const [loading, setLoading] = useState(true)

  const words = [
    { text: "Turn" },
    { text: "Your" },
    { text: "Startup" },
    { text: "Idea" },
    { text: "Into" },
    { text: "Reality", className: "text-primary dark:text-primary" },
  ]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient()

        if (!supabase) {
          console.log("[v0] Supabase client not available, skipping stats fetch")
          setLoading(false)
          return
        }

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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d2b81] text-white font-bold text-sm">
                FF
              </div>
              <span className="hidden sm:inline text-lg sm:text-xl font-bold text-foreground">FounderFlow</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 md:py-20 lg:py-24 sm:px-6 lg:px-8">
        <div className="space-y-6 sm:space-y-8 text-center">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <TypewriterEffect
                words={words}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
                cursorClassName="bg-primary"
              />
            </div>
            <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
              AI-powered validation, market research, and planning tools for founders. Connect with co-founders,
              investors, and community members who believe in your vision.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Link href="/auth/login">
              <Button size="sm" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
                Start Building <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="sm" variant="outline" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 sm:pt-8">
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {loading ? "..." : `${Math.max(stats.startups, 1)}+`}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Startups Validated</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-accent">
                {loading ? "..." : `${Math.max(stats.community, 1)}`}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {loading ? "..." : `$${(stats.funding / 1000000).toFixed(0)}M+`}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">Funding Tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-8 sm:py-12 border-y border-border/40 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6">
            Everything you need to launch your startup
          </p>
          <Marquee>
            <MarqueeFade side="left" />
            <MarqueeContent speed={30}>
              {features.map((feature, index) => (
                <MarqueeItem key={index} className="flex items-center gap-3 px-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{feature.name}</span>
                </MarqueeItem>
              ))}
            </MarqueeContent>
            <MarqueeFade side="right" />
          </Marquee>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
        <div className="space-y-12 sm:space-y-16">
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
              From idea to execution, we've got you covered
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Validation</h3>
              <p className="text-muted-foreground">
                Get instant feedback on your idea with AI analysis of market fit, competition, and viability.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Market Research</h3>
              <p className="text-muted-foreground">
                Access real-time market trends, funding data, and competitive landscape analysis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Competitor Analysis</h3>
              <p className="text-muted-foreground">Understand your competition and gain a strategic advantage.</p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Business Planning</h3>
              <p className="text-muted-foreground">Create comprehensive business plans with AI-driven insights.</p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Project Roadmaps</h3>
              <p className="text-muted-foreground">
                AI-generated roadmaps with timelines, milestones, and resource planning.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Co-founder Matching</h3>
              <p className="text-muted-foreground">
                Connect with complementary founders through our AI-powered matching system.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Pitch Deck Builder</h3>
              <p className="text-muted-foreground">
                Create professional pitch decks and portfolios to showcase your startup.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Community Support</h3>
              <p className="text-muted-foreground">
                Join discussions, get feedback, and network with other founders and mentors.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="space-y-4 rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Funding Tracker</h3>
              <p className="text-muted-foreground">Monitor and track your funding progress with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20 lg:py-24 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-12 text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Ready to Launch Your Startup?</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
            Join hundreds of founders who are building the future with FounderFlow.
          </p>
          <Link href="/auth/login">
            <Button size="sm" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90">
              Get Started for Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="font-bold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">FounderFlow</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Building the future of startup validation</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
              <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
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
              <h4 className="font-semibold text-foreground mb-2 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>
                  <a href="mailto:ihasselx@gmail.com" className="hover:text-primary">
                    ihasselx@gmail.com
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
            <p>&copy; 2025 FounderFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
