"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProjectsGrid() {
  const projects = [
    {
      title: "AI-Powered Learning Platform",
      status: "Active",
      statusColor: "bg-green-100 text-green-800",
      completion: 75,
      modified: "Yesterday",
      image: "/ai-learning-platform.png",
    },
    {
      title: "Sustainable Food Delivery",
      status: "Planning",
      statusColor: "bg-yellow-100 text-yellow-800",
      completion: 45,
      modified: "2 days ago",
      image: "/sustainable-food-delivery.jpg",
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
        <span className="text-sm text-muted-foreground">6 of 6 projects</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
              <img
                src={project.image || "/placeholder.svg"}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-3 right-3 ${project.statusColor}`}>{project.status}</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-foreground mb-2">{project.title}</h3>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Modified {project.modified}</span>
                  <span>{project.completion}% complete</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="default" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
