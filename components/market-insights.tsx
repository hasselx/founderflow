"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, ExternalLink } from 'lucide-react'
import { getSupabaseClient } from "@/lib/supabase/client"

interface Trend {
  title: string
  description: string
  source: string
  url?: string
  date: string
}

interface MarketInsight {
  domain: string
  trends: Trend[]
  timestamp: string
}

export default function MarketInsights({ domains }: { domains?: string[] }) {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string>(domains?.[0] || "")
  const [allDomains, setAllDomains] = useState<string[]>([])

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase.from("user_domains").select("domain").eq("user_id", user.id)

        const uniqueDomains = Array.from(new Set(data?.map((d) => d.domain) || []))
        setAllDomains(uniqueDomains)
        if (uniqueDomains.length > 0 && !selectedDomain) {
          setSelectedDomain(uniqueDomains[0])
        }
        console.log("[v0] Fetched domains from DB:", uniqueDomains)
      } catch (error) {
        console.error("[v0] Error fetching domains:", error)
      }
    }

    fetchDomains()
    const interval = setInterval(fetchDomains, 3000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedDomain) {
      fetchInsights()
    }
  }, [selectedDomain])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/market/insights?domain=${encodeURIComponent(selectedDomain)}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Map API response to component format
      const trends =
        data.trends?.map((trend: any) => ({
          title: trend.title,
          description: trend.description || "",
          source: trend.source || "News Source",
          url: trend.url || "#",
          date: trend.date,
        })) || []

      setInsights([{ domain: selectedDomain, trends, timestamp: data.timestamp }])
    } catch (error) {
      console.error("[v0] Failed to fetch insights:", error)
      setInsights([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Market Insights</h2>

        {allDomains.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {allDomains.map((domain) => (
              <button
                key={domain}
                onClick={() => setSelectedDomain(domain)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDomain === domain
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : insights.length > 0 && insights[0].trends.length > 0 ? (
        <div className="grid gap-4">
          {insights[0].trends.map((trend, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent flex-shrink-0" />
                    <h3 className="font-bold text-foreground line-clamp-2">{trend.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{trend.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <span className="font-medium">{trend.source}</span>
                    <span>•</span>
                    <span>{new Date(trend.date).toLocaleDateString()}</span>
                  </div>
                </div>
                {trend.url && trend.url !== "#" && (
                  <a href={trend.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <Button variant="ghost" size="sm" className="gap-2">
                      Read <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            {selectedDomain ? `No market insights found for ${selectedDomain}. ` : "No domains selected. "}
            {selectedDomain
              ? "Try selecting a different industry or check back later."
              : "Try adding industries to your profile."}
          </p>
          {allDomains.length > 0 && selectedDomain && (
            <Button onClick={fetchInsights} className="mt-4 gap-2">
              <Loader2 className="h-4 w-4" />
              Retry
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
