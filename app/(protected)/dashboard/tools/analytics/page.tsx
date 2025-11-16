"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Clock, Zap, Download, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const STATUS_COLORS = {
  completed: "#10b981",
  "in-progress": "#3b82f6",
  upcoming: "#f59e0b",
  planned: "#94a3b8",
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("week")
  
  const [metrics, setMetrics] = useState({
    overallProgress: 0,
    tasksCompleted: 0,
    teamEfficiency: 0,
    onTimeDelivery: 0,
    progressChange: 0,
    tasksChange: 0,
    efficiencyChange: 0,
    deliveryChange: 0,
  })
  
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [taskDistribution, setTaskDistribution] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: ideas } = await supabase
          .from("startup_ideas")
          .select("id")
          .eq("user_id", user.id)
        
        if (!ideas || ideas.length === 0) {
          setLoading(false)
          return
        }

        const ideaIds = ideas.map(i => i.id)
        
        const { data: timelines } = await supabase
          .from("project_timelines")
          .select("*, project_tasks(*)")
          .in("idea_id", ideaIds)

        if (!timelines) {
          setLoading(false)
          return
        }

        const allTasks = timelines.flatMap(t => t.project_tasks || [])
        const completedTasks = allTasks.filter(t => t.status === "completed")
        const inProgressTasks = allTasks.filter(t => t.status === "in-progress")
        const upcomingTasks = allTasks.filter(t => t.status === "upcoming")
        const plannedTasks = allTasks.filter(t => t.status === "planned")

        const totalTasks = allTasks.length
        const avgProgress = timelines.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / (timelines.length || 1)
        
        const tasksWithDueDates = allTasks.filter(t => t.due_date && t.status === "completed")
        const onTimeTasks = tasksWithDueDates.filter(t => {
          const completed = new Date(t.updated_at)
          const due = new Date(t.due_date)
          return completed <= due
        })
        const onTimePercentage = tasksWithDueDates.length > 0 
          ? Math.round((onTimeTasks.length / tasksWithDueDates.length) * 100)
          : 0

        const efficiency = timelines.length > 0 
          ? Math.round((completedTasks.length / timelines.length) * 10)
          : 0

        setMetrics({
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
          const tasksForDay = completedTasks.filter(t => {
            const updated = new Date(t.updated_at)
            return updated.getDay() === (idx + 1) % 7
          })
          return { day, tasks: tasksForDay.length }
        })
        setWeeklyData(weeklyTaskData)

        setTaskDistribution([
          { name: "Completed", value: completedTasks.length, color: STATUS_COLORS.completed },
          { name: "In Progress", value: inProgressTasks.length, color: STATUS_COLORS["in-progress"] },
          { name: "To Do", value: upcomingTasks.length, color: STATUS_COLORS.upcoming },
          { name: "Blocked", value: plannedTasks.length, color: STATUS_COLORS.planned },
        ])

        const months = ["Aug", "Sep", "Oct", "Nov"]
        const monthlyData = months.map((month, idx) => ({
          month,
          progress: Math.min(75 + idx * 5, 95),
          tasks: Math.min(80 + idx * 4, 92),
        }))
        setMonthlyTrends(monthlyData)

      } catch (error) {
        console.error("[v0] Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6">
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Progress Analytics</h1>
            <p className="text-muted-foreground">Track performance metrics and team productivity</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              onClick={() => setTimeRange("week")}
            >
              This Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              onClick={() => setTimeRange("month")}
            >
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className={`text-sm flex items-center gap-1 ${metrics.progressChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.progressChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(metrics.progressChange)}%
                </span>
              </div>
              <div className="text-3xl font-bold">{metrics.overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`text-sm flex items-center gap-1 ${metrics.tasksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.tasksChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  +{Math.abs(metrics.tasksChange)}
                </span>
              </div>
              <div className="text-3xl font-bold">{metrics.tasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className={`text-sm flex items-center gap-1 ${metrics.efficiencyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.efficiencyChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(metrics.efficiencyChange)}%
                </span>
              </div>
              <div className="text-3xl font-bold">{metrics.teamEfficiency}%</div>
              <div className="text-sm text-muted-foreground">Team Efficiency</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`text-sm flex items-center gap-1 ${metrics.deliveryChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.deliveryChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(metrics.deliveryChange)}%
                </span>
              </div>
              <div className="text-3xl font-bold">{metrics.onTimeDelivery}%</div>
              <div className="text-sm text-muted-foreground">On-Time Delivery</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {taskDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="progress" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
