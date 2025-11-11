"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("startup_ideas")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("[v0] Error fetching projects:", error)
          setProjects([])
        } else {
          setProjects(data || [])
        }
      } catch (error) {
        console.error("[v0] Error:", error)
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getCompletionPercentage = (status: string) => {
    switch (status) {
      case "completed":
        return 100
      case "in_progress":
        return 60
      case "planning":
        return 30
      default:
        return 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No projects yet. Start by creating your first startup idea!</p>
        <Button onClick={() => (window.location.href = "/dashboard/ideas/new")}>Create Project</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
        <span className="text-sm text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const completion = getCompletionPercentage(project.status)
          return (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden flex items-center justify-center">
                <div className="text-4xl font-bold text-primary/20">{project.title.charAt(0)}</div>
                <Badge className={`absolute top-3 right-3 ${getStatusColor(project.status)}`}>
                  {project.status.replace("_", " ")}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Modified {getTimeAgo(project.updated_at)}</span>
                    <span>{completion}% complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${completion}%` }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => (window.location.href = `/business-plan?id=${project.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => (window.location.href = `/project-planner?id=${project.id}`)}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
