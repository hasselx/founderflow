"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar, CheckSquare, Users, BarChart3, Bell, Plus, X, Loader2 } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarWithEvents } from "@/components/calendar-with-events"

interface Timeline {
  id: string
  phase_name: string
  status: string
  progress_percentage: number
  idea_id: string
  start_date: string
  end_date: string
  total_tasks?: number
}

interface Idea {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  description: string | null
  completion_percentage: number
  contribution_percentage: number
  status: string
  priority: string
  due_date: string | null
}

export default function ProjectPlannerClient({ 
  timelines: initialTimelines, 
  ideas 
}: { 
  timelines: Timeline[]
  ideas: Idea[] 
}) {
  const [timelines, setTimelines] = useState<Timeline[]>(initialTimelines)
  const [addPhaseOpen, setAddPhaseOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [phaseFilter, setPhaseFilter] = useState<string>("all")

  const [newPhase, setNewPhase] = useState({
    phase_name: "",
    idea_id: "",
    start_date: "",
    end_date: "",
    total_tasks: 0,
    objectives: "",
    deliverables: "",
    resources_needed: "",
  })

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    completion_percentage: 0,
    contribution_percentage: 0,
    status: "pending",
    priority: "medium",
    due_date: "",
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const totalTasks = timelines?.length || 0
  const completedTasks = timelines?.filter((t) => t.status === "completed").length || 0
  const overallProgress = useMemo(() => {
    if (!timelines || timelines.length === 0) return 0
    return Math.round(
      timelines.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / timelines.length
    )
  }, [timelines])
  const pendingDeadlines = timelines?.filter((t) => t.status === "in_progress").length || 0

  const projectTools = [
    { name: "Timeline", icon: Calendar, href: "/dashboard/tools/timeline" },
    { name: "Tasks", icon: CheckSquare, href: "/dashboard/tools/tasks" },
    { name: "Resources", icon: Users, href: "/dashboard/tools/resources" },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/tools/analytics" },
    { name: "Notifications", icon: Bell, href: "/dashboard/tools/notifications" },
  ]

  const loadTasks = async (timelineId: string) => {
    try {
      const ideaId = timelines.find(t => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${timelineId}/tasks`)
      const data = await res.json()
      
      if (res.ok) {
        setTasks(prev => ({ ...prev, [timelineId]: data.tasks || [] }))
      }
    } catch (err) {
      console.error("[v0] Load tasks error:", err)
    }
  }

  const handleAddPhase = async () => {
    if (!newPhase.phase_name || !newPhase.idea_id || !newPhase.start_date || !newPhase.end_date) {
      setError("Please fill in all required fields")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/business-plan/${newPhase.idea_id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPhase,
          phase_number: timelines.length + 1,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add phase")
        return
      }

      setTimelines([...timelines, data.phase])
      setNewPhase({
        phase_name: "",
        idea_id: "",
        start_date: "",
        end_date: "",
        total_tasks: 0,
        objectives: "",
        deliverables: "",
        resources_needed: "",
      })
      setAddPhaseOpen(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Add phase error:", err)
      setError("Failed to add phase")
    } finally {
      setSaving(false)
    }
  }

  const handleAddTask = async () => {
    if (!selectedTimeline || !newTask.title) {
      setError("Please fill in the task title")
      return
    }

    setSaving(true)
    setError("")

    try {
      const ideaId = timelines.find(t => t.id === selectedTimeline)?.idea_id
      if (!ideaId) {
        setError("Timeline not found")
        return
      }

      const res = await fetch(
        `/api/business-plan/${ideaId}/timeline/${selectedTimeline}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add task")
        return
      }

      await loadTasks(selectedTimeline)
      setNewTask({
        title: "",
        description: "",
        completion_percentage: 0,
        contribution_percentage: 0,
        status: "pending",
        priority: "medium",
        due_date: "",
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Add task error:", err)
      setError("Failed to add task")
    } finally {
      setSaving(false)
    }
  }

  const recalculateProgress = async (timelineId: string) => {
    try {
      const ideaId = timelines.find(t => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const timelineRes = await fetch(`/api/business-plan/${ideaId}/timeline`)
      const timelineData = await timelineRes.json()
      if (timelineData.timelines) {
        setTimelines(timelineData.timelines)
      }
    } catch (err) {
      console.error("[v0] Recalculate progress error:", err)
    }
  }

  const handleUpdateTaskStatus = async (
    timelineId: string,
    taskId: string,
    newStatus: string
  ) => {
    const phaseTasks = tasks[timelineId] || []
    const updatedTasks = phaseTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    )
    setTasks(prev => ({ ...prev, [timelineId]: updatedTasks }))

    try {
      const ideaId = timelines.find(t => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const completionMap: Record<string, number> = {
        'planned': 0,
        'upcoming': 25,
        'in_progress': 50,
        'completed': 100
      }
      
      const res = await fetch(
        `/api/business-plan/${ideaId}/timeline/${timelineId}/tasks`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: taskId,
            status: newStatus,
            completion_percentage: completionMap[newStatus] || 0,
          }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        await Promise.all([
          loadTasks(timelineId),
          recalculateProgress(timelineId)
        ])
      } else {
        setTasks(prev => ({ ...prev, [timelineId]: phaseTasks }))
        setError(data.error || "Failed to update task status")
      }
    } catch (err) {
      setTasks(prev => ({ ...prev, [timelineId]: phaseTasks }))
      console.error("[v0] Update task status error:", err)
      setError("Failed to update task status")
    }
  }

  const getFilteredTimelines = () => {
    let filtered = [...timelines]
    
    if (phaseFilter === "relevant") {
      const now = new Date()
      filtered.sort((a, b) => {
        const aDate = new Date(a.end_date)
        const bDate = new Date(b.end_date)
        const aDiff = Math.abs(aDate.getTime() - now.getTime())
        const bDiff = Math.abs(bDate.getTime() - now.getTime())
        return aDiff - bDiff
      })
    } else if (phaseFilter === "date-added") {
      filtered.sort((a, b) => b.id.localeCompare(a.id))
    }
    
    return filtered
  }

  const getCalendarEvents = () => {
    const events: any[] = []
    timelines.forEach(timeline => {
      const phaseTasks = tasks[timeline.id] || []
      phaseTasks.forEach(task => {
        if (task.due_date) {
          events.push({
            id: task.id,
            title: task.title,
            date: new Date(task.due_date),
            status: task.status,
          })
        }
      })
    })
    return events
  }

  useEffect(() => {
    timelines.forEach(timeline => loadTasks(timeline.id))
    
    // Auto-refresh progress every 2 seconds to reflect real-time updates
    const refreshInterval = setInterval(() => {
      timelines.forEach(timeline => recalculateProgress(timeline.id))
    }, 2000)
    
    return () => clearInterval(refreshInterval)
  }, [timelines.length])

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`transition-all duration-300 border-r border-border bg-card p-4 flex-shrink-0 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between mb-6">
          {sidebarOpen && <h2 className="text-lg font-bold text-foreground">Project Tools</h2>}
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <nav className="space-y-2 flex-1">
          {projectTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors ${!sidebarOpen && 'justify-center'}`}
              title={tool.name}
            >
              <tool.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{tool.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Project Planner</h1>
              <p className="text-muted-foreground">
                Transform your business concept into actionable implementation roadmaps
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-border bg-background text-foreground hover:bg-muted transition-colors">
                Share Project
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Save Progress
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
              Changes saved successfully!
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{completedTasks}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-foreground mb-1">{pendingDeadlines}</div>
              <div className="text-sm text-muted-foreground">Pending Deadlines</div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Project Timeline</h2>
                <p className="text-sm text-muted-foreground">Track progress across all project phases</p>
              </div>
              <div className="flex gap-2">
                <Select value={phaseFilter} onValueChange={(value: any) => setPhaseFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="date-added">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                  onClick={() => setCalendarOpen(true)}
                >
                  View Calendar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => setAddPhaseOpen(true)}
                >
                  + Add Phase
                </button>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-muted-foreground">Upcoming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm text-muted-foreground">Planned</span>
              </div>
            </div>

            {timelines && timelines.length > 0 ? (
              <div className="space-y-4">
                {getFilteredTimelines().map((timeline) => {
                  const ideaTitle = ideas?.find((i) => i.id === timeline.idea_id)?.title || "Unknown Project"
                  const phaseTasks = tasks[timeline.id] || []
                  return (
                    <div key={timeline.id} className="border-l-4 border-primary pl-6 py-4 relative">
                      <div className="absolute left-[-8px] top-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{timeline.phase_name}</h3>
                          <p className="text-sm text-muted-foreground">{ideaTitle}</p>
                          {timeline.start_date && timeline.end_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(timeline.start_date).toLocaleDateString()} -{" "}
                              {new Date(timeline.end_date).toLocaleDateString()}
                            </p>
                          )}
                          {timeline.total_tasks && timeline.total_tasks > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Total tasks planned: {timeline.total_tasks} | Completed: {phaseTasks.filter(t => t.status === 'completed').length}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {timeline.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium text-foreground">{timeline.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${timeline.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                        <button
                          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                          onClick={() => {
                            setSelectedTimeline(timeline.id)
                            setAddTaskOpen(true)
                          }}
                        >
                          + Add Task
                        </button>
                      </div>

                      {phaseTasks.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Tasks:</h4>
                          {phaseTasks.map(task => {
                            const statusColors: Record<string, string> = {
                              'completed': 'bg-green-500',
                              'in_progress': 'bg-blue-500',
                              'upcoming': 'bg-orange-500',
                              'planned': 'bg-gray-400',
                              'pending': 'bg-gray-400'
                            }
                            const statusColor = statusColors[task.status] || 'bg-gray-400'
                            
                            return (
                              <div key={task.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-muted-foreground">
                                    Contributes: {task.contribution_percentage}%
                                  </span>
                                  <span className="text-muted-foreground">
                                    Done: {task.completion_percentage}%
                                  </span>
                                  <Select
                                    value={task.status}
                                    onValueChange={(value) => handleUpdateTaskStatus(timeline.id, task.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="planned">Planned</SelectItem>
                                      <SelectItem value="upcoming">Upcoming</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No project timelines yet. Create a startup idea to begin planning.
                </p>
                <Link href="/dashboard">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>
              Create a new phase for your project timeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Business Idea</label>
              <Select
                value={newPhase.idea_id}
                onValueChange={(value) => setNewPhase({ ...newPhase, idea_id: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose an idea" />
                </SelectTrigger>
                <SelectContent>
                  {ideas.map((idea) => (
                    <SelectItem key={idea.id} value={idea.id}>
                      {idea.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phase Name</label>
                <Input
                  value={newPhase.phase_name}
                  onChange={(e) => setNewPhase({ ...newPhase, phase_name: e.target.value })}
                  placeholder="e.g., MVP Development"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Tasks to Complete</label>
                <Input
                  type="number"
                  min="0"
                  value={newPhase.total_tasks}
                  onChange={(e) => setNewPhase({ ...newPhase, total_tasks: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 10"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newPhase.start_date}
                  onChange={(e) => setNewPhase({ ...newPhase, start_date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newPhase.end_date}
                  onChange={(e) => setNewPhase({ ...newPhase, end_date: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Objectives</label>
              <Textarea
                value={newPhase.objectives}
                onChange={(e) => setNewPhase({ ...newPhase, objectives: e.target.value })}
                placeholder="What are the main objectives for this phase?"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPhaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPhase} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Phase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a task and specify its contribution to the phase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Design user interface"
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe the task..."
                rows={2}
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Contribution to Phase: {newTask.contribution_percentage}%
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                What percentage of the phase does this task represent?
              </p>
              <Input
                type="range"
                min="0"
                max="100"
                step="5"
                value={newTask.contribution_percentage}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    contribution_percentage: parseInt(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Project Timeline Calendar</DialogTitle>
            <DialogDescription>
              View tasks and deadlines across all project phases
            </DialogDescription>
          </DialogHeader>
          <CalendarWithEvents events={getCalendarEvents()} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
