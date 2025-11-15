"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Edit, Save, X, Loader2, AlertCircle } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface IdeaData {
  id: string
  title: string
  description: string
  problem: string | null
  solution: string | null
  target_market: string | null
  business_model: string | null
  value_proposition: string | null
  estimated_funding: number | null
  team_size: number | null
}

interface TimelinePhase {
  id: string
  phase_name: string
  phase_number: number
  start_date: string
  end_date: string
  objectives: string | null
  deliverables: string | null
  resources_needed: string | null
  progress_percentage: number
  status: string
}

interface BusinessPlanEditorProps {
  initialIdea: IdeaData
  timelinePhases: TimelinePhase[]
}

export default function BusinessPlanEditor({
  initialIdea,
  timelinePhases,
}: BusinessPlanEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(initialIdea)
  const [phases, setPhases] = useState<TimelinePhase[]>(timelinePhases)
  const [addingPhase, setAddingPhase] = useState(false)
  const [newPhase, setNewPhase] = useState({
    phase_name: "",
    start_date: "",
    end_date: "",
    objectives: "",
    deliverables: "",
    resources_needed: "",
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "estimated_funding" || name === "team_size"
          ? value
            ? Number.parseInt(value)
            : null
          : value,
    }))
  }

  const handleSave = async () => {
    setError("")
    setSaving(true)

    try {
      const res = await fetch(`/api/business-plan/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to save business plan")
        return
      }

      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Save error:", err)
      setError("Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleAddPhase = async () => {
    if (
      !newPhase.phase_name ||
      !newPhase.start_date ||
      !newPhase.end_date
    ) {
      setError("Please fill in phase name and dates")
      return
    }

    setSaving(true)
    setError("")

    try {
      console.log("[v0] Adding phase with data:", newPhase)
      const res = await fetch(`/api/business-plan/${formData.id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPhase,
          phase_number: phases.length + 1,
        }),
      })

      const data = await res.json()
      console.log("[v0] API Response:", data)

      if (!res.ok) {
        console.error("[v0] API Error:", data)
        setError(data.error || "Failed to add phase")
        return
      }

      setPhases([...phases, data.phase])
      setNewPhase({
        phase_name: "",
        start_date: "",
        end_date: "",
        objectives: "",
        deliverables: "",
        resources_needed: "",
      })
      setAddingPhase(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Add phase error:", err)
      setError(err instanceof Error ? err.message : "Failed to add phase")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        href="/business-plan"
        className="flex items-center gap-2 text-primary hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Business Plans
      </Link>

      {/* Header with Edit/Save Buttons */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="text-4xl font-bold text-foreground w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            />
          ) : (
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {formData.title}
            </h1>
          )}

          {isEditing ? (
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={2}
            />
          ) : (
            <p className="text-muted-foreground">{formData.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setFormData(initialIdea)
                  setError("")
                }}
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
          Changes saved successfully!
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">
        {/* Executive Summary & Business Model */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Executive Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Executive Summary
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Problem
                </label>
                {isEditing ? (
                  <textarea
                    name="problem"
                    value={formData.problem || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.problem || "Define the problem your startup solves"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Solution
                </label>
                {isEditing ? (
                  <textarea
                    name="solution"
                    value={formData.solution || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.solution || "Explain your solution"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Target Market
                </label>
                {isEditing ? (
                  <textarea
                    name="target_market"
                    value={formData.target_market || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.target_market || "Define your target market"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Business Model
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Value Proposition
                </label>
                {isEditing ? (
                  <textarea
                    name="value_proposition"
                    value={formData.value_proposition || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.value_proposition ||
                      "What makes your solution unique?"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Business Model Type
                </label>
                {isEditing ? (
                  <select
                    name="business_model"
                    value={formData.business_model || ""}
                    onChange={handleInputChange}
                    aria-label="Business Model Type"
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Select a model</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Marketplace">Marketplace</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Advertising">Advertising</option>
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.business_model || "Subscription, Freemium, or other"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Estimated Funding Needed
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="estimated_funding"
                    value={formData.estimated_funding ? formData.estimated_funding / 1000000 : ""}
                    onChange={(e) => {
                      const value = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        estimated_funding: value ? Number.parseFloat(value) * 1000000 : null,
                      }))
                    }}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Amount in millions"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    $
                    {formData.estimated_funding
                      ? (formData.estimated_funding / 1000000).toFixed(1) + "M"
                      : "TBD"}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Team Size
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="team_size"
                    value={formData.team_size || ""}
                    onChange={handleInputChange}
                    className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.team_size || 0} members
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Timeline Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">
              Project Timeline & Resources
            </h2>
            {isEditing && (
              <Button
                onClick={() => setAddingPhase(!addingPhase)}
                size="sm"
                variant="outline"
              >
                {addingPhase ? "Cancel" : "Add Phase"}
              </Button>
            )}
          </div>

          {/* Add Phase Form */}
          {addingPhase && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Add New Phase</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Phase Name
                  </label>
                  <Input
                    type="text"
                    value={newPhase.phase_name}
                    onChange={(e) =>
                      setNewPhase({ ...newPhase, phase_name: e.target.value })
                    }
                    placeholder="e.g., MVP Development"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={newPhase.start_date}
                    onChange={(e) =>
                      setNewPhase({ ...newPhase, start_date: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={newPhase.end_date}
                    onChange={(e) =>
                      setNewPhase({ ...newPhase, end_date: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Objectives
                </label>
                <Textarea
                  value={newPhase.objectives}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, objectives: e.target.value })
                  }
                  placeholder="What are the main objectives for this phase?"
                  rows={3}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Deliverables
                </label>
                <Textarea
                  value={newPhase.deliverables}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, deliverables: e.target.value })
                  }
                  placeholder="What are the key deliverables?"
                  rows={3}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Resources Needed
                </label>
                <Textarea
                  value={newPhase.resources_needed}
                  onChange={(e) =>
                    setNewPhase({
                      ...newPhase,
                      resources_needed: e.target.value,
                    })
                  }
                  placeholder="Budget, team members, tools, etc."
                  rows={3}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={handleAddPhase}
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
              >
                {saving ? "Adding..." : "Add Phase"}
              </Button>
            </div>
          )}

          {/* Phases List */}
          <div className="space-y-4">
            {phases.length > 0 ? (
              phases.map((phase, idx) => (
                <div
                  key={phase.id}
                  className="bg-card border border-border rounded-lg p-6 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">
                        Phase {phase.phase_number}: {phase.phase_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(phase.start_date).toLocaleDateString()} -{" "}
                        {new Date(phase.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {phase.progress_percentage}% Complete
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {phase.objectives && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Objectives
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {phase.objectives}
                        </p>
                      </div>
                    )}
                    {phase.deliverables && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Deliverables
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {phase.deliverables}
                        </p>
                      </div>
                    )}
                    {phase.resources_needed && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Resources Needed
                        </h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {phase.resources_needed}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
                <p>No phases added yet. Add one to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-accent/10 border border-accent rounded-lg p-6">
          <p className="text-sm text-foreground">
            💡 <strong>Tip:</strong> Use the Edit button to update your business
            plan details, add timeline phases with objectives and deliverables, and
            plan your resources. This information helps you stay aligned with your
            startup goals.
          </p>
        </div>
      </div>
    </div>
  )
}
