"use client"

import type React from "react"

import { useState } from "react"
import { Download, Loader2, AlertCircle, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PortfolioContent {
  problemStatement: string
  solution: string
  targetMarket: string
  marketOpportunity: string
  businessModel: string
  traction: string
  teamSummary: string
  fundingUse: string
  projection: string
}

export default function PortfolioBuilderPage() {
  const [formData, setFormData] = useState({
    startupName: "",
    description: "",
    marketSize: "",
    businessModel: "",
    teamSize: 3,
  })
  const [portfolio, setPortfolio] = useState<PortfolioContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public" | "investor">("private")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "teamSize" ? Number.parseInt(value) : value,
    }))
  }

  const handleGeneratePortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok && !data.pitchContent) {
        setError(data.error || "Failed to generate portfolio")
        return
      }

      setPortfolio(data.pitchContent || data)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Portfolio generation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!portfolio) return

    const content = `
STARTUP PORTFOLIO - ${formData.startupName}

PROBLEM STATEMENT
${portfolio.problemStatement}

SOLUTION
${portfolio.solution}

TARGET MARKET
${portfolio.targetMarket}

MARKET OPPORTUNITY
${portfolio.marketOpportunity}

BUSINESS MODEL
${portfolio.businessModel}

TRACTION
${portfolio.traction}

TEAM SUMMARY
${portfolio.teamSummary}

USE OF FUNDS
${portfolio.fundingUse}

PROJECTIONS
${portfolio.projection}
    `

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content))
    element.setAttribute("download", `${formData.startupName}-portfolio.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Startup Portfolio Builder</h2>
        <p className="text-muted-foreground">Create a professional pitch deck and startup portfolio</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleGeneratePortfolio} className="space-y-4 bg-card p-6 rounded-lg border border-border">
            <h3 className="font-bold text-foreground">Startup Details</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Startup Name</label>
              <input
                type="text"
                name="startupName"
                value={formData.startupName}
                onChange={handleInputChange}
                placeholder="e.g., TechAI Solutions"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="What does your startup do?"
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Market Size</label>
              <input
                type="text"
                name="marketSize"
                value={formData.marketSize}
                onChange={handleInputChange}
                placeholder="e.g., $10 billion TAM"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Business Model</label>
              <select
                name="businessModel"
                value={formData.businessModel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a model</option>
                <option value="SaaS">SaaS</option>
                <option value="Marketplace">Marketplace</option>
                <option value="Freemium">Freemium</option>
                <option value="Subscription">Subscription</option>
                <option value="Licensing">Licensing</option>
                <option value="Advertising">Advertising</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Team Size</label>
              <select
                name="teamSize"
                value={formData.teamSize}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Solo Founder</option>
                <option value={2}>2 People</option>
                <option value={3}>3 People</option>
                <option value={5}>5+ People</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.startupName || !formData.description}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Generate Portfolio
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Portfolio Preview */}
        <div className="lg:col-span-2 space-y-6">
          {portfolio ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 rounded-lg bg-primary/5 border border-primary/20">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{formData.startupName}</h3>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
                    >
                      <option value="private">Private</option>
                      <option value="investor">Investor Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                  <Button size="sm" variant="outline" onClick={handleDownloadPDF}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Problem Statement", key: "problemStatement" },
                  { label: "Solution", key: "solution" },
                  { label: "Target Market", key: "targetMarket" },
                  { label: "Market Opportunity", key: "marketOpportunity" },
                  { label: "Business Model", key: "businessModel" },
                  { label: "Traction", key: "traction" },
                  { label: "Team Summary", key: "teamSummary" },
                  { label: "Use of Funds", key: "fundingUse" },
                ].map((section) => (
                  <div key={section.key} className="p-4 rounded-lg border border-border bg-card space-y-2">
                    <h4 className="font-semibold text-foreground">{section.label}</h4>
                    <p className="text-sm text-muted-foreground">{portfolio[section.key as keyof PortfolioContent]}</p>
                  </div>
                ))}
              </div>

              {/* Projections */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <h4 className="font-semibold text-foreground">Financial Projections</h4>
                <p className="text-sm text-muted-foreground">{portfolio.projection}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Fill in your startup details to generate a professional portfolio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
