"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  CheckSquare,
  Users,
  BarChart3,
  Bell,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Eye,
  AlertCircle,
  TrendingUp,
  Clock,
  Zap,
  Download,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarWithEvents } from "@/components/calendar-with-events"
import { ChartOverallProgress } from "@/components/charts/chart-overall-progress"
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"
import { ChartRadarLegend } from "@/components/charts/chart-radar-legend"
import { ChartLineMultiple } from "@/components/charts/chart-line-multiple"
import { ChartTaskDistribution } from "@/components/charts/chart-task-distribution"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Toggle } from "@/components/ui/toggle"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"

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
  ideas,
}: {
  timelines: Timeline[]
  ideas: Idea[]
}) {
  const router = useRouter()
  const [timelines, setTimelines] = useState<Timeline[]>(initialTimelines)
  const [addPhaseOpen, setAddPhaseOpen] = useState(false)

  // The local state should be the source of truth after deletion, not the server props
  useEffect(() => {
    console.log("[v0] Props changed, syncing to state. New count:", initialTimelines.length)
    setTimelines(initialTimelines)
  }, [initialTimelines])

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})
  const [phaseFilter, setPhaseFilter] = useState<string>("all")
  const [activeView, setActiveView] = useState<string>("timeline")

  const [editingPhase, setEditingPhase] = useState<Timeline | null>(null) // State for editing phase
  const [editPhaseOpen, setEditPhaseOpen] = useState(false) // State for edit phase dialog

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

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTaskOpen, setEditTaskOpen] = useState(false)
  const [editingTaskTimelineId, setEditingTaskTimelineId] = useState<string | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [analyticsMetrics, setAnalyticsMetrics] = useState({
    overallProgress: 0,
    tasksCompleted: 0,
    teamEfficiency: 0,
    onTimeDelivery: 0,
    progressChange: 12,
    tasksChange: 8,
    efficiencyChange: 5,
    deliveryChange: -2,
  })
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [taskDistribution, setTaskDistribution] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("week")
  const [chartView, setChartView] = useState<"line" | "radar">("line")

  const [resources, setResources] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [slackConfig, setSlackConfig] = useState({
    appId: "",
    clientId: "",
    clientSecret: "",
    signingSecret: "",
    verificationToken: "",
    botToken: "",
    channelId: "",
  })
  const [slackMembers, setSlackMembers] = useState<string[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const [notificationTasks, setNotificationTasks] = useState<any[]>([])
  const [overdueTasks, setOverdueTasks] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null) // Added for toast messages

  const totalTasks = useMemo(() => {
    return timelines.flatMap((t) => tasks[t.id] || []).length
  }, [timelines, tasks])

  const completedTasks = useMemo(() => {
    return timelines.flatMap((t) => (tasks[t.id] || []).filter((task) => task.status === "completed")).length
  }, [timelines, tasks])

  const pendingDeadlines = useMemo(() => {
    const now = new Date()
    return timelines.flatMap((t) =>
      (tasks[t.id] || []).filter((task) => {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        return task.status !== "completed" && dueDate >= now
      }),
    ).length
  }, [timelines, tasks])

  const overallProgress = useMemo(() => {
    if (!timelines || timelines.length === 0) return 0
    const totalTasksCompleted = timelines.reduce(
      (sum, t) => sum + (tasks[t.id] || []).filter((task) => task.status === "completed").length,
      0,
    )
    const totalPhaseTasks = timelines.reduce((sum, t) => sum + (t.total_tasks || 0), 0)
    return totalPhaseTasks > 0 ? Math.round((totalTasksCompleted / totalPhaseTasks) * 100) : 0
  }, [timelines, tasks])

  const taskBreakdown = useMemo(() => {
    const breakdown = {
      completed: 0,
      inProgress: 0,
      upcoming: 0,
      planned: 0,
    }
    timelines.forEach((timeline) => {
      const phaseTasks = tasks[timeline.id] || []
      phaseTasks.forEach((task) => {
        if (task.status === "completed") breakdown.completed++
        else if (task.status === "in_progress") breakdown.inProgress++
        else if (task.status === "upcoming") breakdown.upcoming++
        else if (task.status === "planned") breakdown.planned++
      })
    })
    return breakdown
  }, [timelines, tasks])

  const projectTools = [
    { name: "Timeline", icon: Calendar, view: "timeline" },
    { name: "Tasks", icon: CheckSquare, view: "tasks" },
    { name: "Resources", icon: Users, view: "resources" },
    { name: "Analytics", icon: BarChart3, view: "analytics" },
    { name: "Notifications", icon: Bell, view: "notifications" },
  ]

  useEffect(() => {
    if (activeView !== "analytics") return

    const fetchAnalytics = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: ideas } = await supabase.from("startup_ideas").select("id").eq("user_id", user.id)

        if (!ideas || ideas.length === 0) return

        const ideaIds = ideas.map((i: any) => i.id)

        const { data: timelines } = await supabase
          .from("project_timelines")
          .select("*, project_tasks(*)")
          .in("idea_id", ideaIds)

        if (!timelines) return

        const allTasks = timelines.flatMap((t: any) => t.project_tasks || [])
        const completedTasks = allTasks.filter((t: any) => t.status === "completed")
        const inProgressTasks = allTasks.filter((t: any) => t.status === "in_progress")
        const upcomingTasks = allTasks.filter((t: any) => t.status === "upcoming")
        const plannedTasks = allTasks.filter((t: any) => t.status === "planned")

        const avgProgress =
          timelines.reduce((sum: number, t: any) => sum + (t.progress_percentage || 0), 0) / (timelines.length || 1)

        const tasksWithDueDates = allTasks.filter((t: any) => t.due_date && t.status === "completed")
        const onTimeTasks = tasksWithDueDates.filter((t: any) => {
          const completed = new Date(t.updated_at)
          const due = new Date(t.due_date)
          return completed <= due
        })
        const onTimePercentage =
          tasksWithDueDates.length > 0 ? Math.round((onTimeTasks.length / tasksWithDueDates.length) * 100) : 0

        const efficiency = timelines.length > 0 ? Math.round((completedTasks.length / timelines.length) * 10) : 0

        setAnalyticsMetrics({
          overallProgress: Math.round(avgProgress),
          tasksCompleted: completedTasks.length,
          teamEfficiency: Math.min(efficiency, 100),
          onTimeDelivery: onTimePercentage,
          progressChange: 12,
          tasksChange: 8,
          efficiencyChange: 5,
          deliveryChange: -2,
        })

        const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        const weeklyTaskData = weekDays.map((day, idx) => {
          const tasksForDay = completedTasks.filter((t: any) => {
            const updated = new Date(t.updated_at)
            return updated.getDay() === (idx + 1) % 7
          })
          return { day, tasks: tasksForDay.length }
        })
        setWeeklyData(weeklyTaskData)

        const STATUS_COLORS = {
          completed: "#10b981",
          in_progress: "#3b82f6",
          upcoming: "#f59e0b",
          planned: "#94a3b8",
        }

        setTaskDistribution([
          { name: "Completed", value: completedTasks.length, color: STATUS_COLORS.completed },
          { name: "In Progress", value: inProgressTasks.length, color: STATUS_COLORS.in_progress },
          { name: "Upcoming", value: upcomingTasks.length, color: STATUS_COLORS.upcoming },
          { name: "Planned", value: plannedTasks.length, color: STATUS_COLORS.planned },
        ])

        const months = ["Aug", "Sep", "Oct", "Nov"]
        const monthlyData = months.map((month, idx) => {
          const monthIndex = idx + 8
          const monthTasks = allTasks.filter((t: any) => {
            const date = new Date(t.updated_at || t.created_at)
            return date.getMonth() === monthIndex - 1
          })
          const completedInMonth = monthTasks.filter((t: any) => t.status === "completed").length
          const inProgressInMonth = monthTasks.filter((t: any) => t.status === "in_progress").length
          const upcomingInMonth = monthTasks.filter((t: any) => t.status === "upcoming").length
          const plannedInMonth = monthTasks.filter((t: any) => t.status === "planned").length

          return {
            month,
            completed: completedInMonth,
            in_progress: inProgressInMonth,
            upcoming: upcomingInMonth,
            planned: plannedInMonth,
          }
        })
        setMonthlyTrends(monthlyData)
      } catch (error) {
        console.error("[v0] Error fetching analytics:", error)
      }
    }

    fetchAnalytics()
  }, [activeView])

  useEffect(() => {
    if (activeView !== "resources") return

    const fetchResources = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        try {
          const slackRes = await fetch("/api/integrations/slack")
          const slackData = await slackRes.json()

          let isConfigured = false
          if (slackData.integration && slackData.integration.config) {
            const config = slackData.integration.config
            setSlackConfig({
              appId: config.app_id || "",
              clientId: config.client_id || "",
              clientSecret: config.client_secret || "",
              signingSecret: config.signing_secret || "",
              verificationToken: config.verification_token || "",
              botToken: config.bot_token || "",
              channelId: config.channel_id || "",
            })
            isConfigured = !!config.bot_token
          }

          setIntegrations([
            { name: "Slack", key: "slack", configured: isConfigured },
            { name: "GitHub", key: "github", configured: false },
            { name: "Jira", key: "jira", configured: false },
          ])
        } catch (err) {
          setIntegrations([
            { name: "Slack", key: "slack", configured: false },
            { name: "GitHub", key: "github", configured: false },
            { name: "Jira", key: "jira", configured: false },
          ])
        }

        const { data: cofounders } = await supabase
          .from("cofounder_profiles")
          .select("id, bio")
          .eq("user_id", user.id)
          .limit(5)

        const teamMembers =
          cofounders?.map((cf: any) => ({
            name: cf.bio?.split("\n")[0] || "Team Member",
            role: "Team Member",
          })) || []

        const { data: ideas } = await supabase.from("startup_ideas").select("id, business_model").eq("user_id", user.id)

        const toolsSet = new Set<string>()
        ideas?.forEach((idea: any) => {
          if (idea.business_model) {
            toolsSet.add(idea.business_model)
          }
        })

        const tools = Array.from(toolsSet).map((tool) => ({
          name: tool || "Tool",
          role: "Business Model",
        }))

        setResources([
          {
            category: "Team Members",
            items: teamMembers.length > 0 ? teamMembers : [{ name: "Add team members", role: "Start collaborating" }],
          },
          {
            category: "Tools & Services",
            items: tools.length > 0 ? tools : [{ name: "Add tools", role: "Infrastructure" }],
          },
          {
            category: "Funding & Financial",
            items: [{ name: "Track your funding", role: "Financial management" }],
          },
        ])
      } catch (error) {
        console.error("[v0] Error fetching resources:", error)
      }
    }

    fetchResources()
  }, [activeView])

  useEffect(() => {
    if (activeView !== "notifications") return

    const fetchNotifications = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: tasks } = await supabase
          .from("project_tasks")
          .select(`
            id,
            title,
            due_date,
            status,
            timeline_id,
            project_timelines (
              phase_name
            )
          `)
          .neq("status", "completed")
          .not("due_date", "is", null)

        const allTasks = (tasks || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          due_date: task.due_date,
          status: task.status,
          timeline_id: task.timeline_id,
          phase_name: task.project_timelines?.phase_name || "Unknown",
        }))

        setNotificationTasks(allTasks)

        setOverdueTasks(
          allTasks.filter(
            (task: any) => task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)),
          ),
        )

        setUpcomingTasks(
          allTasks.filter((task: any) => {
            if (!task.due_date) return false
            const dueDate = new Date(task.due_date)
            return !isPast(dueDate) || isToday(dueDate)
          }),
        )
      } catch (error) {
        console.error("[v0] Error fetching notifications:", error)
      }
    }

    fetchNotifications()
  }, [activeView])

  const loadTasks = async (timelineId: string) => {
    try {
      const ideaId = timelines.find((t) => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${timelineId}/tasks`)
      const data = await res.json()

      if (res.ok) {
        setTasks((prev) => ({ ...prev, [timelineId]: data.tasks || [] }))
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

  // ADDED: handleDeletePhase function to delete timeline phases
  const handleDeletePhase = async (timelineId: string) => {
    if (!confirm("Are you sure you want to delete this phase? This action cannot be undone.")) {
      return
    }

    try {
      const ideaId = timelines.find((t) => t.id === timelineId)?.idea_id

      const response = await fetch(`/api/business-plan/${ideaId}/timeline?phaseId=${timelineId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTimelines((prev) => prev.filter((t) => t.id !== timelineId))

        setToast({ message: "Phase deleted successfully!", type: "success" })
      } else {
        throw new Error("Failed to delete phase")
      }
    } catch (error) {
      console.error("[v0] Error deleting phase:", error)
      setToast({ message: "Failed to delete phase. Please try again.", type: "error" })
    }
  }

  // ADDED: handleEditPhase function
  const handleEditPhase = (timeline: Timeline) => {
    setEditingPhase(timeline)
    setEditPhaseOpen(true)
  }

  const handleAddTask = async () => {
    if (!selectedTimeline || !newTask.title) {
      setError("Please fill in the task title")
      return
    }

    setSaving(true)
    setError("")

    try {
      const ideaId = timelines.find((t) => t.id === selectedTimeline)?.idea_id
      if (!ideaId) {
        setError("Timeline not found")
        return
      }

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${selectedTimeline}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })

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
      const ideaId = timelines.find((t) => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const timelineRes = await fetch(`/api/business-plan/${ideaId}/timeline`)
      const timelineData = await timelineRes.json()

      if (timelineData.phases) {
        // Update the specific timeline in state with fresh progress data
        setTimelines((prevTimelines) =>
          prevTimelines.map((t) => {
            const updated = timelineData.phases.find((p: any) => p.id === t.id)
            return updated ? { ...t, ...updated } : t
          }),
        )

        console.log("[v0] Recalculated progress for timeline:", timelineId)
      }
    } catch (err) {
      console.error("[v0] Recalculate progress error:", err)
    }
  }

  const handleUpdateTaskStatus = async (timelineId: string, taskId: string, newStatus: string) => {
    const phaseTasks = tasks[timelineId] || []
    const updatedTasks = phaseTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    setTasks((prev) => ({ ...prev, [timelineId]: updatedTasks }))

    try {
      const ideaId = timelines.find((t) => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const completionMap: Record<string, number> = {
        planned: 0,
        upcoming: 25,
        in_progress: 50,
        completed: 100,
      }

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${timelineId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          completion_percentage: completionMap[newStatus] || 0,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        await Promise.all([loadTasks(timelineId), recalculateProgress(timelineId)])
      } else {
        setTasks((prev) => ({ ...prev, [timelineId]: phaseTasks }))
        setError(data.error || "Failed to update task status")
      }
    } catch (err) {
      setTasks((prev) => ({ ...prev, [timelineId]: phaseTasks }))
      console.error("[v0] Update task status error:", err)
      setError("Failed to update task status")
    }
  }

  const handleDeleteTask = async (timelineId: string, taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    if (!taskId) {
      setError("Task ID is missing")
      return
    }

    try {
      const ideaId = timelines.find((t) => t.id === timelineId)?.idea_id
      if (!ideaId) return

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${timelineId}/tasks`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      })

      if (res.ok) {
        await Promise.all([loadTasks(timelineId), recalculateProgress(timelineId)])
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to delete task")
      }
    } catch (err) {
      console.error("[v0] Delete task error:", err)
      setError("Failed to delete task")
    }
  }

  const handleEditTask = async () => {
    if (!editingTask || !editingTaskTimelineId) return

    setSaving(true)
    setError("")

    try {
      const ideaId = timelines.find((t) => t.id === editingTaskTimelineId)?.idea_id
      if (!ideaId) return

      const res = await fetch(`/api/business-plan/${ideaId}/timeline/${editingTaskTimelineId}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTask),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update task")
        return
      }

      await Promise.all([loadTasks(editingTaskTimelineId), recalculateProgress(editingTaskTimelineId)])
      setEditTaskOpen(false)
      setEditingTask(null)
      setEditingTaskTimelineId(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Edit task error:", err)
      setError("Failed to update task")
    } finally {
      setSaving(false)
    }
  }

  const getFilteredTimelines = () => {
    const filtered = [...timelines]

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
    timelines.forEach((timeline) => {
      const phaseTasks = tasks[timeline.id] || []
      phaseTasks.forEach((task) => {
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

  const getAllTasks = () => {
    const allTasks: Array<Task & { timelineId: string; phaseName: string; ideaTitle: string }> = []
    timelines.forEach((timeline) => {
      const phaseTasks = tasks[timeline.id] || []
      const ideaTitle = ideas?.find((i) => i.id === timeline.idea_id)?.title || "Unknown Project"
      phaseTasks.forEach((task) => {
        allTasks.push({
          ...task,
          timelineId: timeline.id,
          phaseName: timeline.phase_name,
          ideaTitle,
        })
      })
    })
    return allTasks
  }

  const handleSaveSlackConfig = async () => {
    if (!slackConfig.botToken) {
      alert("Please enter at least the Bot User OAuth Token")
      return
    }

    try {
      const res = await fetch("/api/integrations/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackConfig),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Failed to save Slack configuration")
        return
      }

      setIntegrations((prev) => prev.map((i) => (i.key === "slack" ? { ...i, configured: true } : i)))
      alert("Slack configuration saved successfully!")
    } catch (error) {
      console.error("[v0] Slack save error:", error)
      alert("Failed to save Slack configuration")
    }
  }

  const handleAddSlackMember = async () => {
    if (!newMemberEmail || !slackConfig.botToken) {
      alert("Please configure Slack first and enter a valid email")
      return
    }

    try {
      const res = await fetch("/api/integrations/slack/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          channelId: slackConfig.channelId,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSlackMembers([...slackMembers, newMemberEmail])
        setNewMemberEmail("")
        alert("Invitation sent successfully!")
      } else {
        alert(data.error || "Failed to invite member")
      }
    } catch (error) {
      console.error("[v0] Slack invite error:", error)
      alert("Failed to invite member")
    }
  }

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date)) return `${formatDistanceToNow(date, { addSuffix: true })}`
    return formatDistanceToNow(date, { addSuffix: true })
  }

  useEffect(() => {
    timelines.forEach((timeline) => loadTasks(timeline.id))
  }, [timelines.length])

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`transition-all duration-300 border-r border-border bg-card p-4 flex-shrink-0 flex flex-col ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex items-center justify-between mb-6">
          {sidebarOpen && <h2 className="text-lg font-bold text-foreground">Project Tools</h2>}
          <button
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? "rotate-0" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <nav className="space-y-2 flex-1">
          {projectTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setActiveView(tool.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${!sidebarOpen && "justify-center"} ${
                activeView === tool.view
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-foreground hover:bg-muted"
              }`}
              title={tool.name}
            >
              <tool.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{tool.name}</span>}
            </button>
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

          {/* Toast message display */}
          {toast && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                toast.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-600"
                  : "bg-destructive/10 border border-destructive/20 text-destructive"
              }`}
            >
              {toast.message}
            </div>
          )}

          {activeView === "timeline" && (
            <>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-card rounded-lg border border-border p-4 flex flex-col items-center">
                  <div className="mb-2 w-full">
                    <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
                  </div>
                  <ChartOverallProgress
                    total={totalTasks}
                    completed={taskBreakdown.completed}
                    inProgress={taskBreakdown.inProgress}
                    upcoming={taskBreakdown.upcoming}
                    planned={taskBreakdown.planned}
                  />
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
                                  Total tasks planned: {timeline.total_tasks} | Completed:{" "}
                                  {phaseTasks.filter((t) => t.status === "completed").length}
                                </p>
                              )}
                            </div>
                            {/* CHANGE: Added edit and delete buttons for the phase */}
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                                {timeline.status}
                              </span>
                              <button
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                                onClick={() => handleEditPhase(timeline)}
                                title="Edit phase"
                              >
                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              <button
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                onClick={() => handleDeletePhase(timeline.id)}
                                title="Delete phase"
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium text-foreground">
                                  {timeline.progress_percentage}%
                                </span>
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
                              {phaseTasks.map((task) => {
                                const statusColors: Record<string, string> = {
                                  completed: "bg-green-500",
                                  in_progress: "bg-blue-500",
                                  upcoming: "bg-orange-500",
                                  planned: "bg-gray-400",
                                  pending: "bg-gray-400",
                                }
                                const statusColor = statusColors[task.status] || "bg-gray-400"

                                return (
                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
                                  >
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
                                      <span className="text-muted-foreground">Done: {task.completion_percentage}%</span>
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
                                      <button
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                        onClick={() => {
                                          setEditingTask(task)
                                          setEditingTaskTimelineId(timeline.id)
                                          setEditTaskOpen(true)
                                        }}
                                        title="Edit task"
                                      >
                                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                      </button>
                                      <button
                                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                        onClick={() => handleDeleteTask(timeline.id, task.id)}
                                        title="Delete task"
                                      >
                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                      </button>
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
            </>
          )}

          {activeView === "tasks" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">All Tasks</h2>
                  <p className="text-sm text-muted-foreground">Manage your project tasks across all phases</p>
                </div>
              </div>

              {getAllTasks().length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tasks yet. Add a phase and create tasks to get started!
                  </p>
                  <button
                    onClick={() => {
                      setActiveView("timeline")
                      setAddPhaseOpen(true)
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    + Add Phase
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getAllTasks().map((task) => {
                    const statusColors: Record<string, string> = {
                      completed: "bg-green-500/10 text-green-700",
                      in_progress: "bg-blue-500/10 text-blue-700",
                      upcoming: "bg-orange-500/10 text-orange-700",
                      planned: "bg-gray-500/10 text-gray-700",
                      pending: "bg-gray-500/10 text-gray-700",
                    }
                    const statusColor = statusColors[task.status] || "bg-gray-500/10 text-gray-700"

                    return (
                      <div
                        key={task.id}
                        className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-1 ${
                              task.status === "completed" ? "bg-green-500/20" : "bg-muted"
                            }`}
                          >
                            <CheckSquare
                              className={`w-4 h-4 ${task.status === "completed" ? "text-green-600" : "text-muted-foreground"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-medium text-foreground mb-1 ${task.status === "completed" ? "line-through" : ""}`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{task.phaseName}</span>
                              <span>•</span>
                              <span>{task.ideaTitle}</span>
                              {task.due_date && (
                                <>
                                  <span>•</span>
                                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
                              {task.status.replace("_", " ")}
                            </span>
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleUpdateTaskStatus(task.timelineId, task.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planned">Planned</SelectItem>
                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              onClick={() => {
                                setEditingTask(task)
                                setEditingTaskTimelineId(task.timelineId)
                                setEditTaskOpen(true)
                              }}
                              className="p-2 rounded hover:bg-muted transition-colors"
                              title="Edit task"
                            >
                              <Pencil className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.timelineId, task.id)}
                              className="p-2 rounded hover:bg-destructive/10 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeView === "resources" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Resources</h2>
                <p className="text-muted-foreground mb-8">
                  Manage your team, tools, financial resources, and integrations
                </p>
              </div>

              <div className="space-y-6">
                {resources.map((resource) => (
                  <Card key={resource.category}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {resource.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {resource.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium text-foreground">{item.name}</span>
                            <span className="text-sm text-muted-foreground">{item.role}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrations.map((integration) => (
                      <div key={integration.key} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-foreground">{integration.name}</h3>
                          <div
                            className={`text-sm px-3 py-1 rounded ${integration.configured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {integration.configured ? "Connected" : "Not configured"}
                          </div>
                        </div>

                        {integration.key === "slack" && (
                          <div className="space-y-3">
                            <Input
                              placeholder="App ID"
                              value={slackConfig.appId}
                              onChange={(e) => setSlackConfig({ ...slackConfig, appId: e.target.value })}
                            />
                            <Input
                              placeholder="Client ID"
                              value={slackConfig.clientId}
                              onChange={(e) => setSlackConfig({ ...slackConfig, clientId: e.target.value })}
                            />
                            <Input
                              placeholder="Client Secret"
                              type="password"
                              value={slackConfig.clientSecret}
                              onChange={(e) => setSlackConfig({ ...slackConfig, clientSecret: e.target.value })}
                            />
                            <Input
                              placeholder="Signing Secret"
                              type="password"
                              value={slackConfig.signingSecret}
                              onChange={(e) => setSlackConfig({ ...slackConfig, signingSecret: e.target.value })}
                            />
                            <Input
                              placeholder="Bot User OAuth Token"
                              type="password"
                              value={slackConfig.botToken}
                              onChange={(e) => setSlackConfig({ ...slackConfig, botToken: e.target.value })}
                            />
                            <Input
                              placeholder="Channel ID"
                              value={slackConfig.channelId}
                              onChange={(e) => setSlackConfig({ ...slackConfig, channelId: e.target.value })}
                            />
                            <div className="text-sm text-muted-foreground">
                              Scopes: channels:history, channels:read, chat:write, im:history, im:read, users:read,
                              users:read.email, channels:write.invites, chat:write
                            </div>
                            <Button className="w-full" onClick={handleSaveSlackConfig}>
                              Save Slack Configuration
                            </Button>

                            {integration.configured && (
                              <div className="mt-6 pt-6 border-t">
                                <h4 className="font-medium text-foreground mb-3">Add Team Members to Slack</h4>
                                <div className="flex gap-2 mb-3">
                                  <Input
                                    placeholder="Email address"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter") handleAddSlackMember()
                                    }}
                                  />
                                  <Button onClick={handleAddSlackMember}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Invite
                                  </Button>
                                </div>
                                {slackMembers.length > 0 && (
                                  <div className="space-y-2">
                                    {slackMembers.map((email, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <span className="text-sm">{email}</span>
                                        <button
                                          onClick={() => setSlackMembers(slackMembers.filter((_, i) => i !== idx))}
                                          className="text-destructive hover:text-destructive/80"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Progress Analytics</h2>
                  <p className="text-muted-foreground">Track performance metrics and team productivity</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={timeRange === "week" ? "default" : "outline"} onClick={() => setTimeRange("week")}>
                    This Week
                  </Button>
                  <Button variant={timeRange === "month" ? "default" : "outline"} onClick={() => setTimeRange("month")}>
                    This Month
                  </Button>
                  <Button
                    variant={timeRange === "quarter" ? "default" : "outline"}
                    onClick={() => setTimeRange("quarter")}
                  >
                    This Quarter
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span
                        className={`text-sm flex items-center gap-1 ${analyticsMetrics.progressChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analyticsMetrics.progressChange >= 0 ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {Math.abs(analyticsMetrics.progressChange)}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{analyticsMetrics.overallProgress}%</div>
                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span
                        className={`text-sm flex items-center gap-1 ${analyticsMetrics.tasksChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analyticsMetrics.tasksChange >= 0 ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        +{Math.abs(analyticsMetrics.tasksChange)}
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{analyticsMetrics.tasksCompleted}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span
                        className={`text-sm flex items-center gap-1 ${analyticsMetrics.efficiencyChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analyticsMetrics.efficiencyChange >= 0 ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {Math.abs(analyticsMetrics.efficiencyChange)}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{analyticsMetrics.teamEfficiency}%</div>
                    <div className="text-sm text-muted-foreground">Team Efficiency</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span
                        className={`text-sm flex items-center gap-1 ${analyticsMetrics.deliveryChange >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {analyticsMetrics.deliveryChange >= 0 ? (
                          <ArrowUpIcon className="w-3 h-3" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3" />
                        )}
                        {Math.abs(analyticsMetrics.deliveryChange)}%
                      </span>
                    </div>
                    <div className="text-3xl font-bold">{analyticsMetrics.onTimeDelivery}%</div>
                    <div className="text-sm text-muted-foreground">On-Time Delivery</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Task Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Task Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartTaskDistribution data={taskDistribution} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Monthly Trends</CardTitle>
                    <CardDescription>Track progress metrics over time</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${chartView === "line" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      Line
                    </span>
                    <Toggle
                      pressed={chartView === "radar"}
                      onPressedChange={() => setChartView(chartView === "line" ? "radar" : "line")}
                      className="h-8"
                      aria-label="Toggle chart view"
                    >
                      ◉
                    </Toggle>
                    <span
                      className={`text-xs font-medium ${chartView === "radar" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      Radar
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {chartView === "line" ? (
                    <ChartLineMultiple data={monthlyTrends} />
                  ) : (
                    <ChartRadarLegend data={monthlyTrends} />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                <p className="text-muted-foreground">Stay updated with project activities and deadlines</p>
              </div>

              {overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notifications yet. Your notifications will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {overdueTasks.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-destructive flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Overdue Tasks ({overdueTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {overdueTasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="rounded-lg border bg-destructive/5 border-destructive/30 p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{task.phase_name}</p>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 flex-shrink-0">
                                <div className="text-sm font-semibold text-destructive whitespace-nowrap">
                                  {task.due_date && getDateLabel(task.due_date)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 bg-transparent"
                                  onClick={() => {
                                    setActiveView("timeline")
                                    setSelectedTimeline(task.timeline_id)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingTasks.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Upcoming Tasks ({upcomingTasks.length})
                      </h3>
                      <div className="space-y-3">
                        {upcomingTasks.map((task: any) => (
                          <div
                            key={task.id}
                            className="rounded-lg border bg-primary/5 border-primary/20 p-4 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">{task.phase_name}</p>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 flex-shrink-0">
                                <div className="text-sm font-semibold text-primary whitespace-nowrap">
                                  {task.due_date && getDateLabel(task.due_date)}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-2 bg-transparent"
                                  onClick={() => {
                                    setActiveView("timeline")
                                    setSelectedTimeline(task.timeline_id)
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
            <DialogDescription>Create a new phase for your project timeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Business Idea</label>
              <Select value={newPhase.idea_id} onValueChange={(value) => setNewPhase({ ...newPhase, idea_id: value })}>
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
                  onChange={(e) => setNewPhase({ ...newPhase, total_tasks: Number.parseInt(e.target.value) || 0 })}
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
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Phase"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editPhaseOpen} onOpenChange={setEditPhaseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Phase</DialogTitle>
            <DialogDescription>Update phase details</DialogDescription>
          </DialogHeader>
          {editingPhase && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phase Name</label>
                <Input
                  value={editingPhase.phase_name}
                  onChange={(e) => setEditingPhase({ ...editingPhase, phase_name: e.target.value })}
                  placeholder="e.g., MVP Development"
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={editingPhase.start_date}
                    onChange={(e) => setEditingPhase({ ...editingPhase, start_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={editingPhase.end_date}
                    onChange={(e) => setEditingPhase({ ...editingPhase, end_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editingPhase.status}
                  onValueChange={(value) => setEditingPhase({ ...editingPhase, status: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Total Tasks</label>
                <Input
                  type="number"
                  min="0"
                  value={editingPhase.total_tasks}
                  onChange={(e) =>
                    setEditingPhase({ ...editingPhase, total_tasks: Number.parseInt(e.target.value) || 0 })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPhaseOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingPhase) return
                setSaving(true)
                setError("")
                try {
                  const res = await fetch(`/api/business-plan/${editingPhase.idea_id}/timeline`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editingPhase),
                  })
                  const data = await res.json()

                  if (!res.ok) {
                    setError(data.error || "Failed to update phase")
                    return
                  }

                  setTimelines((prev) => prev.map((t) => (t.id === editingPhase.id ? { ...t, ...editingPhase } : t)))
                  setEditPhaseOpen(false)
                  setEditingPhase(null)
                  setSuccess(true)
                  setTimeout(() => setSuccess(false), 3000)
                } catch (err) {
                  console.error("[v0] Edit phase error:", err)
                  setError("Failed to update phase")
                } finally {
                  setSaving(false)
                }
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a task and specify its contribution to the phase</DialogDescription>
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
              <label className="text-sm font-medium">Contribution to Phase: {newTask.contribution_percentage}%</label>
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
                    contribution_percentage: Number.parseInt(e.target.value),
                  })
                }
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
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
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editTaskOpen} onOpenChange={setEditTaskOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and contribution percentage</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="e.g., Design user interface"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingTask.description || ""}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={2}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Contribution to Phase: {editingTask.contribution_percentage}%
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  What percentage of the phase does this task represent?
                </p>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingTask.contribution_percentage}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      contribution_percentage: Number.parseInt(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}
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
                    value={editingTask.due_date || ""}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Timeline Calendar</DialogTitle>
            <DialogDescription>View tasks and deadlines across all project phases</DialogDescription>
          </DialogHeader>
          <CalendarWithEvents events={getCalendarEvents()} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
