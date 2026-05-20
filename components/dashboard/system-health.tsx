"use client"

import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, XCircle, Server, Cpu, HardDrive, Wifi, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"

export function SystemHealth() {
  const { systemNodes, systemHealth, toggleNodeStatus, role } = useHmi()

  const onlineCount = systemNodes.filter((s) => s.status === "online").length
  const warningCount = systemNodes.filter((s) => s.status === "warning").length
  const offlineCount = systemNodes.filter((s) => s.status === "offline").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-wider uppercase text-sm font-mono flex items-center gap-1.5">
              Infrastructure Topology
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground font-bold">Health Score:</span>
            <span className={cn(
              "font-extrabold text-sm",
              systemHealth > 80 ? "text-green-500" : systemHealth > 50 ? "text-yellow-500" : "text-red-500 animate-pulse"
            )}>
              {systemHealth}%
            </span>
          </div>
        </div>

        {/* Status Summary */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-green-500 font-bold">{onlineCount}</span> ONLINE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-yellow-500 font-bold">{warningCount}</span> WARNING
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-mono text-muted-foreground">
              <span className="text-red-500 font-bold">{offlineCount}</span> FAULT
            </span>
          </div>
        </div>
      </div>

      {/* System Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {systemNodes.map((system, index) => (
          <SystemCard
            key={system.id}
            system={system}
            index={index}
            isAdmin={role === "admin"}
            onToggleNode={() => {
              const statusCycles: Record<string, "online" | "warning" | "offline"> = {
                online: "warning",
                warning: "offline",
                offline: "online",
              }
              toggleNodeStatus(system.id, statusCycles[system.status])
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function SystemCard({
  system,
  index,
  isAdmin,
  onToggleNode,
}: {
  system: any
  index: number
  isAdmin: boolean
  onToggleNode: () => void
}) {
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

  const iconMap: Record<string, any> = {
    cpu: Cpu,
    server: Server,
    "hard-drive": HardDrive,
    wifi: Wifi,
  }

  const config = statusConfig[system.status as "online" | "warning" | "offline"] || statusConfig.online
  const StatusIcon = config.icon
  const SystemIcon = iconMap[system.iconName] || Server

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(6, index) * 0.04 }}
      onClick={isAdmin ? onToggleNode : undefined}
      className={cn(
        "glass rounded-lg p-3 border transition-all flex flex-col justify-between select-none",
        config.border,
        isAdmin ? "cursor-pointer hover:border-primary/50" : "",
        system.status === "offline" && "border-red-500/40 bg-red-500/5 badge-blink"
      )}
      title={isAdmin ? "Click to toggle node state registers (Admin override)" : ""}
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-1.5 rounded border border-border/10", config.bg)}>
            <SystemIcon className={cn("w-4 h-4", config.color)} />
          </div>
          <div className="flex items-center gap-1">
            <StatusIcon className={cn("w-3.5 h-3.5", config.color)} />
            <span className={cn("text-[9px] font-bold font-mono uppercase tracking-wider", config.color)}>
              {system.status}
            </span>
          </div>
        </div>

        <p className="font-semibold text-foreground text-xs font-mono mb-2">{system.name}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted-foreground">Uptime</span>
          <span className="text-foreground font-bold">{system.uptime}</span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-muted-foreground">Bus Load</span>
            <span className="text-foreground font-bold">{system.load}%</span>
          </div>
          <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${system.load}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                system.load < 50 && "bg-green-500",
                system.load >= 50 && system.load < 80 && "bg-yellow-500",
                system.load >= 80 && "bg-red-500"
              )}
            />
          </div>
        </div>
        {isAdmin && (
          <p className="text-[8px] text-muted-foreground/40 font-mono text-right italic pt-1">
            Admin Override Toggle
          </p>
        )}
      </div>
    </motion.div>
  )
}

