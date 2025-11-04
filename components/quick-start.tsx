"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Search, Users, Zap, ArrowRight } from "lucide-react"

export default function QuickStart() {
  const actions = [
    {
      title: "Submit New Idea",
      description: "Transform your concept into a structured business plan",
      icon: Lightbulb,
      color: "text-primary",
    },
    {
      title: "Market Research",
      description: "Explore trends and validate your business concept",
      icon: Search,
      color: "text-accent",
    },
    {
      title: "Find Co-founder",
      description: "Connect with like-minded entrepreneurs",
      icon: Users,
      color: "text-primary",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <CardTitle>Quick Start</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <div
                key={action.title}
                className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10`}
                >
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                  Start <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
