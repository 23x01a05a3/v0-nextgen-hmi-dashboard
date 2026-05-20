"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, XCircle, Server, Cpu, HardDrive, Wifi, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemStatus {
  id: string
  name: string
  status: "online" | "warning" | "offline"
  uptime: string
  load: number
  icon: typeof Server
}

const systems: SystemStatus[] = [
  { id: "1", name: "Main PLC", status: "online", uptime: "99.9%", load: 45, icon: Cpu },
  { id: "2", name: "SCADA Server", status: "online", uptime: "99.7%", load: 62, icon: Server },
  { id: "3", name: "HMI Station 1", status: "online", uptime: "99.8%", load: 38, icon: HardDrive },
  { id: "4", name: "HMI Station 2", status: "warning", uptime: "98.5%", load: 78, icon: HardDrive },
  { id: "5", name: "Network Gateway", status: "online", uptime: "99.9%", load: 25, icon: Wifi },
  { id: "6", name: "Backup Server", status: "offline", uptime: "0%", load: 0, icon: Server },
]

export function SystemHealth() {
  const onlineCount = systems.filter((s) => s.status === "online").length
  const warningCount = systems.filter((s) => s.status === "warning").length
  const offlineCount = systems.filter((s) => s.status === "offline").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">System Health</h2>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              <span className="text-green-500 font-bold">{onlineCount}</span> Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              <span className="text-yellow-500 font-bold">{warningCount}</span> Warning
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">
              <span className="text-red-500 font-bold">{offlineCount}</span> Offline
            </span>
          </div>
        </div>
      </div>

      {/* System Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {systems.map((system, index) => (
          <SystemCard key={system.id} system={system} index={index} />
        ))}
      </div>
    </motion.div>
  )
}

function SystemCard({ system, index }: { system: SystemStatus; index: number }) {
  const statusConfig = {
    online: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      icon: CheckCircle,
    },
    warning: {
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      icon: AlertTriangle,
    },
    offline: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: XCircle,
    },
  }

  const config = statusConfig[system.status]
  const StatusIcon = config.icon
  const SystemIcon = system.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass rounded-lg p-3 border transition-all hover:border-primary/30",
        config.border
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <SystemIcon className={cn("w-4 h-4", config.color)} />
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={cn("w-4 h-4", config.color)} />
          <span className={cn("text-xs font-medium capitalize", config.color)}>
            {system.status}
          </span>
        </div>
      </div>

      <p className="font-medium text-foreground text-sm mb-2">{system.name}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Uptime</span>
          <span className="text-foreground font-mono">{system.uptime}</span>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Load</span>
            <span className="text-foreground font-mono">{system.load}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${system.load}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "h-full rounded-full",
                system.load < 50 && "bg-green-500",
                system.load >= 50 && system.load < 80 && "bg-yellow-500",
                system.load >= 80 && "bg-red-500"
              )}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
