"use client"

import type React from "react"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface DockItem {
  icon: React.ReactNode
  label: string
  onClick: () => void
  isActive?: boolean
}

interface DockProps {
  items: DockItem[]
  panelHeight?: number
  baseItemSize?: number
  magnification?: number
  className?: string
}

function DockIcon({ item, mouseX }: { item: DockItem; mouseX: any }) {
  const ref = useRef<HTMLButtonElement>(null)

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(distance, [-200, 0, 200], [50, 75, 50])
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 200, damping: 15 })

  const iconSizeSync = useTransform(distance, [-200, 0, 200], [20, 30, 20])
  const iconSize = useSpring(iconSizeSync, { mass: 0.1, stiffness: 200, damping: 15 })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          ref={ref}
          style={{ width, height: width }}
          onClick={item.onClick}
          className={cn(
            "grid place-items-center rounded-xl border-2 transition-colors duration-200",
            item.isActive
              ? "bg-primary/10 border-primary text-primary"
              : "bg-card/50 border-border/60 hover:border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <motion.div
            style={{ width: iconSize, height: iconSize }}
            className="flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
          >
            {item.icon}
          </motion.div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={12}
        className="bg-popover text-popover-foreground border-border shadow-md"
      >
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

export default function Dock({ items, panelHeight = 68, baseItemSize = 50, magnification = 70, className }: DockProps) {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        style={{ height: panelHeight }}
        className={cn(
          "mx-auto flex items-center gap-6 rounded-2xl bg-card/40 backdrop-blur-xl px-6 py-2 border border-border/40 overflow-visible",
          className,
        )}
      >
        {items.map((item, i) => (
          <DockIcon key={i} item={item} mouseX={mouseX} />
        ))}
      </motion.div>
    </TooltipProvider>
  )
}
