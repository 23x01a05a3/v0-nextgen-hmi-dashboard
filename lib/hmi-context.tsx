"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  Alarm,
  AlarmSeverity,
  SensorReading,
  SensorStatus,
  TrendDirection,
  UserRole,
  AIRecommendation,
  Incident,
  ActivityEvent,
  rolePermissions,
} from "./types"
import { toast } from "sonner"

interface HmiContextType {
  role: UserRole
  user: { name: string; role: UserRole }
  switchRole: (newRole: UserRole) => void
  sensors: SensorReading[]
  sensorHistory: Record<string, { time: string; value: number }[]>
  updateSensorSetpoint: (sensorId: string, limits: Partial<Pick<SensorReading, "highAlarm" | "highWarning" | "lowWarning" | "lowAlarm">>) => void
  alarms: Alarm[]
  alarmHistory: Alarm[]
  acknowledgeAlarm: (alarmId: string) => void
  resolveAlarm: (alarmId: string) => void
  acknowledgeAllAlarms: () => void
  resolveAllAlarms: () => void
  incidents: Incident[]
  incidentHistory: Incident[]
  acknowledgeIncident: (incidentId: string) => void
  resolveIncident: (incidentId: string) => void
  timeline: ActivityEvent[]
  addTimelineEvent: (type: ActivityEvent["type"], message: string) => void
  aiRecommendations: AIRecommendation[]
  executeMitigation: (recId: string) => void
  notifications: { id: string; type: AlarmSeverity; title: string; message: string; time: string; read: boolean }[]
  unreadNotificationsCount: number
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  activeIncidentPopup: Alarm | null
  setActiveIncidentPopup: (alarm: Alarm | null) => void
  systemHealth: number
  systemNodes: { id: string; name: string; status: "online" | "warning" | "offline"; uptime: string; load: number; iconName: string }[]
  toggleNodeStatus: (nodeId: string, status: "online" | "warning" | "offline") => void
  isSimulationActive: boolean
  setSimulationActive: (active: boolean) => void
  simulationSpeed: number
  setSimulationSpeed: (speed: number) => void
  machines: { id: string; name: string; status: "running" | "idle" | "maintenance" | "error"; speed: number; temperature: number; efficiency: number }[]
  controlMachine: (machineId: string, action: "start" | "stop" | "maintenance") => void
}

const HmiContext = createContext<HmiContextType | undefined>(undefined)

const INITIAL_SENSORS: SensorReading[] = [
  {
    id: "temp",
    title: "Reactor Temperature",
    value: "72.5",
    unit: "°C",
    status: "healthy",
    trend: "up",
    trendValue: "+1.2%",
    sparkline: [68, 70, 71, 70, 72, 73, 72, 72.5],
    min: 0,
    max: 120,
    highAlarm: 90,
    highWarning: 80,
    lowWarning: 15,
    lowAlarm: 5,
  },
  {
    id: "pressure",
    title: "Steam Pressure",
    value: "45.8",
    unit: "PSI",
    status: "healthy",
    trend: "stable",
    trendValue: "+0.1%",
    sparkline: [45.2, 45.5, 45.6, 45.4, 45.8, 45.7, 45.8, 45.8],
    min: 0,
    max: 100,
    highAlarm: 75,
    highWarning: 60,
    lowWarning: 20,
    lowAlarm: 10,
  },
  {
    id: "voltage",
    title: "Grid Voltage",
    value: "398",
    unit: "V",
    status: "healthy",
    trend: "down",
    trendValue: "-0.5%",
    sparkline: [402, 401, 399, 398, 400, 397, 398, 398],
    min: 300,
    max: 500,
    highAlarm: 440,
    highWarning: 420,
    lowWarning: 395,
    lowAlarm: 380,
  },
  {
    id: "flowrate",
    title: "Coolant Flow Rate",
    value: "1250",
    unit: "GPM",
    status: "healthy",
    trend: "stable",
    trendValue: "0.0%",
    sparkline: [1245, 1248, 1250, 1249, 1251, 1250, 1249, 1250],
    min: 500,
    max: 2000,
    highAlarm: 1800,
    highWarning: 1600,
    lowWarning: 1050,
    lowAlarm: 950,
  },
  {
    id: "humidity",
    title: "Containment Humidity",
    value: "58",
    unit: "%",
    status: "healthy",
    trend: "up",
    trendValue: "+0.5%",
    sparkline: [55, 56, 56, 57, 58, 58, 57, 58],
    min: 0,
    max: 100,
    highAlarm: 80,
    highWarning: 70,
    lowWarning: 25,
    lowAlarm: 15,
  },
  {
    id: "vibration",
    title: "Turbine Vibration",
    value: "0.45",
    unit: "mm/s",
    status: "healthy",
    trend: "stable",
    trendValue: "+0.0%",
    sparkline: [0.42, 0.44, 0.45, 0.43, 0.46, 0.44, 0.45, 0.45],
    min: 0,
    max: 3,
    highAlarm: 1.5,
    highWarning: 1.0,
    lowWarning: -1, // disable low thresholds
    lowAlarm: -1,
  },
]

