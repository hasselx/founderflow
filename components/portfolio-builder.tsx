"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit3, Share2, Download, Eye, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PitchContent {
  executiveSummary: string
  pitchOutline: string
  investorPitch: string
}

export default function PortfolioBuilder() {
  const [startupInfo, setStartupInfo] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchContent, setPitchContent] = useState<PitchContent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [privacy, setPrivacy] = useState("investor")

  const handleGeneratePitch = async () => {
    if (!startupInfo.trim()) {
      setError("Please describe your startup to generate a pitch")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupInfo }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate pitch")
      }

      const data = await response.json()
      setPitchContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate pitch")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Startup Portfolio</h1>
        <p className="text-muted-foreground">
          Create a professional pitch deck and shareable portfolio for your startup.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate Pitch Deck</CardTitle>
              <CardDescription>AI-powered pitch generation for investors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Startup Description</label>
                <textarea
                  value={startupInfo}
                  onChange={(e) => setStartupInfo(e.target.value)}
                  placeholder="Describe your startup: what problem you solve, your solution, target market, etc."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-24"
                />
              </div>
              <Button onClick={handleGeneratePitch} disabled={!startupInfo || isGenerating} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate Pitch"}
              </Button>
            </CardContent>
          </Card>

          {pitchContent && (
            <Card className="mb-6">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">AI Learning Platform</CardTitle>
                    <CardDescription>Personalized education using machine learning</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Market Size
                    </label>
                    <p className="text-2xl font-bold text-foreground">$25.7B</p>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      Target Users
                    </label>
                    <p className="text-2xl font-bold text-foreground">500k</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Executive Summary</label>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {pitchContent.executiveSummary}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Investor Pitch</label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {pitchContent.investorPitch}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Pitch Deck Outline</label>
                  <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                    {pitchContent.pitchOutline}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Portfolio Pages</CardTitle>
              <CardDescription>Add and customize sections for your startup pitch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Overview", "Market Opportunity", "Product", "Team", "Financial Projections", "Contact"].map(
                  (page, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">{page}</span>
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Portfolio Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gap-2 bg-transparent" variant="outline">
                <Share2 className="w-4 h-4" />
                Share Portfolio
              </Button>
              <Button className="w-full gap-2 bg-transparent" variant="outline">
                <Download className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button className="w-full gap-2 bg-transparent" variant="outline">
                View Public Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacy === "public"}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Public</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    value="investor"
                    checked={privacy === "investor"}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Investor Only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacy === "private"}
                    onChange={(e) => setPrivacy(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Private</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
