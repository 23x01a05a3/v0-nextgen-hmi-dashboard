"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, AlertCircle, Bell, X, Clock, Volume2, VolumeX, ShieldAlert, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useHmi } from "@/lib/hmi-context"
import { rolePermissions } from "@/lib/types"

export function AlarmPanel() {
  const {
    role,
    alarms,
    alarmHistory,
    acknowledgeAlarm,
    resolveAlarm,
    acknowledgeAllAlarms,
    resolveAllAlarms
  } = useHmi()

  const [activeTab, setActiveTab] = useState<"active" | "history">("active")
  const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all")
  const [muted, setMuted] = useState(false)

  const activeList = activeTab === "active" ? alarms : alarmHistory

  const filteredAlarms = activeList.filter(
    (alarm) => filter === "all" || alarm.type === filter
  )

  const permissions = rolePermissions[role]

  const criticalCount = alarms.filter((a) => a.type === "critical" && !a.acknowledged).length
  const highCount  = alarms.filter((a) => a.type === "high"  && !a.acknowledged).length
  const warningCount = highCount + alarms.filter((a) => (a.type === "medium" || a.type === "low") && !a.acknowledged).length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl overflow-hidden h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="font-semibold text-foreground tracking-wider uppercase text-sm font-mono">SCADA Watchdog</h2>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-mono font-bold rounded border border-red-500/30 tracking-tight"
                role="status"
              >
                {criticalCount} CRIT
              </motion.span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-mono font-bold rounded border border-yellow-500/30 tracking-tight">
                {warningCount} WARN
              </span>
            )}
            <button
              onClick={() => setMuted(!muted)}
              className="p-1.5 rounded bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors border border-border/40"
              title={muted ? "Unmute alarm sounds" : "Mute alarm sounds"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-primary" />}
            </button>
          </div>
        </div>

        {/* Mode switcher Tabs */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-border/10 mb-3">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex-1 py-1 text-xs font-mono font-medium rounded transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
              activeTab === "active"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Active Alarms ({alarms.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 py-1 text-xs font-mono font-medium rounded transition-all uppercase tracking-wider flex items-center justify-center gap-1.5",
              activeTab === "history"
                ? "bg-secondary text-foreground border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="w-3.5 h-3.5" />
            Log History ({alarmHistory.length})
          </button>
        </div>

        {/* Severity Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 select-none" role="group" aria-label="Filter alarms">
          {(["all", "critical", "high", "medium", "low"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-colors uppercase tracking-wider",
                filter === type
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/20"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Alarm List */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        {filteredAlarms.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">No alarms active in registers</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/20">
            <AnimatePresence initial={false}>
              {filteredAlarms.map((alarm, index) => (
                <AlarmItem
                  key={alarm.id}
                  alarm={alarm}
                  index={index}
                  canAcknowledge={permissions.canAcknowledgeAlarms}
                  canResolve={permissions.canResolveAlarms}
                  onAcknowledge={() => acknowledgeAlarm(alarm.id)}
                  onResolve={() => resolveAlarm(alarm.id)}
                  isLogMode={activeTab === "history"}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Footer controls */}
      {activeTab === "active" && alarms.length > 0 && (
        <div className="p-3 border-t border-border/50 bg-secondary/30 flex items-center justify-between gap-4 font-mono text-[11px]">
          <button
            onClick={acknowledgeAllAlarms}
            disabled={!permissions.canAcknowledgeAlarms}
            className={cn(
              "text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase font-bold",
              !permissions.canAcknowledgeAlarms && "opacity-40 cursor-not-allowed"
            )}
            title={!permissions.canAcknowledgeAlarms ? "Operator roles only" : ""}
          >
            ✓ Ack All Registers
          </button>
          <button
            onClick={resolveAllAlarms}
            disabled={!permissions.canResolveAlarms}
            className={cn(
              "text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-1 uppercase font-bold",
              !permissions.canResolveAlarms && "opacity-40 cursor-not-allowed"
            )}
            title={!permissions.canResolveAlarms ? "Engineer/Admin clearances required" : ""}
          >
            🗙 Resolve All
          </button>
        </div>
      )}
    </motion.div>
  )
}

interface AlarmItemProps {
  alarm: any
  index: number
  canAcknowledge: boolean
  canResolve: boolean
  onAcknowledge: () => void
  onResolve: () => void
  isLogMode: boolean
}

function AlarmItem({
  alarm,
  index,
  canAcknowledge,
  canResolve,
  onAcknowledge,
  onResolve,
  isLogMode
}: AlarmItemProps) {
  const typeConfig = {
    critical: {
      icon: AlertCircle,
      bg: "bg-red-500/10",
      border: "border-l-red-600",
      iconColor: "text-red-500",
    },
    high: {
      icon: AlertTriangle,
      bg: "bg-orange-500/10",
      border: "border-l-orange-500",
      iconColor: "text-orange-500",
    },
    medium: {
      icon: AlertTriangle,
      bg: "bg-yellow-500/10",
      border: "border-l-yellow-500",
      iconColor: "text-yellow-500",
    },
    low: {
      icon: Bell,
      bg: "bg-blue-500/10",
      border: "border-l-blue-500",
      iconColor: "text-blue-500",
    },
  }

  const config = typeConfig[alarm.type as "critical" | "high" | "medium" | "low"] || typeConfig.low
  const Icon = config.icon

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ delay: Math.min(10, index) * 0.02 }}
      className={cn(
        "p-3 border-l-4 transition-colors hover:bg-secondary/20",
        config.border,
        alarm.acknowledged && !alarm.resolved && "opacity-80 hover:opacity-100",
        alarm.resolved && "opacity-60 bg-black/10 border-l-muted-foreground"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-1.5 rounded flex-shrink-0 border border-border/10", config.bg)}>
          <Icon className={cn("w-4 h-4", config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-semibold text-foreground text-xs font-mono">{alarm.title}</p>
            {!alarm.acknowledged && (
              <span className="badge-blink px-1 py-0.2 bg-red-600/90 text-white text-[9px] font-mono font-bold rounded">
                NEW
              </span>
            )}
            {alarm.acknowledged && !alarm.resolved && (
              <span className="px-1 py-0.2 bg-secondary text-muted-foreground text-[9px] font-mono rounded border border-border/40">
                ACK
              </span>
            )}
            {alarm.resolved && (
              <span className="px-1 py-0.2 bg-green-500/20 text-green-500 text-[9px] font-mono rounded border border-green-500/30">
                RESOLVED
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">{alarm.location}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] font-mono">
            {alarm.tag && (
              <span className="text-primary font-bold">{alarm.tag}</span>
            )}
            {alarm.value !== undefined && (
              <span className="text-muted-foreground/80">
                Val: <strong className="text-foreground">{alarm.value}{alarm.unit}</strong>
              </span>
            )}
            {alarm.setpoint !== undefined && (
              <span className="text-muted-foreground/60">
                Limit: {alarm.setpoint}{alarm.unit}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground/50 font-mono">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(alarm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            {alarm.acknowledgedBy && (
              <span>• Acked: {alarm.acknowledgedBy}</span>
            )}
            {alarm.resolvedBy && (
              <span>• Closed: {alarm.resolvedBy}</span>
            )}
          </div>
        </div>

        {/* Operational buttons */}
        {!isLogMode && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Acknowledge Button */}
            {!alarm.acknowledged && (
              <button
                onClick={onAcknowledge}
                disabled={!canAcknowledge}
                className={cn(
                  "p-1 rounded bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all border border-primary/30",
                  !canAcknowledge && "opacity-40 cursor-not-allowed"
                )}
                title={canAcknowledge ? "Acknowledge alarm registry" : "Unauthorized for Operator role"}
              >
                ✓
              </button>
            )}

            {/* Resolve Button */}
            {!alarm.resolved && (
              <button
                onClick={onResolve}
                disabled={!canResolve}
                className={cn(
                  "p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-500/30",
                  !canResolve && "opacity-40 cursor-not-allowed"
                )}
                title={canResolve ? "Engage resolution bypass" : "Engineer/Admin clearances required"}
              >
                🗙
              </button>
            )}
          </div>
        )}
      </div>
    </motion.li>
  )
}

