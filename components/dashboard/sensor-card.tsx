"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface SensorCardProps {
  title: string
  value: string
  unit: string
  icon: LucideIcon
  trend: "up" | "down" | "stable"
  trendValue: string
  status: "healthy" | "warning" | "critical"
  sparkline?: number[]
}

export function SensorCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status,
  sparkline = [],
}: SensorCardProps) {
  const statusColors = {
    healthy: {
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      text: "text-green-500",
      glow: "glow-green",
    },
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      text: "text-yellow-500",
      glow: "glow-yellow",
    },
    critical: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-500",
      glow: "glow-red",
    },
  }

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-muted-foreground",
  }

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  }

  const colors = statusColors[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass-card rounded-xl p-5 relative overflow-hidden",
        colors.glow
      )}
    >
      {/* Status indicator */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          "absolute top-3 right-3 w-2.5 h-2.5 rounded-full",
          status === "healthy" && "bg-green-500",
          status === "warning" && "bg-yellow-500",
          status === "critical" && "bg-red-500"
        )}
      />

      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", colors.bg)}>
          <Icon className={cn("w-6 h-6", colors.text)} />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl font-bold text-foreground font-mono"
          >
            {value}
          </motion.span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("text-sm font-medium flex items-center gap-1", trendColors[trend])}>
          {trendIcons[trend]} {trendValue}
        </span>
        <span className="text-xs text-muted-foreground">vs last hour</span>
      </div>

      {/* Mini sparkline */}
      {sparkline.length > 0 && (
        <div className="mt-4 h-8 flex items-end gap-0.5">
          {sparkline.map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={cn(
                "flex-1 rounded-t",
                status === "healthy" && "bg-green-500/50",
                status === "warning" && "bg-yellow-500/50",
                status === "critical" && "bg-red-500/50"
              )}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
