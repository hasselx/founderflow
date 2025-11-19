"use client"

import { useMemo } from "react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartOverallProgressProps {
  total: number
  completed: number
  inProgress: number
  upcoming: number
  planned: number
}

export function ChartOverallProgress({
  total,
  completed,
  inProgress,
  upcoming,
  planned,
}: ChartOverallProgressProps) {
  const chartData = useMemo(() => {
    return [
      {
        name: "tasks",
        completed,
        inProgress,
        upcoming,
        planned,
      },
    ]
  }, [completed, inProgress, upcoming, planned])

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "#10b981", // Green
    },
    inProgress: {
      label: "In Progress",
      color: "#3b82f6", // Blue
    },
    upcoming: {
      label: "Upcoming",
      color: "#f97316", // Orange
    },
    planned: {
      label: "Planned",
      color: "#9ca3af", // Grey
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[200px]">
      <RadialBarChart data={chartData} endAngle={180} innerRadius={60} outerRadius={100}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 12} className="fill-foreground text-2xl font-bold">
                      {total}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 6} className="fill-muted-foreground text-xs">
                      Total Tasks
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar dataKey="completed" stackId="a" fill="var(--color-completed)" cornerRadius={5} />
        <RadialBar dataKey="inProgress" stackId="a" fill="var(--color-inProgress)" cornerRadius={5} />
        <RadialBar dataKey="upcoming" stackId="a" fill="var(--color-upcoming)" cornerRadius={5} />
        <RadialBar dataKey="planned" stackId="a" fill="var(--color-planned)" cornerRadius={5} />
      </RadialBarChart>
    </ChartContainer>
  )
}
