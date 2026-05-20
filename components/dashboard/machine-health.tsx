"use client"

import { motion } from "framer-motion"
import { Gauge, Thermometer, Zap, Play, Square, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"
import { rolePermissions } from "@/lib/types"

export function MachineHealthStatus() {
  const { machines, role, controlMachine } = useHmi()
  const permissions = rolePermissions[role]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-wider uppercase text-sm font-mono">Process Actuators</h2>
          </div>
          <div className="flex gap-3 text-[10px] font-mono flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow shadow-green-500/50" />
              RUNNING
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500 shadow shadow-yellow-500/50" />
              IDLE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow shadow-blue-500/50" />
              MAINT
            </span>
            <span className="flex items-center gap-1.5 text-red-500 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow shadow-red-500/50 animate-ping" />
              ERROR
            </span>
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {machines.map((machine, index) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            index={index}
            canControl={permissions.canControlMachines}
            onControl={(action) => controlMachine(machine.id, action)}
          />
        ))}
      </div>
    </motion.div>
  )
}

function MachineCard({
  machine,
  index,
  canControl,
  onControl,
}: {
  machine: any
  index: number
  canControl: boolean
  onControl: (action: "start" | "stop" | "maintenance") => void
}) {
  const statusConfig = {
    running: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      label: "RUNNING",
    },
    idle: {
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      label: "IDLE",
    },
    maintenance: {
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      label: "MAINTENANCE",
    },
    error: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "FAULT (E-STOP)",
    },
  }

  const config = statusConfig[machine.status as "running" | "idle" | "maintenance" | "error"] || statusConfig.idle
  const healthScore = machine.status === "error" ? 15 : Math.round((machine.speed + machine.efficiency) / 2)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(6, index) * 0.04 }}
      className={cn(
        "glass rounded-xl p-4 border transition-all hover:border-primary/30 flex flex-col justify-between",
        config.border,
        machine.status === "error" && "border-red-500/50 bg-red-500/5 badge-blink"
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-foreground text-xs font-mono">{machine.name}</p>
            <span className={cn("text-[10px] font-bold font-mono tracking-wider mt-1 inline-block", config.color)}>
              {config.label}
            </span>
          </div>
          <motion.div
            animate={
              machine.status === "running"
                ? { scale: [1, 1.15, 1], opacity: [1, 0.7, 1] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/20", {
              "bg-green-500": machine.status === "running",
              "bg-yellow-500": machine.status === "idle",
              "bg-blue-500": machine.status === "maintenance",
              "bg-red-500": machine.status === "error",
            })}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 py-2 bg-black/20 rounded-lg border border-border/5 mb-4">
          <MetricBadge
            icon={Zap}
            label="Load"
            value={`${machine.speed}%`}
            color={machine.speed > 85 ? "text-orange-400" : machine.speed > 0 ? "text-green-500" : "text-muted-foreground"}
          />
          <MetricBadge
            icon={Thermometer}
            label="Temp"
            value={`${machine.temperature.toFixed(0)}°C`}
            color={
              machine.temperature > 80
                ? "text-red-500 animate-pulse font-extrabold"
                : machine.temperature > 55
                ? "text-yellow-500"
                : "text-green-500"
            }
          />
          <MetricBadge
            icon={Gauge}
            label="OEE"
            value={`${machine.efficiency}%`}
            color={machine.efficiency > 90 ? "text-green-500" : machine.efficiency > 0 ? "text-yellow-500" : "text-muted-foreground"}
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span className="text-muted-foreground">OEE Health Score</span>
            <span className="text-foreground font-bold">{healthScore}%</span>
          </div>
          <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                machine.status === "running" && "bg-green-500",
                machine.status === "idle" && "bg-yellow-500",
                machine.status === "maintenance" && "bg-blue-500",
                machine.status === "error" && "bg-red-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Actuator Overrides Control Unit */}
      <div className="pt-3 border-t border-border/10 flex items-center justify-between gap-1.5 font-mono text-[9px]">
        <button
          onClick={() => onControl("start")}
          disabled={!canControl || machine.status === "running"}
          className={cn(
            "flex-1 py-1 rounded flex items-center justify-center gap-1 border border-green-500/20 text-green-500 hover:bg-green-500/10 transition-colors uppercase font-bold",
            (!canControl || machine.status === "running") && "opacity-30 cursor-not-allowed border-none bg-secondary/20"
          )}
          title="Engage Motor Drive"
        >
          <Play className="w-2.5 h-2.5" /> RUN
        </button>
        <button
          onClick={() => onControl("stop")}
          disabled={!canControl || machine.status === "idle"}
          className={cn(
            "flex-1 py-1 rounded flex items-center justify-center gap-1 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10 transition-colors uppercase font-bold",
            (!canControl || machine.status === "idle") && "opacity-30 cursor-not-allowed border-none bg-secondary/20"
          )}
          title="Shutdown Drive Coil"
        >
          <Square className="w-2.5 h-2.5" /> STOP
        </button>
        <button
          onClick={() => onControl("maintenance")}
          disabled={!canControl || machine.status === "maintenance"}
          className={cn(
            "flex-1 py-1 rounded flex items-center justify-center gap-1 border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-colors uppercase font-bold",
            (!canControl || machine.status === "maintenance") && "opacity-30 cursor-not-allowed border-none bg-secondary/20"
          )}
          title="Dispatch Diagnostic Override"
        >
          <Wrench className="w-2.5 h-2.5" /> MAINT
        </button>
      </div>
    </motion.div>
  )
}

function MetricBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Gauge
  label: string
  value: string
  color: string
}) {
  return (
    <div className="text-center flex-1">
      <Icon className={cn("w-3.5 h-3.5 mx-auto mb-1 opacity-70", color)} />
      <p className={cn("text-xs font-mono font-bold leading-none", color)}>{value}</p>
      <p className="text-[8px] text-muted-foreground mt-0.5 tracking-tighter uppercase">{label}</p>
    </div>
  )
}

