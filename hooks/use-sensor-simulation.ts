"use client"

import { useState, useEffect } from "react"
import type { SensorReading } from "@/lib/types"

const INITIAL_SENSORS: SensorReading[] = [
  {
    id: "temp",
    title: "Temperature",
    value: "72.5",
    unit: "°C",
    status: "healthy",
    trend: "up",
    trendValue: "+2.3%",
    sparkline: [60, 65, 70, 68, 72, 75, 73, 72],
    min: 0,
    max: 120,
    highAlarm: 90,
    highWarning: 80,
    lowWarning: 10,
    lowAlarm: 5,
  },
  {
    id: "pressure",
    title: "Pressure",
    value: "45.8",
    unit: "PSI",
    status: "healthy",
    trend: "stable",
    trendValue: "+0.1%",
    sparkline: [45, 46, 45, 45, 46, 45, 46, 45],
    min: 0,
    max: 100,
    highAlarm: 90,
    highWarning: 75,
    lowWarning: 5,
    lowAlarm: 2,
  },
  {
    id: "voltage",
    title: "Voltage",
    value: "398",
    unit: "V",
    status: "warning",
    trend: "down",
    trendValue: "-1.2%",
    sparkline: [405, 402, 400, 398, 399, 397, 398, 398],
    min: 350,
    max: 450,
    highAlarm: 440,
    highWarning: 420,
    lowWarning: 395,
    lowAlarm: 385,
  },
  {
    id: "humidity",
    title: "Humidity",
    value: "58",
    unit: "%",
    status: "healthy",
    trend: "up",
    trendValue: "+5.0%",
    sparkline: [52, 54, 55, 56, 57, 58, 58, 58],
    min: 0,
    max: 100,
    highAlarm: 85,
    highWarning: 75,
    lowWarning: 10,
    lowAlarm: 5,
  },
  {
    id: "airflow",
    title: "Airflow",
    value: "1250",
    unit: "CFM",
    status: "healthy",
    trend: "stable",
    trendValue: "+0.0%",
    sparkline: [1248, 1250, 1249, 1251, 1250, 1250, 1249, 1250],
    min: 800,
    max: 1600,
    highAlarm: 1500,
    highWarning: 1400,
    lowWarning: 950,
    lowAlarm: 900,
  },
  {
    id: "vibration",
    title: "Vibration",
    value: "0.85",
    unit: "mm/s",
    status: "critical",
    trend: "up",
    trendValue: "+12%",
    sparkline: [0.65, 0.70, 0.72, 0.78, 0.80, 0.82, 0.84, 0.85],
    min: 0,
    max: 2,
    highAlarm: 1.2,
    highWarning: 0.8,
    lowWarning: 0.05,
    lowAlarm: 0.01,
  },
]

// Per-sensor simulation config
const SENSOR_CONFIG: Record<string, { drift: number; decimals: number }> = {
  temp:      { drift: 0.8,  decimals: 1 },
  pressure:  { drift: 0.3,  decimals: 1 },
  voltage:   { drift: 1.5,  decimals: 0 },
  humidity:  { drift: 0.5,  decimals: 0 },
  airflow:   { drift: 5,    decimals: 0 },
  vibration: { drift: 0.02, decimals: 2 },
}

function deriveStatus(id: string, value: number): SensorReading["status"] {
  const thresholds: Record<string, { warning: number; critical: number }> = {
    temp:      { warning: 80,   critical: 90   },
    pressure:  { warning: 75,   critical: 90   },
    voltage:   { warning: 395,  critical: 385  }, // below threshold = bad
    humidity:  { warning: 75,   critical: 85   },
    airflow:   { warning: 950,  critical: 900  }, // below threshold = bad
    vibration: { warning: 0.8,  critical: 1.2  },
  }
  const t = thresholds[id]
  if (!t) return "healthy"
  // For voltage and airflow, lower is worse
  if (id === "voltage" || id === "airflow") {
    if (value <= t.critical) return "critical"
    if (value <= t.warning)  return "warning"
    return "healthy"
  }
  if (value >= t.critical) return "critical"
  if (value >= t.warning)  return "warning"
  return "healthy"
}

function deriveTrend(prev: number, current: number): SensorReading["trend"] {
  const delta = current - prev
  if (Math.abs(delta) < 0.01) return "stable"
  return delta > 0 ? "up" : "down"
}

/**
 * Returns live-updating sensor readings. Update interval: 3 seconds.
 * Drop-in replacement for the static sensor data in page.tsx.
 */
export function useSensorSimulation(): SensorReading[] {
  const [sensors, setSensors] = useState<SensorReading[]>(INITIAL_SENSORS)

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) =>
        prev.map((sensor) => {
          const cfg = SENSOR_CONFIG[sensor.id] ?? { drift: 1, decimals: 1 }
          const prevVal = parseFloat(sensor.value)
          const rawNew = prevVal + (Math.random() - 0.48) * cfg.drift
          const min = sensor.min ?? -Infinity
          const max = sensor.max ?? Infinity
          const newVal = Math.max(min, Math.min(max, rawNew))
          const newValStr = newVal.toFixed(cfg.decimals)
          const prevNumeric = parseFloat(sensor.sparkline[sensor.sparkline.length - 2]?.toString() ?? sensor.value)
          const pctChange = prevVal !== 0 ? ((newVal - prevVal) / Math.abs(prevVal)) * 100 : 0

          return {
            ...sensor,
            value: newValStr,
            status: deriveStatus(sensor.id, newVal),
            trend: deriveTrend(prevVal, newVal),
            trendValue: `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%`,
            sparkline: [...sensor.sparkline.slice(1), newVal],
          }
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return sensors
}
