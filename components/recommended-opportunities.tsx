"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Users } from "lucide-react"

interface MarketOpportunity {
  title: string
  description: string
  marketGrowth: string
  avgFunding: string
  relatedTags: string[]
}

interface SimilarStartup {
  name: string
  description: string
  fundingRaised: string
  founders: string[]
  matchPercentage: number
}

interface Recommendation {
  marketOpportunity: MarketOpportunity
  similarStartups: SimilarStartup[]
}

export default function RecommendedOpportunities({
  ideaDescription,
  userRole,
  domains,
}: {
  ideaDescription?: string
  userRole?: string
  domains?: string[]
}) {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchRecommendations = async () => {
    if (!ideaDescription) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/market/recommended", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaDescription,
          userRole: userRole || "creator",
          domains: domains || [],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recommendations")
      }

      setRecommendations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [ideaDescription])

  if (!ideaDescription) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Recommended for You</h2>
        <p className="text-muted-foreground">Based on your startup idea and interests</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="p-6 bg-destructive/10 text-destructive">{error}</Card>
      ) : recommendations ? (
        <div className="space-y-6">
          {/* Market Opportunity */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Market Opportunity</h3>
            <Card className="p-6 border-2 border-accent/50">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-foreground">{recommendations.marketOpportunity.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{recommendations.marketOpportunity.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Market Growth</p>
                    <p className="text-lg font-bold text-accent">{recommendations.marketOpportunity.marketGrowth}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Avg Funding</p>
                    <p className="text-lg font-bold text-primary">{recommendations.marketOpportunity.avgFunding}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recommendations.marketOpportunity.relatedTags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Similar Startups */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Similar Startups</h3>
            <div className="space-y-3">
              {recommendations.similarStartups.map((startup, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-foreground">{startup.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{startup.description}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-muted-foreground">Match</p>
                        <p className="text-xl font-bold text-accent">{startup.matchPercentage}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Funding Raised</p>
                        <p className="font-semibold text-foreground">{startup.fundingRaised}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> Founders
                        </p>
                        <p className="font-semibold text-foreground">{startup.founders.length}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
