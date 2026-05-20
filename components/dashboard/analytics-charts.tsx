"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts"
import { TrendingUp, BarChart3, Activity, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"

type ChartType = "realtime" | "limits" | "alarms"

export function AnalyticsCharts() {
  const { sensorHistory, sensors, alarms, alarmHistory } = useHmi()
  const [activeChart, setActiveChart] = useState<ChartType>("realtime")

  // Align history array data elements synchronously by index
  const alignedTelemetry = sensorHistory.temp?.map((item, idx) => {
    return {
      time: item.time,
      temperature: item.value,
      pressure: sensorHistory.pressure?.[idx]?.value ?? 45,
      flowrate: sensorHistory.flowrate?.[idx]?.value ?? 1250,
      vibration: sensorHistory.vibration?.[idx]?.value ?? 0.4,
    }
  }) ?? []

  // Extract setpoints dynamically
  const tempSensor = sensors.find((s) => s.id === "temp")
  const tempHighAlarm = tempSensor?.highAlarm ?? 90
  const tempHighWarning = tempSensor?.highWarning ?? 80

  const pressSensor = sensors.find((s) => s.id === "pressure")
  const pressHighAlarm = pressSensor?.highAlarm ?? 75

  // Live Alarm Tallies
  const allHistoricalAlarms = [...alarms, ...alarmHistory]
  const countsBySeverity = {
    critical: allHistoricalAlarms.filter((a) => a.type === "critical").length,
    high: allHistoricalAlarms.filter((a) => a.type === "high").length,
    medium: allHistoricalAlarms.filter((a) => a.type === "medium").length,
    low: allHistoricalAlarms.filter((a) => a.type === "low").length,
  }

  const alarmTallyData = [
    { name: "Critical", count: countsBySeverity.critical, fill: "#ef4444" },
    { name: "High", count: countsBySeverity.high, fill: "#f97316" },
    { name: "Medium", count: countsBySeverity.medium, fill: "#eab308" },
    { name: "Low", count: countsBySeverity.low, fill: "#3b82f6" },
  ]

  const chartTabs = [
    { id: "realtime" as const, label: "Live SCADA", icon: Activity },
    { id: "limits" as const, label: "Trip Limits", icon: ShieldAlert },
    { id: "alarms" as const, label: "Alarm Tallies", icon: BarChart3 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header with tabs */}
      <div className="p-4 border-b border-border/50 bg-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-foreground tracking-wider uppercase text-sm font-mono flex items-center gap-1.5">
              Telemetry Analytics
            </h2>
            <p className="text-[10px] text-muted-foreground font-mono">Real-time registers & ISA alarms feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono font-bold">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2.5 h-2.5 rounded-full bg-green-500 shadow shadow-green-500/50"
              />
              PLC ACTIVE
            </span>
          </div>
        </div>

        <div className="flex gap-1 bg-black/45 p-1 rounded-lg border border-border/10">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all flex-1 justify-center tracking-wider",
                activeChart === tab.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 h-[300px]">
        {activeChart === "realtime" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={alignedTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 12, 18, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Reactor Temp (°C)"
                stroke="#3b82f6"
                fill="url(#tempGradient)"
                strokeWidth={1.5}
                activeDot={{ r: 4 }}
              />
              <Area
                type="monotone"
                dataKey="pressure"
                name="Steam Press (PSI)"
                stroke="#eab308"
                fill="url(#pressGradient)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "limits" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={alignedTelemetry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                domain={[0, 120]}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 12, 18, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
              <Line
                type="monotone"
                dataKey="temperature"
                name="Reactor Temp Value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              {/* Active Trip Limit Lines */}
              <ReferenceLine
                y={tempHighAlarm}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: `Temp HIGH ALARM: ${tempHighAlarm}°C`, fill: "#ef4444", fontSize: 9, position: "top", fontFamily: "monospace" }}
              />
              <ReferenceLine
                y={tempHighWarning}
                stroke="#f97316"
                strokeDasharray="3 3"
                label={{ value: `Temp High Warning: ${tempHighWarning}°C`, fill: "#f97316", fontSize: 9, position: "bottom", fontFamily: "monospace" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeChart === "alarms" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alarmTallyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                allowDecimals={false}
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "monospace" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10, 12, 18, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              />
              <Bar dataKey="count" name="Alarms Count" radius={[4, 4, 0, 0]}>
                {alarmTallyData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}

