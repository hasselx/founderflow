import { TrendingUp, BarChart3, Users2 } from "lucide-react"
import StatsCard from "@/components/stats-card"
import QuickStart from "@/components/quick-start"
import ProjectsGrid from "@/components/projects-grid"
import PopularTemplates from "@/components/popular-templates"
import MarketInsights from "@/components/market-insights"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Not authenticated</div>
  }

  try {
    const [userDataResult, domainsDataResult, projectsDataResult, discussionsDataResult] = await Promise.all([
      supabase.from("users").select("full_name").eq("id", user.id).single(),
      supabase.from("user_domains").select("domain").eq("user_id", user.id),
      supabase.from("startup_ideas").select("id").eq("user_id", user.id),
      supabase.from("discussions").select("upvotes").eq("user_id", user.id),
    ])

    const userName = userDataResult.data?.full_name || "User"
    const domainsData = domainsDataResult.data || []
    const userDomains = Array.from(new Set(domainsData.map((d) => d.domain)))
    const projectsData = projectsDataResult.data || []
    const discussionsData = discussionsDataResult.data || []

    let timelinesData = []
    if (projectsData.length > 0) {
      const ideaIds = projectsData.map((p) => p.id)
      const { data: timelines } = await supabase
        .from("project_timelines")
        .select("progress_percentage")
        .in("idea_id", ideaIds)

      timelinesData = timelines || []
    }

    let marketInsights = 0
    if (userDomains.length > 0) {
      const { data: insightsData } = await supabase.from("market_insights").select("id").in("domain", userDomains)

      marketInsights = insightsData?.length || 0
    }

    const totalProjects = projectsData.length || 0
    const completionRate =
      timelinesData && timelinesData.length > 0
        ? Math.round(timelinesData.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / timelinesData.length)
        : 0
    const communityEngagement = discussionsData.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0

    const stats = {
      totalProjects,
      completionRate,
      communityEngagement,
      marketInsights,
    }

    const projectsTrend = totalProjects > 0 ? `+${Math.max(0, totalProjects - 1)} vs last month` : "+0 vs last month"
    const completionTrend = completionRate > 0 ? `+${completionRate}% vs last month` : "+0% vs last month"
    const engagementTrend = communityEngagement > 0 ? `+${communityEngagement} vs last month` : "+0 vs last month"
    const insightsTrend = marketInsights > 0 ? `+${marketInsights} vs last month` : "+0 vs last month"

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your startup journey today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects.toString()}
            description="Active ideas in development"
            trend={projectsTrend}
            icon={<BarChart3 className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            description="Average project progress"
            trend={completionTrend}
            icon={<TrendingUp className="w-6 h-6 text-accent" />}
          />
          <StatsCard
            title="Community Engagement"
            value={stats.communityEngagement.toString()}
            description="Total interactions this month"
            trend={engagementTrend}
            icon={<Users2 className="w-6 h-6 text-primary" />}
          />
          <StatsCard
            title="Market Insights"
            value={stats.marketInsights.toString()}
            description="New opportunities identified"
            trend={insightsTrend}
            icon={<TrendingUp className="w-6 h-6 text-accent" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <QuickStart />
            <ProjectsGrid />
            {userDomains.length > 0 && <MarketInsights domains={userDomains} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PopularTemplates />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h2>
          <p className="text-red-700">Unable to load dashboard data. Please refresh the page or try again later.</p>
        </div>
      </div>
    )
  }
}
