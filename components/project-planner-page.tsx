"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, CheckCircle2, Clock, Users, Zap, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Phase {
  name: string
  startMonth: number
  endMonth: number
  objectives: string[]
  deliverables: string[]
}

interface Task {
  title: string
  phase: string
  duration: number
  priority: string
}

interface Milestone {
  name: string
  month: number
}

interface TimelineData {
  phases: Phase[]
  tasks: Task[]
  milestones: Milestone[]
  resources: string[]
}

export default function ProjectPlannerPage() {
  const [formData, setFormData] = useState({
    projectTitle: "",
    description: "",
    timeline: 12,
    teamSize: 3,
  })
  const [timeline, setTimeline] = useState<TimelineData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "timeline" || name === "teamSize" ? Number.parseInt(value) : value,
    }))
  }

  const handleGenerateTimeline = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/projects/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to generate timeline")
        return
      }

      setTimeline(data)
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Timeline generation error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">AI Project Planner</h2>
        <p className="text-muted-foreground">
          Transform your business concept into an actionable implementation roadmap
        </p>
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
          <form onSubmit={handleGenerateTimeline} className="space-y-4 bg-card p-6 rounded-lg border border-border">
            <h3 className="font-bold text-foreground">Project Details</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Project Title</label>
              <input
                type="text"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleInputChange}
                placeholder="e.g., AI Learning Platform"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your startup idea..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Timeline (months)</label>
              <select
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={18}>18 months</option>
                <option value={24}>24 months</option>
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
              disabled={loading || !formData.projectTitle || !formData.description}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Timeline
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Timeline Display */}
        <div className="lg:col-span-2 space-y-6">
          {timeline ? (
            <>
              {/* Phases */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-foreground">Project Phases</h3>
                {timeline.phases.map((phase, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border bg-card space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Month {phase.startMonth} - {phase.endMonth}
                        </p>
                      </div>
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Objectives</p>
                        <ul className="text-sm text-foreground space-y-1 mt-1">
                          {phase.objectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Deliverables</p>
                        <ul className="text-sm text-foreground space-y-1 mt-1">
                          {phase.deliverables.map((del, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Milestones */}
              {timeline.milestones.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">Key Milestones</h3>
                  <div className="flex flex-wrap gap-2">
                    {timeline.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-sm font-medium text-primary"
                      >
                        <Clock className="w-4 h-4 inline mr-2" />
                        Month {milestone.month}: {milestone.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {timeline.resources.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-foreground">Required Resources</h3>
                  <div className="flex flex-wrap gap-2">
                    {timeline.resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 rounded-lg bg-accent/10 border border-accent/30 text-sm font-medium text-accent"
                      >
                        <Users className="w-4 h-4 inline mr-2" />
                        {resource}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Fill in your project details to generate a personalized timeline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
