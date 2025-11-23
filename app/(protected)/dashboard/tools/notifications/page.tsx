import { redirect } from "next/navigation"
import { Bell, ArrowLeft, AlertCircle, Calendar, Eye } from "lucide-react"
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Task {
  id: string
  title: string
  due_date: string | null
  status: string
  timeline_id: string
  phase_name: string
}

export default async function NotificationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: tasks, error: tasksError } = await supabase
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

  if (tasksError) {
    console.error("[v0] Error fetching tasks:", tasksError)
  }

  const allTasks: Task[] = (tasks || []).map((task: any) => ({
    id: task.id,
    title: task.title,
    due_date: task.due_date,
    status: task.status,
    timeline_id: task.timeline_id,
    phase_name: task.project_timelines?.phase_name || "Unknown",
  }))

  const overdueTasks = allTasks.filter(
    (task) => task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date)),
  )

  const upcomingTasks = allTasks.filter((task) => {
    if (!task.due_date) return false
    const dueDate = new Date(task.due_date)
    return !isPast(dueDate) || isToday(dueDate)
  })

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    if (isPast(date)) return `${formatDistanceToNow(date, { addSuffix: true })}`
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const TaskCard = ({ task, isOverdue }: { task: Task; isOverdue: boolean }) => {
    const cardBgClass = isOverdue ? "bg-destructive/5 border-destructive/30" : "bg-primary/5 border-primary/20"
    const textColorClass = isOverdue ? "text-destructive" : "text-primary"

    return (
      <div className={`rounded-lg border ${cardBgClass} p-4 hover:shadow-md transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-lg">{task.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{task.phase_name}</p>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 flex-shrink-0">
            <div className={`text-sm font-semibold ${textColorClass} whitespace-nowrap`}>
              {task.due_date && getDateLabel(task.due_date)}
            </div>
            <Link href={`/project-planner?id=${task.timeline_id}`}>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Eye className="w-4 h-4" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a href="/dashboard" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </a>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with project activities and deadlines</p>
      </div>

      {tasksError ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load notifications</p>
        </div>
      ) : overdueTasks.length === 0 && upcomingTasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet. Your notifications will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {overdueTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Overdue Tasks ({overdueTasks.length})
              </h2>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} isOverdue={true} />
                ))}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tasks ({upcomingTasks.length})
              </h2>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} isOverdue={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
