"use client"

import { motion } from "framer-motion"
import { Activity, ArrowUpRight, ArrowDownRight, Minus, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "start" | "stop" | "change" | "alert" | "maintenance"
  message: string
  timestamp: string
  user?: string
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "start",
    message: "Production Line A started",
    timestamp: "2 min ago",
    user: "System",
  },
  {
    id: "2",
    type: "change",
    message: "Temperature setpoint changed to 75°C",
    timestamp: "5 min ago",
    user: "Admin",
  },
  {
    id: "3",
    type: "alert",
    message: "High pressure warning acknowledged",
    timestamp: "8 min ago",
    user: "Operator",
  },
  {
    id: "4",
    type: "maintenance",
    message: "Scheduled maintenance completed on Unit 2",
    timestamp: "15 min ago",
    user: "Tech Team",
  },
  {
    id: "5",
    type: "stop",
    message: "Conveyor B2 stopped for inspection",
    timestamp: "22 min ago",
    user: "Supervisor",
  },
  {
    id: "6",
    type: "start",
    message: "Backup generator test initiated",
    timestamp: "30 min ago",
    user: "System",
  },
  {
    id: "7",
    type: "change",
    message: "Cooling fan speed adjusted to 80%",
    timestamp: "45 min ago",
    user: "Admin",
  },
]

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Live Activity</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Real-time system events</p>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y divide-border/30">
          {activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 bg-secondary/30">
        <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
          View Full Activity Log
        </button>
      </div>
    </motion.div>
  )
}

function ActivityItem({ activity, index }: { activity: ActivityItem; index: number }) {
  const typeConfig = {
    start: {
      icon: ArrowUpRight,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    stop: {
      icon: ArrowDownRight,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    change: {
      icon: Minus,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    alert: {
      icon: Activity,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    maintenance: {
      icon: Activity,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
  }

  const config = typeConfig[activity.type]
  const Icon = config.icon

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 hover:bg-secondary/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-1.5 rounded-lg flex-shrink-0 mt-0.5", config.bg)}>
          <Icon className={cn("w-3.5 h-3.5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-tight">{activity.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
            {activity.user && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{activity.user}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  )
}
