"use client"

import { Calendar, CheckSquare, Users, BarChart3, Bell } from 'lucide-react'
import Link from "next/link"

export default function ProjectPlannerClient({ timelines, ideas }) {
  const totalTasks = timelines?.length || 0
  const completedTasks = timelines?.filter((t) => t.status === "completed").length || 0
  const overallProgress =
    timelines && timelines.length > 0
      ? Math.round(timelines.reduce((sum, t) => sum + (t.progress_percentage || 0), 0) / timelines.length)
      : 0
  const pendingDeadlines = timelines?.filter((t) => t.status === "in_progress").length || 0

  const projectTools = [
    { name: "Timeline", icon: Calendar, href: "/dashboard/tools/timeline" },
    { name: "Tasks", icon: CheckSquare, href: "/dashboard/tools/tasks" },
    { name: "Resources", icon: Users, href: "/dashboard/tools/resources" },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/tools/analytics" },
    { name: "Notifications", icon: Bell, href: "/dashboard/tools/notifications" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar - Project Tools */}
      <aside className="w-64 border-r border-border bg-card p-6 flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">Project Tools</h2>
          <Link href="/dashboard">
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
        </div>
        <nav className="space-y-2 flex-1">
          {projectTools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <tool.icon className="w-5 h-5" />
              <span className="font-medium">{tool.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content - Full width without right sidebar */}
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

          {/* Project Timeline */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Project Timeline</h2>
                <p className="text-sm text-muted-foreground">Track progress across all project phases</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                  onClick={() => alert("Calendar view coming soon!")}
                >
                  View Calendar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => alert("Add phase form coming soon!")}
                >
                  + Add Phase
                </button>
              </div>
            </div>

            {timelines && timelines.length > 0 ? (
              <div className="space-y-4">
                {timelines.map((timeline) => {
                  const ideaTitle = ideas?.find((i) => i.id === timeline.idea_id)?.title || "Unknown Project"
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
                          onClick={() => alert("Add task form coming soon!")}
                        >
                          + Add Task
                        </button>
                      </div>
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
    </div>
  )
}
