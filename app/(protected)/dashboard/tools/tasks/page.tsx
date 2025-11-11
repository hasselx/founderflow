"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckSquare, Loader2, Plus } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  phase_name: string
  status: string
  phase_number: number
  idea_id: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data: ideas } = await supabase.from("startup_ideas").select("id").eq("user_id", user.id)

        if (!ideas || ideas.length === 0) {
          setTasks([])
          setLoading(false)
          return
        }

        const ideaIds = ideas.map((idea) => idea.id)

        const { data, error } = await supabase
          .from("project_timelines")
          .select("*")
          .in("idea_id", ideaIds)
          .order("phase_number", { ascending: true })

        if (error) {
          console.error("[v0] Error fetching tasks:", error)
          setTasks([])
        } else {
          setTasks(data || [])
        }
      } catch (error) {
        console.error("[v0] Error:", error)
        setTasks([])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tasks</h1>
        <p className="text-muted-foreground mb-8">Manage your project tasks and to-dos</p>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No tasks yet. Create a project to get started!</p>
              <Button onClick={() => (window.location.href = "/dashboard/ideas/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${
                      task.status === "completed" ? "bg-green-500/20" : "bg-muted"
                    }`}
                  >
                    <CheckSquare
                      className={`w-5 h-5 ${task.status === "completed" ? "text-green-600" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.phase_name}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      task.status === "completed"
                        ? "bg-green-500/10 text-green-700"
                        : task.status === "in_progress"
                          ? "bg-blue-500/10 text-blue-700"
                          : "bg-gray-500/10 text-gray-700"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
