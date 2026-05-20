"use client"

import { motion } from "framer-motion"
import { Gauge, Thermometer, Zap, Wind, Droplets, Waves } from "lucide-react"
import { cn } from "@/lib/utils"

interface MachineStatus {
  id: string
  name: string
  status: "running" | "idle" | "maintenance" | "error"
  metrics: {
    speed: number
    temperature: number
    efficiency: number
  }
}

const machines: MachineStatus[] = [
  {
    id: "1",
    name: "Assembly Robot A1",
    status: "running",
    metrics: { speed: 92, temperature: 45, efficiency: 98 },
  },
  {
    id: "2",
    name: "CNC Machine M3",
    status: "running",
    metrics: { speed: 78, temperature: 62, efficiency: 87 },
  },
  {
    id: "3",
    name: "Conveyor System C2",
    status: "idle",
    metrics: { speed: 0, temperature: 28, efficiency: 0 },
  },
  {
    id: "4",
    name: "Press Unit P5",
    status: "error",
    metrics: { speed: 0, temperature: 85, efficiency: 0 },
  },
  {
    id: "5",
    name: "Welding Station W1",
    status: "maintenance",
    metrics: { speed: 0, temperature: 32, efficiency: 0 },
  },
  {
    id: "6",
    name: "Packaging Line L2",
    status: "running",
    metrics: { speed: 88, temperature: 38, efficiency: 94 },
  },
]

export function MachineHealthStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Machine Health Status</h2>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Running
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Idle
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Maintenance
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Error
            </span>
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine, index) => (
          <MachineCard key={machine.id} machine={machine} index={index} />
        ))}
      </div>
    </motion.div>
  )
}

function MachineCard({ machine, index }: { machine: MachineStatus; index: number }) {
  const statusConfig = {
    running: {
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      label: "Running",
    },
    idle: {
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      label: "Idle",
    },
    maintenance: {
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      label: "Maintenance",
    },
    error: {
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "Error",
    },
  }

  const config = statusConfig[machine.status]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "glass rounded-xl p-4 border transition-all hover:border-primary/30",
        config.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-medium text-foreground">{machine.name}</p>
          <span className={cn("text-xs font-medium mt-1 inline-block", config.color)}>
            {config.label}
          </span>
        </div>
        <motion.div
          animate={
            machine.status === "running"
              ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
          className={cn("w-3 h-3 rounded-full", {
            "bg-green-500": machine.status === "running",
            "bg-yellow-500": machine.status === "idle",
            "bg-blue-500": machine.status === "maintenance",
            "bg-red-500": machine.status === "error",
          })}
        />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <MetricBadge
          icon={Zap}
          label="Speed"
          value={`${machine.metrics.speed}%`}
          color={machine.metrics.speed > 50 ? "text-green-500" : "text-yellow-500"}
        />
        <MetricBadge
          icon={Thermometer}
          label="Temp"
          value={`${machine.metrics.temperature}°C`}
          color={
            machine.metrics.temperature > 70
              ? "text-red-500"
              : machine.metrics.temperature > 50
              ? "text-yellow-500"
              : "text-green-500"
          }
        />
        <MetricBadge
          icon={Gauge}
          label="Eff."
          value={`${machine.metrics.efficiency}%`}
          color={machine.metrics.efficiency > 80 ? "text-green-500" : "text-yellow-500"}
        />
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Overall Health</span>
          <span className="text-foreground font-mono">
            {Math.round(
              (machine.metrics.speed + machine.metrics.efficiency) / 2
            )}
            %
          </span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(machine.metrics.speed + machine.metrics.efficiency) / 2}%`,
            }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
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
    <div className="text-center">
      <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
      <p className={cn("text-sm font-mono font-bold", color)}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
