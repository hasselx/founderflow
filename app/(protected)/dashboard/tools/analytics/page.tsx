"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState([
    { label: "Project Progress", value: "—", change: "Loading..." },
    { label: "Total Ideas", value: "—", change: "Loading..." },
    { label: "Team Members", value: "—", change: "Loading..." },
    { label: "Total Budget", value: "—", change: "Loading..." },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/analytics/metrics")
        const data = await response.json()
        if (data.metrics) {
          setMetrics(data.metrics)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return (
    <div className="flex-1 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
        <p className="text-muted-foreground mb-8">Track your project metrics and performance</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-2">{metric.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
