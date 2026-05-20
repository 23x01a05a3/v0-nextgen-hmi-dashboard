"use client"

import { motion } from "framer-motion"
import { AlertTriangle, AlertCircle, Bell, X, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Alarm {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  location: string
  time: string
  acknowledged: boolean
}

const initialAlarms: Alarm[] = [
  {
    id: "1",
    type: "critical",
    title: "High Temperature",
    location: "Reactor Unit 3",
    time: "2 min ago",
    acknowledged: false,
  },
  {
    id: "2",
    type: "critical",
    title: "Pressure Limit Exceeded",
    location: "Valve Assembly B2",
    time: "5 min ago",
    acknowledged: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Vibration Detected",
    location: "Motor Drive M7",
    time: "12 min ago",
    acknowledged: true,
  },
  {
    id: "4",
    type: "warning",
    title: "Low Coolant Level",
    location: "Cooling System C1",
    time: "18 min ago",
    acknowledged: false,
  },
  {
    id: "5",
    type: "info",
    title: "Maintenance Due",
    location: "Conveyor Belt A3",
    time: "1 hour ago",
    acknowledged: true,
  },
]

export function AlarmPanel() {
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms)
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all")

  const filteredAlarms = alarms.filter(
    (alarm) => filter === "all" || alarm.type === filter
  )

  const acknowledgeAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, acknowledged: true } : alarm
      )
    )
  }

  const dismissAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id))
  }

  const criticalCount = alarms.filter((a) => a.type === "critical" && !a.acknowledged).length
  const warningCount = alarms.filter((a) => a.type === "warning" && !a.acknowledged).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Active Alarms</h2>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs font-bold rounded-full"
              >
                {criticalCount} Critical
              </motion.span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full">
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {(["all", "critical", "warning", "info"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize",
                filter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alarm List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAlarms.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No alarms to display</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/30">
            {filteredAlarms.map((alarm, index) => (
              <AlarmItem
                key={alarm.id}
                alarm={alarm}
                index={index}
                onAcknowledge={() => acknowledgeAlarm(alarm.id)}
                onDismiss={() => dismissAlarm(alarm.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-secondary/30">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
          View Alarm History
        </button>
      </div>
    </motion.div>
  )
}

function AlarmItem({
  alarm,
  index,
  onAcknowledge,
  onDismiss,
}: {
  alarm: Alarm
  index: number
  onAcknowledge: () => void
  onDismiss: () => void
}) {
  const typeConfig = {
    critical: {
      icon: AlertCircle,
      bg: "bg-red-500/10",
      border: "border-l-red-500",
      iconColor: "text-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-500/10",
      border: "border-l-yellow-500",
      iconColor: "text-yellow-500",
    },
    info: {
      icon: Bell,
      bg: "bg-blue-500/10",
      border: "border-l-blue-500",
      iconColor: "text-blue-500",
    },
  }

  const config = typeConfig[alarm.type]
  const Icon = config.icon

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-3 border-l-4 transition-colors hover:bg-secondary/30",
        config.border,
        alarm.acknowledged && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground text-sm">{alarm.title}</p>
            {!alarm.acknowledged && alarm.type === "critical" && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded"
              >
                NEW
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{alarm.location}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{alarm.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!alarm.acknowledged && (
            <button
              onClick={onAcknowledge}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Acknowledge"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.li>
  )
}