const INITIAL_NODES = [
  { id: "node-1", name: "Main PLC (ABB AC800M)", status: "online" as const, uptime: "99.9%", load: 42, iconName: "cpu" },
  { id: "node-2", name: "SCADA Core Server", status: "online" as const, uptime: "99.8%", load: 58, iconName: "server" },
  { id: "node-3", name: "Operator Station HMI-1", status: "online" as const, uptime: "99.9%", load: 24, iconName: "hard-drive" },
  { id: "node-4", name: "Engineer Station HMI-2", status: "online" as const, uptime: "99.5%", load: 31, iconName: "hard-drive" },
  { id: "node-5", name: "Industrial IoT Gateway", status: "online" as const, uptime: "99.9%", load: 18, iconName: "wifi" },
  { id: "node-6", name: "Hot-Standby SCADA Backup", status: "online" as const, uptime: "100%", load: 12, iconName: "server" },
]

const INITIAL_MACHINES = [
  { id: "mach-1", name: "Assembly Robot A1", status: "running" as const, speed: 92, temperature: 42, efficiency: 97 },
  { id: "mach-2", name: "CNC Machining Center M3", status: "running" as const, speed: 78, temperature: 56, efficiency: 89 },
  { id: "mach-3", name: "High-Speed Conveyor C2", status: "idle" as const, speed: 0, temperature: 25, efficiency: 0 },
  { id: "mach-4", name: "Hydraulic Press P5", status: "running" as const, speed: 85, temperature: 48, efficiency: 91 },
  { id: "mach-5", name: "Welding Robot W1", status: "maintenance" as const, speed: 0, temperature: 28, efficiency: 0 },
  { id: "mach-6", name: "Packaging System L2", status: "running" as const, speed: 90, temperature: 36, efficiency: 94 },
]

