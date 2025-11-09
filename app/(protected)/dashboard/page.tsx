"use client"

import { useEffect, useState } from "react"
import { TrendingUp, BarChart3, Users2 } from "lucide-react"
import StatsCard from "@/components/stats-card"
import QuickStart from "@/components/quick-start"
import ProjectsGrid from "@/components/projects-grid"
import PopularTemplates from "@/components/popular-templates"
import MarketInsights from "@/components/market-insights"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [userDomains, setUserDomains] = useState<string[]>([])
  const [userName, setUserName] = useState("User")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    completionRate: 0,
    communityEngagement: 0,
    marketInsights: 0,
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("[v0] Auth error:", authError)
          setLoading(false)
          return
        }

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single()

        if (!userError && userData) {
          setUserName(userData.full_name || "User")
        }

        // Fetch user domains
        const { data: domainsData, error: domainsError } = await supabase
          .from("user_domains")
          .select("domain")
          .eq("user_id", user.id)

        if (!domainsError && domainsData) {
          const domains = domainsData.map((d) => d.domain)
          setUserDomains(domains)
        }

        // Total projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("startup_ideas")
          .select("id")
          .eq("user_id", user.id)

        if (!projectsError && projectsData) {
          setStats((prev) => ({
            ...prev,
            totalProjects: projectsData.length,
          }))
        }

        // Completion rate
        const { data: timelinesData, error: timelinesError } = await supabase
          .from("project_timelines")
          .select("progress_percentage")
          .eq("user_id", user.id)

        if (!timelinesError && timelinesData && timelinesData.length > 0) {
          const avgProgress =
            timelinesData.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / timelinesData.length
          setStats((prev) => ({
            ...prev,
            completionRate: Math.round(avgProgress),
          }))
        }

        // Community engagement
        const { data: discussionsData, error: discussionsError } = await supabase
          .from("discussions")
          .select("upvotes")
          .eq("user_id", user.id)

        if (!discussionsError && discussionsData) {
          const engagement = discussionsData.reduce((sum, d) => sum + (d.upvotes || 0), 0)
          setStats((prev) => ({
            ...prev,
            communityEngagement: engagement,
          }))
        }

        // Market insights count
        if (domainsData && domainsData.length > 0) {
          const { data: insightsData, error: insightsError } = await supabase
            .from("market_insights")
            .select("id")
            .in(
              "domain",
              domainsData.map((d) => d.domain),
            )

          if (!insightsError && insightsData) {
            setStats((prev) => ({
              ...prev,
              marketInsights: insightsData.length,
            }))
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
          trend={`+${Math.max(0, stats.totalProjects - 3)} vs last month`}
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Average project progress"
          trend="+12% vs last month"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
        />
        <StatsCard
          title="Community Engagement"
          value={stats.communityEngagement.toString()}
          description="Total interactions this month"
          trend="+18% vs last month"
          icon={<Users2 className="w-6 h-6 text-primary" />}
        />
        <StatsCard
          title="Market Insights"
          value={stats.marketInsights.toString()}
          description="New opportunities identified"
          trend="+24 vs last month"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <QuickStart />
          <ProjectsGrid />
          {!loading && userDomains.length > 0 && <MarketInsights domains={userDomains} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PopularTemplates />
        </div>
      </div>
    </div>
  )
}
