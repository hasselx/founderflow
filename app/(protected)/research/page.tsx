"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function ResearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userDomains, setUserDomains] = useState<string[]>([])

  useEffect(() => {
    const fetchUserDomains = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data } = await supabase.from("user_domains").select("domain").eq("user_id", user.id)

        if (data) {
          setUserDomains(data.map((d) => d.domain))
        }
      } catch (error) {
        console.error("[v0] Error fetching domains:", error)
      }
    }

    fetchUserDomains()
  }, [])

  useEffect(() => {
    const fetchInsights = async () => {
      if (userDomains.length === 0) return

      setLoading(true)
      try {
        const domainToSearch = searchQuery.trim() || userDomains[0]
        const response = await fetch(`/api/market/insights?domain=${encodeURIComponent(domainToSearch)}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setInsights(data.trends || [])
      } catch (error) {
        console.error("[v0] Error fetching insights:", error)
        setInsights([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchInsights, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, userDomains])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Market Research</h1>
          <p className="text-muted-foreground">Explore trends and validate your business concept</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search market insights, trends, and opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No market insights found. Try searching for different topics or industries.
              </CardContent>
            </Card>
          ) : (
            insights.map((insight, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="line-clamp-2">{insight.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{insight.source}</p>
                    </div>
                    {insight.url && insight.url !== "#" && (
                      <a href={insight.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          Read
                        </Button>
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground line-clamp-3">{insight.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(insight.date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