export const HmiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("operator")
  const [user, setUser] = useState({ name: "Operator Devi", role: "operator" as UserRole })

  const [sensors, setSensors] = useState<SensorReading[]>(INITIAL_SENSORS)
  const [isSimulationActive, setSimulationActive] = useState(true)
  const [simulationSpeed, setSimulationSpeed] = useState(1.5) // in seconds
  
  // Historical telemetry log
  const [sensorHistory, setSensorHistory] = useState<Record<string, { time: string; value: number }[]>>(() => {
    const hist: Record<string, { time: string; value: number }[]> = {}
    const now = new Date()
    INITIAL_SENSORS.forEach((s) => {
      hist[s.id] = Array.from({ length: 20 }, (_, idx) => {
        const timeVal = new Date(now.getTime() - (20 - idx) * 5000)
        return {
          time: timeVal.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
          value: parseFloat(s.value) + (Math.random() - 0.5) * (s.id === "flowrate" ? 20 : 1),
        }
      })
    })
    return hist
  })

  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [alarmHistory, setAlarmHistory] = useState<Alarm[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [incidentHistory, setIncidentHistory] = useState<Incident[]>([])
  
  const [timeline, setTimeline] = useState<ActivityEvent[]>([
    { id: "t-0", type: "start", message: "SCADA Industrial Core v2.0 boot successful", timestamp: "Just now", user: "SYSTEM" },
    { id: "t-1", type: "change", message: "Operator Devi logged in via HMI-1 terminal", timestamp: "1 min ago", user: "SYSTEM" },
  ])

  const [notifications, setNotifications] = useState<HmiContextType["notifications"]>([])
  const [activeIncidentPopup, setActiveIncidentPopup] = useState<Alarm | null>(null)
  
  const [systemNodes, setSystemNodes] = useState<HmiContextType["systemNodes"]>(INITIAL_NODES)
  const [machines, setMachines] = useState<HmiContextType["machines"]>(INITIAL_MACHINES)
  const [systemHealth, setSystemHealth] = useState(100)

  // Switch role session
  const switchRole = useCallback((newRole: UserRole) => {
    const names = { operator: "Operator Devi", engineer: "Engineer Devi", admin: "Admin Devi" }
    const name = names[newRole]
    setRole(newRole)
    setUser({ name, role: newRole })
    
    setTimeline((prev) => [
      {
        id: crypto.randomUUID(),
        type: "change",
        message: `Switched session to ${name} (${newRole.toUpperCase()})`,
        timestamp: new Date().toLocaleTimeString(),
        user: name,
      },
      ...prev,
    ])

    toast.info(`Session changed to ${name} (${newRole.toUpperCase()})`, {
      description: `Permissions loaded for ${newRole}`,
    })
  }, [])

  // Logger helper
  const addTimelineEvent = useCallback((type: ActivityEvent["type"], message: string, activeUser = user.name) => {
    setTimeline((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        user: activeUser,
      },
      ...prev,
    ])
  }, [user.name])

  // Change sensor setpoints (Engineers/Admins only)
  const updateSensorSetpoint = useCallback((
    sensorId: string,
    limits: Partial<Pick<SensorReading, "highAlarm" | "highWarning" | "lowWarning" | "lowAlarm">>
  ) => {
    if (!rolePermissions[role].canModifySetpoints) {
      toast.error("Access Denied", { description: "Operator role cannot modify PLC setpoint registers." })
      return
    }

    setSensors((prev) =>
      prev.map((s) => {
        if (s.id === sensorId) {
          const updated = { ...s, ...limits }
          addTimelineEvent(
            "change",
            `Modified ${s.title} PLC register setpoints: ` +
              Object.entries(limits)
                .map(([k, v]) => `${k}=${v}${s.unit}`)
                .join(", ")
          )
          toast.success("PLC Register Updated", {
            description: `${s.title} registers updated on Main PLC.`,
          })
          return updated
        }
        return s
      })
    )
  }, [role, addTimelineEvent])

  // System nodes switch
  const toggleNodeStatus = useCallback((nodeId: string, status: "online" | "warning" | "offline") => {
    if (role !== "admin") {
      toast.error("Unauthorized", { description: "Administrative privileges required to toggle physical nodes." })
      return
    }

    setSystemNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          addTimelineEvent("change", `Manually changed ${node.name} status to ${status.toUpperCase()}`)
          toast.info(`Node state changed`, { description: `${node.name} is now ${status}.` })
          return { ...node, status }
        }
        return node
      })
    )
  }, [role, addTimelineEvent])

  // Machine direct overrides
  const controlMachine = useCallback((machineId: string, action: "start" | "stop" | "maintenance") => {
    if (!rolePermissions[role].canControlMachines) {
      toast.error("Permission Denied", { description: "Session lacks Machine Control registers capability." })
      return
    }

    setMachines((prev) =>
      prev.map((m) => {
        if (m.id === machineId) {
          let newStatus = m.status
          if (action === "start") newStatus = "running"
          else if (action === "stop") newStatus = "idle"
          else if (action === "maintenance") newStatus = "maintenance"

          addTimelineEvent("maintenance", `Machine override: ${m.name} set to ${action.toUpperCase()}`)
          toast.success(`Machine Override Engaged`, { description: `${m.name} state set to ${newStatus}.` })
          return {
            ...m,
            status: newStatus,
            speed: action === "start" ? 85 : 0,
            efficiency: action === "start" ? 90 : 0,
          }
        }
        return m
      })
    )
  }, [role, addTimelineEvent])

  // Smart Alarm operations
  const acknowledgeAlarm = useCallback((alarmId: string) => {
    if (!rolePermissions[role].canAcknowledgeAlarms) {
      toast.error("Permission Denied")
      return
    }

    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === alarmId && !a.acknowledged) {
          addTimelineEvent("change", `Acknowledged alarm: ${a.title} (${a.tag})`)
          toast.success("Alarm Acknowledged", { description: `Acknowledged by ${user.name}` })
          return {
            ...a,
            acknowledged: true,
            acknowledgedBy: user.name,
            acknowledgedAt: new Date(),
          }
        }
        return a
      })
    )
  }, [role, user.name, addTimelineEvent])

  const resolveAlarm = useCallback((alarmId: string) => {
    if (!rolePermissions[role].canResolveAlarms) {
      toast.error("Permission Denied", { description: "Operators cannot resolve system critical alarms." })
      return
    }

    setAlarms((prev) => {
      const alarmToResolve = prev.find((a) => a.id === alarmId)
      if (!alarmToResolve) return prev

      const resolvedAlarm = {
        ...alarmToResolve,
        acknowledged: true,
        acknowledgedBy: alarmToResolve.acknowledgedBy || user.name,
        acknowledgedAt: alarmToResolve.acknowledgedAt || new Date(),
        resolved: true,
        resolvedBy: user.name,
        resolvedAt: new Date(),
        time: "Resolved",
      }

      setAlarmHistory((h) => [resolvedAlarm, ...h])
      addTimelineEvent("change", `Resolved alarm: ${alarmToResolve.title} (${alarmToResolve.tag})`)
      toast.success("Alarm Resolved", { description: `Alarm moved to logs history.` })

      return prev.filter((a) => a.id !== alarmId)
    })
  }, [role, user.name, addTimelineEvent])

  const acknowledgeAllAlarms = useCallback(() => {
    if (!rolePermissions[role].canAcknowledgeAlarms) return
    setAlarms((prev) =>
      prev.map((a) => {
        if (!a.acknowledged) {
          return {
            ...a,
            acknowledged: true,
            acknowledgedBy: user.name,
            acknowledgedAt: new Date(),
          }
        }
        return a
      })
    )
    addTimelineEvent("change", "Bulk Operator Acknowledgment of active alarm registers")
    toast.success("All Active Alarms Acknowledged")
  }, [role, user.name, addTimelineEvent])

  const resolveAllAlarms = useCallback(() => {
    if (!rolePermissions[role].canResolveAlarms) return
    setAlarms((prev) => {
      const resolved = prev.map((a) => ({
        ...a,
        acknowledged: true,
        acknowledgedBy: a.acknowledgedBy || user.name,
        acknowledgedAt: a.acknowledgedAt || new Date(),
        resolved: true,
        resolvedBy: user.name,
        resolvedAt: new Date(),
      }))

      setAlarmHistory((h) => [...resolved, ...h])
      addTimelineEvent("change", "Bulk Engineer Resolution of active alarm registers")
      toast.success("All Alarms Resolved", { description: "Active alarm registries cleared." })
      return []
    })
  }, [role, user.name, addTimelineEvent])

  // Incidents lifecycle
  const acknowledgeIncident = useCallback((incId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incId && !inc.acknowledged) {
          addTimelineEvent("alert", `Acknowledged system incident ${incId}`)
          toast.success("Incident Acknowledged", { description: `Mitigation team dispatched.` })
          return {
            ...inc,
            acknowledged: true,
            acknowledgedBy: user.name,
          }
        }
        return inc
      })
    )
  }, [user.name, addTimelineEvent])

  const resolveIncident = useCallback((incId: string) => {
    if (!rolePermissions[role].canResolveAlarms) {
      toast.error("Access Denied", { description: "Incident closure requires Engineer or Admin clearances." })
      return
    }

    setIncidents((prev) => {
      const inc = prev.find((i) => i.id === incId)
      if (!inc) return prev

      // Enforce: all corresponding alarms must be resolved before incident can be fully closed
      const matchingAlarms = alarms.filter((a) => a.location === inc.affectedSystem)
      if (matchingAlarms.length > 0) {
        toast.error("Resolution Failed", { description: `Alarms still active on ${inc.affectedSystem}. Clear them first.` })
        return prev
      }

      const closed = {
        ...inc,
        status: "resolved" as const,
        endTime: new Date(),
      }

      setIncidentHistory((h) => [closed, ...h])
      addTimelineEvent("maintenance", `Closed incident ${incId} - normal conditions verified.`)
      toast.success("Incident Fully Resolved", { description: `Incident ${incId} moved to history logs.` })
      return prev.filter((i) => i.id !== incId)
    })
  }, [role, alarms, addTimelineEvent])

  // Dynamic recommendations
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([])

  // AI Diagnostics Builder
  useEffect(() => {
    const activeCriticals = alarms.filter((a) => a.type === "critical")
    const activeHighs = alarms.filter((a) => a.type === "high")

    const recs: AIRecommendation[] = []

    if (alarms.some((a) => a.tag === "VI-107" || a.location.includes("Turbine"))) {
      recs.push({
        id: "ai-rec-vibr",
        type: "maintenance",
        title: "Predictive Bearing Maintenance",
        description: "Bearing wear footprint detected on Turbine shaft assembly. Schedule lubrication override or shut down conveyor lines immediately to prevent critical seize.",
        impact: "high",
        confidence: 94,
        affectedSystem: "Turbine Vibration",
        mitigationAction: "Schedule Turbine Maintenance",
      })
    }

    if (alarms.some((a) => a.tag === "TI-301" || a.tag === "PI-204")) {
      recs.push({
        id: "ai-rec-temp",
        type: "alert",
        title: "Reactor Thermal Pressure Stabilization",
        description: "Reactor temperature thermal expansion identified. SCADA AI suggests engaging auxiliary coolant pumps to drop temp setpoints back to steady baseline.",
        impact: "high",
        confidence: 91,
        affectedSystem: "Reactor Temperature",
        mitigationAction: "Engage Auxiliary Coolant Pump",
      })
    }

    if (sensors.some((s) => s.id === "voltage" && parseFloat(s.value) < 390)) {
      recs.push({
        id: "ai-rec-volt",
        type: "optimization",
        title: "Load Balancing Dispatcher",
        description: "Voltage sag registered under load limits. Diverting auxiliary backup load is advised to avoid PLC board resets.",
        impact: "medium",
        confidence: 86,
        affectedSystem: "Grid Voltage",
        mitigationAction: "Engage Load Balancer",
      })
    }

    // Baseline recommendations if healthy
    if (recs.length === 0) {
      recs.push(
        {
          id: "ai-rec-ok-1",
          type: "efficiency",
          title: "Optimized Cooling Cycle",
          description: "All sensors operate within ideal bounds. Thermodynamics optimization module recommends fine-tuning pump flow timing for 4.2% daily energy savings.",
          impact: "low",
          confidence: 98,
          affectedSystem: "Coolant Flow Rate",
          savings: "$2,400/month",
        },
        {
          id: "ai-rec-ok-2",
          type: "optimization",
          title: "Predictive Health Model",
          description: "PLC neural-network logs confirm zero drift over 48 hours. Expected continuous uptime is estimated at 99.98% for current production queue.",
          impact: "low",
          confidence: 99,
          affectedSystem: "Main PLC",
        }
      )
    }

    setAiRecommendations(recs)
  }, [alarms, sensors])

  // Mitigation trigger execution
  const executeMitigation = useCallback((recId: string) => {
    addTimelineEvent("change", `AI Mitigation Dispatcher engaged: ${recId}`)
    
    if (recId === "ai-rec-temp") {
      // Bring temperature down
      setSensors((prev) =>
        prev.map((s) => (s.id === "temp" ? { ...s, value: "71.2", status: "healthy" as const } : s))
      )
      // Resolve corresponding alarms
      setAlarms((prev) => prev.filter((a) => a.tag !== "TI-301"))
      toast.success("Aux Coolant Engaged", { description: "Reactor temperature normalized to 71.2°C" })
    } else if (recId === "ai-rec-vibr") {
      setSensors((prev) =>
        prev.map((s) => (s.id === "vibration" ? { ...s, value: "0.42", status: "healthy" as const } : s))
      )
      setAlarms((prev) => prev.filter((a) => a.tag !== "VI-107"))
      toast.success("Turbine Lubrication Injected", { description: "Turbine shafts vibration restored to 0.42 mm/s" })
    } else if (recId === "ai-rec-volt") {
      setSensors((prev) =>
        prev.map((s) => (s.id === "voltage" ? { ...s, value: "402", status: "healthy" as const } : s))
      )
      setAlarms((prev) => prev.filter((a) => a.tag !== "VI-402"))
      toast.success("Electrical Load Balanced", { description: "Grid Voltage boosted back to 402V" })
    } else {
      toast.info("Mitigation sequence executed successfully.")
    }
  }, [addTimelineEvent])

  // Notifications drawer controls
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Calculate dynamic System Health Score
  useEffect(() => {
    let score = 100
    const activeCriticals = alarms.filter((a) => a.type === "critical").length
    const activeHighs = alarms.filter((a) => a.type === "high").length
    const activeMediums = alarms.filter((a) => a.type === "medium").length
    const activeLows = alarms.filter((a) => a.type === "low").length

    score -= activeCriticals * 15
    score -= activeHighs * 8
    score -= activeMediums * 4
    score -= activeLows * 1

    // Node faults impact
    const offlineNodes = systemNodes.filter((n) => n.status === "offline").length
    const warningNodes = systemNodes.filter((n) => n.status === "warning").length
    score -= offlineNodes * 20
    score -= warningNodes * 5

    const finalScore = Math.max(0, Math.min(100, score))
    setSystemHealth(finalScore)

    // Main PLC load follows active system stress
    setSystemNodes((prev) =>
      prev.map((node) => {
        if (node.id === "node-1") {
          let plcLoad = 42
          if (activeCriticals > 0) plcLoad = 86
          else if (activeHighs > 0) plcLoad = 68
          else if (activeMediums > 0) plcLoad = 55
          return {
            ...node,
            load: plcLoad,
            status: activeCriticals > 0 ? ("warning" as const) : ("online" as const),
          }
        }
        return node
      })
    )
  }, [alarms, systemNodes])

  // LIVE SENSOR SIMULATOR WATCHDOG & ENGINE LOOP
  useEffect(() => {
    if (!isSimulationActive) return

    const tick = () => {
      const dateString = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })

      setSensors((prevSensors) => {
        return prevSensors.map((s) => {
          let drift = 0.5
          let decimals = 1

          if (s.id === "temp") { drift = 1.2; decimals = 1 }
          else if (s.id === "pressure") { drift = 0.8; decimals = 1 }
          else if (s.id === "voltage") { drift = 2.0; decimals = 0 }
          else if (s.id === "flowrate") { drift = 15; decimals = 0 }
          else if (s.id === "humidity") { drift = 0.6; decimals = 0 }
          else if (s.id === "vibration") { drift = 0.05; decimals = 2 }

          // Anomaly injection simulator (occasional temperature/vibration spikes)
          const anomalyRoll = Math.random()
          let anomalyMultiplier = 1
          if (anomalyRoll > 0.96) {
            anomalyMultiplier = s.id === "temp" || s.id === "vibration" ? 2.5 : 1.2
          }

          const currentVal = parseFloat(s.value)
          const delta = (Math.random() - 0.48) * drift * anomalyMultiplier
          let newVal = Math.max(s.min, Math.min(s.max, currentVal + delta))

          // Link machines states to fluctuate sensor limits
          if (s.id === "temp" && machines.some((m) => m.status === "error")) {
            newVal = Math.min(s.max, newVal + 1.5) // cause thermal climb if a machine is locked in error state
          }

          const pctChange = currentVal !== 0 ? ((newVal - currentVal) / currentVal) * 100 : 0
          const trend: TrendDirection = Math.abs(pctChange) < 0.05 ? "stable" : pctChange > 0 ? "up" : "down"
          const valStr = newVal.toFixed(decimals)

          // Watchdog: Evaluate sensor thresholds to automatically trigger alarms
          const numericVal = newVal
          let currentStatus: SensorStatus = "healthy"
          let alarmLimitTriggered: string | null = null
          let alarmSeverity: AlarmSeverity = "low"
          let priorityVal: 1 | 2 | 3 | 4 = 4

          if (numericVal >= s.highAlarm) {
            currentStatus = "critical"
            alarmLimitTriggered = "highAlarm"
            alarmSeverity = "critical"
            priorityVal = 1
          } else if (numericVal >= s.highWarning) {
            currentStatus = "warning"
            alarmLimitTriggered = "highWarning"
            alarmSeverity = "high"
            priorityVal = 2
          } else if (s.lowAlarm !== -1 && numericVal <= s.lowAlarm) {
            currentStatus = "critical"
            alarmLimitTriggered = "lowAlarm"
            alarmSeverity = "critical"
            priorityVal = 1
          } else if (s.lowWarning !== -1 && numericVal <= s.lowWarning) {
            currentStatus = "warning"
            alarmLimitTriggered = "lowWarning"
            alarmSeverity = "medium"
            priorityVal = 3
          }

          // Triggering Alarms logic
          if (alarmLimitTriggered) {
            const limitName = alarmLimitTriggered.replace(/([A-Z])/g, " $1").toLowerCase()
            const title = `${s.title} limit exceeded`
            const location = s.id === "temp" ? "Reactor Unit 3" : s.id === "pressure" ? "Valve Assembly B2" : s.id === "vibration" ? "Conveyor Belt A3" : "Core Station"
            const tagMap: Record<string, string> = { temp: "TI-301", pressure: "PI-204", voltage: "VI-402", flowrate: "FI-102", humidity: "LI-501", vibration: "VI-107" }
            const tag = tagMap[s.id] || "PLC-00"

            // Duplicate suppression: check if an identical unacknowledged active alarm is already present
            setAlarms((active) => {
              const duplicate = active.find((a) => a.tag === tag && a.type === alarmSeverity && !a.resolved)
              if (duplicate) return active

              const newAlarm: Alarm = {
                id: crypto.randomUUID(),
                type: alarmSeverity,
                priority: priorityVal,
                title,
                location,
                tag,
                value: Number(numericVal.toFixed(2)),
                setpoint: s[alarmLimitTriggered as keyof SensorReading] as number,
                unit: s.unit,
                time: "Just now",
                timestamp: new Date(),
                acknowledged: false,
                resolved: false,
              }

              // Sound/Toast alarm notification dispatch
              toast.error(`CRITICAL ALARM DETECTED`, {
                description: `${title} on ${location}: ${numericVal.toFixed(1)}${s.unit}`,
              })

              // Dispatch to notification logs
              setNotifications((prevN) => [
                {
                  id: crypto.randomUUID(),
                  type: alarmSeverity,
                  title,
                  message: `${location} value: ${numericVal.toFixed(1)}${s.unit} (Limit: ${s[alarmLimitTriggered as keyof SensorReading]}${s.unit})`,
                  time: new Date().toLocaleTimeString(),
                  read: false,
                },
                ...prevN.slice(0, 49),
              ])

              // Automatically create system wide Incident for Critical/High limits
              if (alarmSeverity === "critical" || alarmSeverity === "high") {
                setIncidents((prevI) => {
                  const existingIncident = prevI.find((i) => i.affectedSystem === location && i.status !== "resolved")
                  if (existingIncident) {
                    return prevI.map((i) => (i.id === existingIncident.id ? { ...i, alarmsCount: i.alarmsCount + 1 } : i))
                  }

                  const newInc: Incident = {
                    id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
                    title: `Emergency: ${title}`,
                    severity: alarmSeverity === "critical" ? "critical" : "high",
                    status: "active",
                    startTime: new Date(),
                    affectedSystem: location,
                    alarmsCount: 1,
                    acknowledged: false,
                  }

                  setTimeline((prevT) => [
                    {
                      id: crypto.randomUUID(),
                      type: "alert",
                      message: `Emergency Incident ${newInc.id} opened: ${newInc.title} at ${location}`,
                      timestamp: new Date().toLocaleTimeString(),
                      user: "SYSTEM",
                    },
                    ...prevT,
                  ])

                  // Display critical screen popup modal
                  if (alarmSeverity === "critical") {
                    setActiveIncidentPopup(newAlarm)
                  }

                  return [newInc, ...prevI]
                })
              }

              return [newAlarm, ...active].slice(0, 30) // cap active registers
            })
          } else {
            // Alarm clearing check: if sensor went back to normal, auto-clear acknowledged alarms
            setAlarms((active) => {
              const tagMap: Record<string, string> = { temp: "TI-301", pressure: "PI-204", voltage: "VI-402", flowrate: "FI-102", humidity: "LI-501", vibration: "VI-107" }
              const tag = tagMap[s.id]
              
              // Find alarms for this tag
              const tagAlarms = active.filter((a) => a.tag === tag)
              if (tagAlarms.length === 0) return active

              // If an alarm is already acknowledged, resolve it since condition returned to normal
              const toResolve = tagAlarms.filter((a) => a.acknowledged)
              if (toResolve.length > 0) {
                const resolvedIds = toResolve.map((a) => a.id)
                
                // Add to history
                const resolvedData = toResolve.map((a) => ({
                  ...a,
                  resolved: true,
                  resolvedBy: "System watchdog",
                  resolvedAt: new Date(),
                  time: "Cleared",
                }))
                
                setAlarmHistory((h) => [...resolvedData, ...h])
                
                toResolve.forEach((a) => {
                  setTimeline((prevT) => [
                    {
                      id: crypto.randomUUID(),
                      type: "maintenance",
                      message: `Auto-resolved normalized alarm: ${a.title} (${a.tag})`,
                      timestamp: new Date().toLocaleTimeString(),
                      user: "SYSTEM",
                    },
                    ...prevT,
                  ])
                })

                return active.filter((a) => !resolvedIds.includes(a.id))
              }
              
              return active
            })
          }

          // Record telemetry history
          setSensorHistory((hist) => {
            const arr = hist[s.id] || []
            const updated = [...arr.slice(1), { time: dateString, value: Number(numericVal.toFixed(decimals)) }]
            return { ...hist, [s.id]: updated }
          })

          return {
            ...s,
            value: valStr,
            status: currentStatus,
            trend,
            trendValue: `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%`,
            sparkline: [...s.sparkline.slice(1), Number(newVal.toFixed(decimals))],
          }
        })
      })

      // Sync machines speed fluctuations with sensor status
      setMachines((prevM) =>
        prevM.map((m, idx) => {
          if (m.status !== "running") return m
          
          const speedDrift = (Math.random() - 0.5) * 4
          const newSpeed = Math.max(70, Math.min(100, m.speed + speedDrift))
          
          let tempDrift = (Math.random() - 0.45) * 0.8
          if (idx === 0) { // Assembly Robot temperature follows reactor temp
            tempDrift += 0.2
          }
          const newTemp = Math.round(Math.max(20, Math.min(95, m.temperature + tempDrift)))
          
          const newEfficiency = Math.max(80, Math.min(99, Math.round(98 - (newTemp > 75 ? (newTemp - 75) * 0.5 : 0))))
          
          // Machine critical overheating error simulation
          if (newTemp > 88) {
            setTimeline((prevT) => [
              {
                id: crypto.randomUUID(),
                type: "alert",
                message: `Overheating failure: ${m.name} entered error mode (Temp: ${newTemp}°C)`,
                timestamp: new Date().toLocaleTimeString(),
                user: "SYSTEM",
              },
              ...prevT,
            ])
            toast.error(`MACHINE HARDWARE FAULT`, { description: `${m.name} emergency stop triggered.` })
            return {
              ...m,
              status: "error" as const,
              speed: 0,
              temperature: newTemp,
              efficiency: 0,
            }
          }

          return {
            ...m,
            speed: Number(newSpeed.toFixed(1)),
            temperature: newTemp,
            efficiency: newEfficiency,
          }
        })
      )
    }

    const interval = setInterval(tick, simulationSpeed * 1000)
    return () => clearInterval(interval)
  }, [isSimulationActive, simulationSpeed, machines])

  // Pre-load notification center counter
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  return (
    <HmiContext.Provider
      value={{
        role,
        user,
        switchRole,
        sensors,
        sensorHistory,
        updateSensorSetpoint,
        alarms,
        alarmHistory,
        acknowledgeAlarm,
        resolveAlarm,
        acknowledgeAllAlarms,
        resolveAllAlarms,
        incidents,
        incidentHistory,
        acknowledgeIncident,
        resolveIncident,
        timeline,
        addTimelineEvent,
        aiRecommendations,
        executeMitigation,
        notifications,
        unreadNotificationsCount,
        markAllNotificationsRead,
        clearNotifications,
        activeIncidentPopup,
        setActiveIncidentPopup,
        systemHealth,
        systemNodes,
        toggleNodeStatus,
        isSimulationActive,
        setSimulationActive,
        simulationSpeed,
        setSimulationSpeed,
        machines,
        controlMachine,
      }}
    >
      {children}
    </HmiContext.Provider>
  )
}

export const useHmi = () => {
  const context = useContext(HmiContext)
  if (context === undefined) {
    throw new Error("useHmi must be used within an HmiProvider")
  }
  return context
}
