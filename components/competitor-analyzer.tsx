"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Sparkles, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CompetitorData {
  marketInsights: string
  competitiveAnalysis: string
}

export default function CompetitorAnalyzer() {
  const [industry, setIndustry] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CompetitorData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const competitors = [
    {
      name: "EdTech Platform A",
      match: 87,
      funding: "$2.3M",
      users: "50k+",
      status: "Series A",
    },
    {
      name: "Learning Platform B",
      match: 82,
      funding: "$1.5M",
      users: "30k+",
      status: "Series A",
    },
    {
      name: "AI Education C",
      match: 75,
      funding: "$5M",
      users: "100k+",
      status: "Series B",
    },
  ]

  const handleAnalyze = async () => {
    if (!industry.trim()) {
      setError("Please enter an industry to analyze")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze competitors")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze competitors")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Market Research & Competitor Analysis</h1>
        <p className="text-muted-foreground">Discover similar ventures and validate your market opportunity.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Search Market</CardTitle>
            <CardDescription>Enter an industry to analyze market trends and competitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AI-powered education, sustainable logistics..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              />
              <Button onClick={handleAnalyze} disabled={!industry || isAnalyzing} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Market Growth</p>
              <p className="text-3xl font-bold text-primary mb-1">23.4%</p>
              <p className="text-xs text-muted-foreground">Year over year</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Avg Funding</p>
              <p className="text-3xl font-bold text-accent mb-1">$2.3M</p>
              <p className="text-xs text-muted-foreground">Series A median</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Similar Ventures</p>
              <p className="text-3xl font-bold text-primary mb-1">156</p>
              <p className="text-xs text-muted-foreground">in this category</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Market Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                {analysis.marketInsights}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg">Competitive Landscape</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                {analysis.competitiveAnalysis}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Similar Competitors</CardTitle>
              <CardDescription>Based on your AI Learning Platform idea</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((comp, idx) => (
              <div key={idx} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{comp.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {comp.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">{comp.match}% Match</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Funding</p>
                    <p className="font-semibold text-foreground">{comp.funding}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Users</p>
                    <p className="font-semibold text-foreground">{comp.users}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Segment</p>
                    <p className="font-semibold text-foreground">EdTech</p>
                  </div>
                  <div className="text-right">
                    <Button size="sm" variant="outline">
                      Analyze
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
