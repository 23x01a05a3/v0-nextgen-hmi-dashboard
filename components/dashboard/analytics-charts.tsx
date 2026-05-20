"use client"

import { useState, useEffect } from "react"
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
} from "recharts"
import { TrendingUp, BarChart3, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

// Generate mock data
const generateTimeSeriesData = () => {
  const data = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    data.push({
      time: time.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false }),
      temperature: Math.floor(65 + Math.random() * 20),
      pressure: Math.floor(45 + Math.random() * 15),
      power: Math.floor(70 + Math.random() * 25),
    })
  }
  return data
}

const productionData = [
  { name: "Mon", actual: 4200, target: 4000 },
  { name: "Tue", actual: 3800, target: 4000 },
  { name: "Wed", actual: 4500, target: 4000 },
  { name: "Thu", actual: 4100, target: 4000 },
  { name: "Fri", actual: 4300, target: 4000 },
  { name: "Sat", actual: 3200, target: 3000 },
  { name: "Sun", actual: 2800, target: 3000 },
]

const efficiencyData = [
  { name: "Unit 1", efficiency: 94 },
  { name: "Unit 2", efficiency: 87 },
  { name: "Unit 3", efficiency: 91 },
  { name: "Unit 4", efficiency: 78 },
  { name: "Unit 5", efficiency: 95 },
]

type ChartType = "realtime" | "production" | "efficiency"

export function AnalyticsCharts() {
  const [activeChart, setActiveChart] = useState<ChartType>("realtime")
  const [realtimeData, setRealtimeData] = useState(generateTimeSeriesData())

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData((prev) => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        newData.push({
          time: now.toLocaleTimeString("en-US", { hour: "2-digit", hour12: false }),
          temperature: Math.floor(65 + Math.random() * 20),
          pressure: Math.floor(45 + Math.random() * 15),
          power: Math.floor(70 + Math.random() * 25),
        })
        return newData
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const chartTabs = [
    { id: "realtime" as const, label: "Real-time", icon: Activity },
    { id: "production" as const, label: "Production", icon: BarChart3 },
    { id: "efficiency" as const, label: "Efficiency", icon: TrendingUp },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header with tabs */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Live Analytics</h2>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-500"
              />
              Live
            </span>
          </div>
        </div>

        <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex-1 justify-center",
                activeChart === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-4 h-[300px]">
        {activeChart === "realtime" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={realtimeData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 25, 40, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#3b82f6"
                fill="url(#tempGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="pressure"
                name="Pressure (PSI)"
                stroke="#22d3ee"
                fill="url(#pressGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="power"
                name="Power (%)"
                stroke="#22c55e"
                fill="url(#powerGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === "production" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 25, 40, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="actual" name="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === "efficiency" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={efficiencyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 25, 40, 0.95)",
                  border: "1px solid rgba(100, 180, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: number) => [`${value}%`, "Efficiency"]}
              />
              <Bar
                dataKey="efficiency"
                name="Efficiency"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
                label={{
                  position: "right",
                  fill: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  formatter: (value: number) => `${value}%`,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  )
}
