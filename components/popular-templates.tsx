"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function PopularTemplates() {
  const templates = [
    { name: "SaaS Startup", category: "Technology", users: "1,247" },
    { name: "E-commerce Platform", category: "Retail", users: "892" },
    { name: "Mobile App", category: "Technology", users: "756" },
    { name: "Consulting Service", category: "Services", users: "634" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Templates</CardTitle>
        <CardDescription>Start with proven templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{template.name}</p>
              <p className="text-xs text-muted-foreground">
                {template.category} • {template.users} uses
              </p>
            </div>
            <Button size="sm" variant="ghost" className="ml-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          View All Templates
        </Button>
      </CardContent>
    </Card>
  )
}
