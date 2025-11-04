"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Sparkles, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GeneratedContent {
  executiveSummary: string
  valueProposition: string
  targetMarket: string
}

export default function IdeaEntry() {
  const [idea, setIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError("Please describe your startup idea first")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()
      setGenerated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Submit New Idea</h1>
          <p className="text-muted-foreground">
            Describe your startup concept and let AI transform it into a structured business plan.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle>Idea Canvas</CardTitle>
            </div>
            <CardDescription>Start typing your idea - AI will help you refine it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Startup Idea</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your business idea, target market, and what problem you're solving..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background min-h-40"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted border border-border">
                <h3 className="font-semibold text-foreground text-sm mb-2">Executive Summary</h3>
                {generated ? (
                  <p className="text-xs text-foreground leading-relaxed">{generated.executiveSummary}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Auto-generated business summary</p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <h3 className="font-semibold text-foreground text-sm mb-2">Value Proposition</h3>
                {generated ? (
                  <p className="text-xs text-foreground leading-relaxed">{generated.valueProposition}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Key benefits and differentiators</p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border">
                <h3 className="font-semibold text-foreground text-sm mb-2">Target Market</h3>
                {generated ? (
                  <p className="text-xs text-foreground leading-relaxed">{generated.targetMarket}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Customer segments and TAM</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!idea || isGenerating} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent">
                <FileText className="w-4 h-4" />
                Save Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
