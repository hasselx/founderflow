"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"
import StarBorder from "@/components/ui/star-border"

interface StatsCardProps {
  title: string
  value: string
  description: string
  trend: string
  icon: ReactNode
}

export default function StatsCard({ title, value, description, trend, icon }: StatsCardProps) {
  return (
    <StarBorder as="div" color="#06b6d4" speed="8s" thickness={2}>
      <Card className="border-0 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">{icon}</div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{description}</p>
          <p className="text-xs text-accent font-medium">{trend}</p>
        </CardContent>
      </Card>
    </StarBorder>
  )
}
