"use client"

import { useMemo } from "react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
  const chartData = useMemo(() => {
    if (total === 0) return [{ completed: 0, inProgress: 0, upcoming: 0, planned: 0 }]

    return [
      {
        completed: (completed / total) * 100,
        inProgress: (inProgress / total) * 100,
        upcoming: (upcoming / total) * 100,
        planned: (planned / total) * 100,
      },
    ]
  }, [total, completed, inProgress, upcoming, planned])

  return (
    <div className="flex flex-col items-center gap-4">
      <ChartContainer config={chartConfig} className="w-full max-w-[240px] aspect-square">
        <RadialBarChart data={chartData} endAngle={180} innerRadius={70} outerRadius={120}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 12} className="fill-foreground text-3xl font-bold">
                        {total}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 8} className="fill-muted-foreground text-sm">
                        Total Tasks
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            dataKey="completed"
            stackId="a"
            fill="var(--color-completed)"
            cornerRadius={8}
            className="stroke-transparent"
          />
          <RadialBar
            dataKey="inProgress"
            stackId="a"
            fill="var(--color-inProgress)"
            cornerRadius={8}
            className="stroke-transparent"
          />
          <RadialBar
            dataKey="upcoming"
            stackId="a"
            fill="var(--color-upcoming)"
            cornerRadius={8}
            className="stroke-transparent"
          />
          <RadialBar
            dataKey="planned"
            stackId="a"
            fill="var(--color-planned)"
            cornerRadius={8}
            className="stroke-transparent"
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  )
}
