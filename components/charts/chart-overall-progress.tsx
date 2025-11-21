"use client"

import { Label, Pie, PieChart } from "recharts"
import { type ChartConfig, ChartContainer } from "@/components/ui/chart"

interface ChartOverallProgressProps {
  total: number
  completed: number
  inProgress: number
  upcoming: number
  planned: number
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#10b981",
  },
  inProgress: {
    label: "In Progress",
    color: "#3b82f6",
  },
  upcoming: {
    label: "Upcoming",
    color: "#f97316",
  },
  planned: {
    label: "Planned",
    color: "#9ca3af",
  },
} satisfies ChartConfig

export function ChartOverallProgress({ total, completed, inProgress, upcoming, planned }: ChartOverallProgressProps) {
  const chartData = [
    { status: "completed", value: completed, fill: "var(--color-completed)" },
    { status: "inProgress", value: inProgress, fill: "var(--color-inProgress)" },
    { status: "upcoming", value: upcoming, fill: "var(--color-upcoming)" },
    { status: "planned", value: planned, fill: "var(--color-planned)" },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <ChartContainer config={chartConfig} className="mx-auto w-full h-[200px]">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            strokeWidth={0}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={(viewBox.cy || 0) + 20} textAnchor="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-foreground text-3xl font-bold">
                        {total}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 45} className="fill-muted-foreground text-sm">
                        Total Tasks
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}
