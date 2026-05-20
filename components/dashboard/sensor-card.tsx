"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"
import { Edit2, ShieldAlert, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SensorCardProps {
  id: string // added sensor identifier
  title: string
  value: string
  unit: string
  icon: LucideIcon
  trend: "up" | "down" | "stable"
  trendValue: string
  status: "healthy" | "warning" | "critical"
  sparkline?: number[]
  min?: number
  max?: number
}

export function SensorCard({
  id,
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  status,
  sparkline = [],
  min = 0,
  max = 100,
}: SensorCardProps) {
  const { role, sensors, updateSensorSetpoint } = useHmi()
  const [isEditing, setIsEditing] = useState(false)

  // Grab active limits from context dynamically
  const activeSensor = sensors.find((s) => s.id === id)
  const highAlarm = activeSensor?.highAlarm ?? max * 0.9
  const highWarning = activeSensor?.highWarning ?? max * 0.8
  const lowWarning = activeSensor?.lowWarning ?? min * 1.2
  const lowAlarm = activeSensor?.lowAlarm ?? min * 1.1

  // local slider state
  const [sliderHighAlarm, setSliderHighAlarm] = useState(highAlarm)
  const [sliderHighWarning, setSliderHighWarning] = useState(highWarning)

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

  // Normalize sparkline values to 0–100% range
  const minVal = sparkline.length > 0 ? Math.min(...sparkline) : 0
  const maxVal = sparkline.length > 0 ? Math.max(...sparkline) : 1
  const range = maxVal - minVal || 1
  const normalize = (v: number) => Math.max(4, ((v - minVal) / range) * 100)

  const numericValue = parseFloat(value)
  const rangePercent = Math.max(0, Math.min(100, ((numericValue - min) / (max - min)) * 100))

  const handleOpenDialog = () => {
    // Only Engineers and Admins are allowed to edit setpoints
    if (role === "operator") return
    setSliderHighAlarm(highAlarm)
    setSliderHighWarning(highWarning)
    setIsEditing(true)
  }

  const handleSaveSetpoints = () => {
    updateSensorSetpoint(id, {
      highAlarm: sliderHighAlarm,
      highWarning: sliderHighWarning,
    })
    setIsEditing(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={role !== "operator" ? { scale: 1.02, y: -2 } : { scale: 1.01 }}
        transition={{ duration: 0.2 }}
        onClick={handleOpenDialog}
        className={cn(
          "glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300",
          colors.glow,
          role !== "operator" && "cursor-pointer hover:border-primary/40",
          status === "critical" && "border-red-500/50 badge-blink"
        )}
      >
        {/* Status indicator */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-lg",
            status === "healthy" && "bg-green-500",
            status === "warning" && "bg-yellow-500",
            status === "critical" && "bg-red-500"
          )}
        />

        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-lg border border-border/10", colors.bg)}>
            <Icon className={cn("w-6 h-6", colors.text)} />
          </div>
          {role !== "operator" && (
            <span className="text-[9px] font-mono text-muted-foreground bg-secondary/50 rounded px-1.5 py-0.5 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
              <Edit2 className="w-2.5 h-2.5" /> Adjust
            </span>
          )}
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground/80 font-mono tracking-wider uppercase">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.span
              key={value}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-extrabold text-foreground font-mono leading-none"
            >
              {value}
            </motion.span>
            <span className="text-xs font-bold text-muted-foreground font-mono">{unit}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-bold flex items-center gap-0.5 font-mono", trendColors[trend])}>
            {trendIcons[trend]} {trendValue}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-mono">VS HOUR STABLE</span>
        </div>

        {/* Mini sparkline */}
        {sparkline.length > 0 && (
          <div className="mt-4 h-8 flex items-end gap-0.5 bg-black/10 rounded p-1 border border-border/5">
            {sparkline.map((val, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${normalize(val)}%` }}
                className={cn(
                  "flex-1 rounded-t",
                  status === "healthy" && "bg-green-500/40",
                  status === "warning" && "bg-yellow-500/40",
                  status === "critical" && "bg-red-500/60"
                )}
              />
            ))}
          </div>
        )}

        {/* min/max range indicator bar */}
        <div className="mt-3 relative h-1 bg-secondary/80 rounded-full overflow-hidden">
          <div
            className={cn("absolute top-0 h-full w-2.5 rounded-full transition-all duration-300", 
              status === "healthy" ? "bg-green-500" : status === "warning" ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ left: `calc(${rangePercent}% - 5px)` }}
          />
        </div>
      </motion.div>

      {/* Sleek Glassmorphic Threshold Override dialog */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-2xl p-6 border border-primary/20 relative"
            >
              {/* Close */}
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-foreground">
                  PLC Threshold Config ({id.toUpperCase()})
                </h3>
              </div>

              <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-6">
                Direct register adjustment of telemetry alarm trip limits. Modifying values will recalculate watchdog alarms on subsequent cycles.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-red-500 font-bold">HIGH ALARM LIMIT (Trip level)</span>
                    <span className="font-extrabold text-foreground">{sliderHighAlarm}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(highWarning + 1)}
                    max={max}
                    value={sliderHighAlarm}
                    onChange={(e) => setSliderHighAlarm(Number(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono mt-1">
                    <span>Warning threshold: {highWarning}{unit}</span>
                    <span>Max cap: {max}{unit}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-yellow-500 font-bold">HIGH WARNING LIMIT</span>
                    <span className="font-extrabold text-foreground">{sliderHighWarning}{unit}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={Math.round(sliderHighAlarm - 1)}
                    value={sliderHighWarning}
                    onChange={(e) => setSliderHighWarning(Number(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono mt-1">
                    <span>Min floor: {min}{unit}</span>
                    <span>Alarm threshold: {sliderHighAlarm}{unit}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSetpoints}
                  className="flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg glow-blue"
                >
                  Write to PLC
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

