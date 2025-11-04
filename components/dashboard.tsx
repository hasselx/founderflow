"use client"

import { useEffect, useState } from "react"
import { TrendingUp, BarChart3, Users2 } from "lucide-react"
import StatsCard from "@/components/stats-card"
import QuickStart from "@/components/quick-start"
import ProjectsGrid from "@/components/projects-grid"
import PopularTemplates from "@/components/popular-templates"
import MarketInsights from "@/components/market-insights"
import RecommendedOpportunities from "@/components/recommended-opportunities"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function Dashboard() {
  const [userDomains, setUserDomains] = useState<string[]>([])
  const [userName, setUserName] = useState("User")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Auth error:", authError)
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
          value="17"
          description="Active ideas in development"
          trend="+3 vs last month"
          icon={<BarChart3 className="w-6 h-6 text-primary" />}
        />
        <StatsCard
          title="Completion Rate"
          value="68%"
          description="Average project progress"
          trend="+12% vs last month"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
        />
        <StatsCard
          title="Community Engagement"
          value="2.4k"
          description="Total interactions this month"
          trend="+18% vs last month"
          icon={<Users2 className="w-6 h-6 text-primary" />}
        />
        <StatsCard
          title="Market Insights"
          value="156"
          description="New opportunities identified"
          trend="+24 vs last month"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Start */}
          <QuickStart />
          <ProjectsGrid />

          {!loading && userDomains.length > 0 && <MarketInsights domains={userDomains} />}

          {!loading && <RecommendedOpportunities userRole="creator" domains={userDomains} />}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Templates */}
          <PopularTemplates />
        </div>
      </div>
    </div>
  )
}
