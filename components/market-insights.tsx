"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp, ExternalLink } from "lucide-react"

interface Trend {
  title: string
  description: string
  source: string
  url: string
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

  useEffect(() => {
    if (selectedDomain) {
      fetchInsights()
    }
  }, [selectedDomain])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/market/insights?domain=${encodeURIComponent(selectedDomain)}`)
      const data = await response.json()
      setInsights([data])
    } catch (error) {
      console.error("Failed to fetch insights:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Market Insights</h2>

        {/* Domain filter */}
        {domains && domains.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {domains.map((domain) => (
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
      ) : insights.length > 0 ? (
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
                <a href={trend.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                  <Button variant="ghost" size="sm" className="gap-2">
                    Read <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No insights available for {selectedDomain}. Try another domain.</p>
          {domains && domains.length > 0 && (
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
