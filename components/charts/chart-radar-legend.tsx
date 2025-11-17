"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from "recharts"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartRadarLegend({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="month" />
        <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Legend />
        <Radar name="Completed" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
        <Radar name="In Progress" dataKey="in_progress" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
        <Radar name="Upcoming" dataKey="upcoming" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
        <Radar name="Planned" dataKey="planned" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.25} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
