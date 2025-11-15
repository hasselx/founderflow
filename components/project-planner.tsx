"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Circle, Plus, Sparkles, AlertCircle, Edit2, Trash2, X } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Phase {
  id: string
  title: string
  status: "in progress" | "upcoming" | "completed"
  dateRange: string
  tasks: string
  progress: number
  objectives?: string
  deliverables?: string
}

interface TimelineData {
  phases: string
  taskBreakdown: string
}

export default function ProjectPlanner() {
  const [projectName, setProjectName] = useState("")
  const [timelineMonths, setTimelineMonths] = useState("6")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTimeline, setGeneratedTimeline] = useState<TimelineData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: "1",
      title: "Market Research & Validation",
      status: "in progress",
      dateRange: "Nov 4 - Nov 18",
      tasks: "5/8 tasks",
      progress: 65,
      objectives: "Validate market demand",
      deliverables: "Market research report"
    },
    {
      id: "2",
      title: "MVP Development",
      status: "upcoming",
      dateRange: "Nov 19 - Dec 9",
      tasks: "0/12 tasks",
      progress: 0,
      objectives: "Build minimum viable product",
      deliverables: "MVP application"
    },
    {
      id: "3",
      title: "User Testing & Feedback",
      status: "upcoming",
      dateRange: "Dec 10 - Dec 24",
      tasks: "0/6 tasks",
      progress: 0,
      objectives: "Gather user feedback",
      deliverables: "Feedback report"
    },
  ])

  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false)
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [newPhaseData, setNewPhaseData] = useState({
    title: "",
    status: "upcoming" as const,
    dateRange: "",
    tasks: "0/0 tasks",
    progress: 0,
    objectives: "",
    deliverables: "",
  })

  const handleGenerateTimeline = async () => {
    if (!projectName.trim()) {
      setError("Please describe your project first")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: projectName,
          timeline: timelineMonths,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate timeline")
      }

      const data = await response.json()
      setGeneratedTimeline(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate timeline")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddPhase = () => {
    if (!newPhaseData.title.trim()) {
      setError("Please enter a phase title")
      return
    }

    const phase: Phase = {
      id: Date.now().toString(),
      ...newPhaseData,
    }

    setPhases([...phases, phase])
    setNewPhaseData({
      title: "",
      status: "upcoming",
      dateRange: "",
      tasks: "0/0 tasks",
      progress: 0,
      objectives: "",
      deliverables: "",
    })
    setShowAddPhaseModal(false)
  }

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase)
    setNewPhaseData({
      title: phase.title,
      status: phase.status,
      dateRange: phase.dateRange,
      tasks: phase.tasks,
      progress: phase.progress,
      objectives: phase.objectives || "",
      deliverables: phase.deliverables || "",
    })
    setShowAddPhaseModal(true)
  }

  const handleSavePhase = () => {
    if (!newPhaseData.title.trim()) {
      setError("Please enter a phase title")
      return
    }

    if (editingPhase) {
      setPhases(
        phases.map((p) =>
          p.id === editingPhase.id
            ? { ...p, ...newPhaseData }
            : p
        )
      )
    } else {
      handleAddPhase()
      return
    }

    setNewPhaseData({
      title: "",
      status: "upcoming",
      dateRange: "",
      tasks: "0/0 tasks",
      progress: 0,
      objectives: "",
      deliverables: "",
    })
    setEditingPhase(null)
    setShowAddPhaseModal(false)
  }

  const handleDeletePhase = (id: string) => {
    setPhases(phases.filter((p) => p.id !== id))
  }

  const handleCloseModal = () => {
    setShowAddPhaseModal(false)
    setEditingPhase(null)
    setNewPhaseData({
      title: "",
      status: "upcoming",
      dateRange: "",
      tasks: "0/0 tasks",
      progress: 0,
      objectives: "",
      deliverables: "",
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Project Planner</h1>
        <p className="text-muted-foreground">
          Transform your business concept into actionable implementation roadmaps.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate AI Timeline</CardTitle>
          <CardDescription>Create a structured roadmap for your project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Project Description</label>
              <Input
                placeholder="Describe your project goals and scope..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Timeline (months)</label>
              <Input
                type="number"
                min="1"
                max="24"
                value={timelineMonths}
                onChange={(e) => setTimelineMonths(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleGenerateTimeline} disabled={!projectName || isGenerating} className="gap-2">
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Generating..." : "Generate Timeline"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-2xl font-bold text-primary">68%</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: "68%" }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-accent">127</p>
            <p className="text-xs text-muted-foreground mt-2">Out of 187 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Pending Deadlines</p>
            <p className="text-2xl font-bold text-orange-500">3</p>
            <p className="text-xs text-muted-foreground mt-2">Due this week</p>
          </CardContent>
        </Card>
      </div>

      {generatedTimeline && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generated Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Implementation Phases</h3>
              <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                {generatedTimeline.phases}
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-3">Task Breakdown - Phase 1</h3>
              <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground whitespace-pre-wrap">
                {generatedTimeline.taskBreakdown}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Track progress across all project phases</CardDescription>
            </div>
            <Button onClick={() => setShowAddPhaseModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Phase
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, idx) => (
              <div key={phase.id} className="relative">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Circle className="w-5 h-5 text-primary mb-4" fill="currentColor" />
                    {idx < phases.length - 1 && <div className="w-1 h-16 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{phase.title}</h3>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {phase.status === "in progress" ? "in progress" : phase.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditPhase(phase)}
                            title="Edit phase"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePhase(phase.id)}
                            title="Delete phase"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Dates</p>
                          <p className="text-foreground font-medium">{phase.dateRange}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Tasks</p>
                          <p className="text-foreground font-medium">{phase.tasks}</p>
                        </div>
                        <div className="md:col-span-2">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => console.log("[v0] View tasks for phase:", phase.id)}>
                        View Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full gap-2 bg-transparent"
              onClick={() => console.log("[v0] Add task clicked")}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAddPhaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>{editingPhase ? "Edit Phase" : "Add New Phase"}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCloseModal}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phase Title</label>
                <Input
                  value={newPhaseData.title}
                  onChange={(e) => setNewPhaseData({...newPhaseData, title: e.target.value})}
                  placeholder="e.g., MVP Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  value={newPhaseData.status}
                  onChange={(e) => setNewPhaseData({...newPhaseData, status: e.target.value as Phase["status"]})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                <Input
                  value={newPhaseData.dateRange}
                  onChange={(e) => setNewPhaseData({...newPhaseData, dateRange: e.target.value})}
                  placeholder="e.g., Nov 19 - Dec 9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Objectives</label>
                <Input
                  value={newPhaseData.objectives}
                  onChange={(e) => setNewPhaseData({...newPhaseData, objectives: e.target.value})}
                  placeholder="Phase objectives"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deliverables</label>
                <Input
                  value={newPhaseData.deliverables}
                  onChange={(e) => setNewPhaseData({...newPhaseData, deliverables: e.target.value})}
                  placeholder="Expected deliverables"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePhase}
                  className="flex-1"
                >
                  {editingPhase ? "Save Changes" : "Add Phase"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
