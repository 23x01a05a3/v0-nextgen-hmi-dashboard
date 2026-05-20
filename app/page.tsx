"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { SensorCard } from "@/components/dashboard/sensor-card"
import { AlarmPanel } from "@/components/dashboard/alarm-panel"
import { AIRecommendations } from "@/components/dashboard/ai-recommendations"
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts"
import { SystemHealth } from "@/components/dashboard/system-health"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { MachineHealthStatus } from "@/components/dashboard/machine-health"
import { useHmi } from "@/lib/hmi-context"
import {
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  Wind,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Server,
  Lock,
  CheckCircle,
  HelpCircle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SENSOR_ICONS: Record<string, typeof Activity> = {
  temp:      Thermometer,
  pressure:  Gauge,
  voltage:   Zap,
  flowrate:  Droplets,
  humidity:  Droplets,
  vibration: Activity,
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const {
    sensors,
    alarms,
    systemHealth,
    isSimulationActive,
    setSimulationActive,
    simulationSpeed,
    setSimulationSpeed,
    role,
    activeIncidentPopup,
    setActiveIncidentPopup,
  } = useHmi()

  const criticalAlarms = alarms.filter((a) => a.type === "critical")
  const hasCriticalAlarm = criticalAlarms.length > 0

  // Manual pressure vent cooling release override
  const handleManualVent = () => {
    // Release steam pressure trigger via setpoints/telemetry
    const tempSensor = sensors.find((s) => s.id === "temp")
    if (tempSensor) {
      tempSensor.value = "71.5"
      tempSensor.status = "healthy"
    }
    const pressSensor = sensors.find((s) => s.id === "pressure")
    if (pressSensor) {
      pressSensor.value = "45.2"
      pressSensor.status = "healthy"
    }
    // Clear alerts matching Reactor/Valve
    alarms.splice(0, alarms.length, ...alarms.filter((a) => a.tag !== "TI-301" && a.tag !== "PI-204"))
  }

  // ----------------------------------------------------
  // VIEW RENDERERS
  // ----------------------------------------------------

  const renderDashboardGrid = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Sensor Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {sensors.map((sensor) => {
          const Icon = SENSOR_ICONS[sensor.id] ?? Activity
          return (
            <SensorCard
              key={sensor.id}
              id={sensor.id}
              title={sensor.title}
              value={sensor.value}
              unit={sensor.unit}
              icon={Icon}
              trend={sensor.trend}
              trendValue={sensor.trendValue}
              status={sensor.status}
              sparkline={sensor.sparkline}
              min={sensor.min}
              max={sensor.max}
            />
          )
        })}
      </motion.div>

      {/* Main Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnalyticsCharts />
          <MachineHealthStatus />
        </div>
        <div className="space-y-6">
          <AlarmPanel />
        </div>
      </motion.div>

      {/* Secondary Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIRecommendations />
        <ActivityFeed />
      </motion.div>

      {/* Infrastructure */}
      <motion.div variants={itemVariants}>
        <SystemHealth />
      </motion.div>
    </motion.div>
  )

  const renderProcessMimic = () => {
    const tempSensor = sensors.find((s) => s.id === "temp")
    const pressSensor = sensors.find((s) => s.id === "pressure")
    const flowSensor = sensors.find((s) => s.id === "flowrate")

    const isTempCritical = tempSensor?.status === "critical"
    const isTempWarning = tempSensor?.status === "warning"
    const isPressCritical = pressSensor?.status === "critical"
    const isPressWarning = pressSensor?.status === "warning"

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-mono">
        <div className="glass-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-wider uppercase">P&ID Reactor Process Mimic</h2>
              <p className="text-xs text-muted-foreground">Interactive physical telemetry mapping & loop diagram</p>
            </div>
            <button
              onClick={handleManualVent}
              disabled={role === "operator"}
              className={cn(
                "px-3 py-2 text-xs font-bold rounded uppercase tracking-wider transition-all flex items-center gap-1.5",
                role === "operator"
                  ? "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                  : "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white glow-red"
              )}
              title={role === "operator" ? "Requires Engineer/Admin clearances" : "Release pressure vents manually"}
            >
              ☢ Emergency Vent Override
            </button>
          </div>

          {/* SVG Animated Mimic Diagram */}
          <div className="relative w-full h-[400px] bg-black/60 rounded-xl border border-border/10 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 800 400" className="w-full h-full max-h-[380px]">
              {/* Pipe lines / Liquid flows */}
              {/* Flow line 1: Feed flow to Reactor */}
              <path d="M 50 150 L 300 150" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
              <path
                d="M 50 150 L 300 150"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10 15"
                className="animate-flow"
                style={{ strokeDashoffset: isSimulationActive ? 50 : 0 }}
              />

              {/* Flow line 2: Steam line to Vent */}
              <path d="M 400 150 L 580 150 L 580 250" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
              <path
                d="M 400 150 L 580 150 L 580 250"
                stroke={isPressCritical ? "#ef4444" : isPressWarning ? "#f97316" : "#eab308"}
                strokeWidth="4"
                fill="none"
                strokeDasharray="8 12"
                style={{ strokeDashoffset: isSimulationActive ? -30 : 0 }}
                className="animate-flow"
              />

              {/* Pump A Assembly */}
              <circle cx="120" cy="150" r="25" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 120 125 L 120 175 M 95 150 L 145 150" stroke="#3b82f6" strokeWidth="1.5" className={cn(isSimulationActive ? "animate-spin-slow origin-center" : "")} style={{ transformOrigin: "120px 150px" }} />
              <text x="120" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">FEED PUMP A</text>

              {/* Reactor Unit 3 Vessel */}
              <rect
                x="300"
                y="80"
                width="120"
                height="220"
                rx="20"
                fill={isTempCritical ? "rgba(239, 68, 68, 0.15)" : isTempWarning ? "rgba(249, 115, 22, 0.1)" : "rgba(30, 41, 59, 0.8)"}
                stroke={isTempCritical ? "#ef4444" : isTempWarning ? "#f97316" : "#3b82f6"}
                strokeWidth="3"
                className={cn(isTempCritical ? "badge-blink" : "")}
              />
              {/* Liquid level representation */}
              <rect x="304" y="200" width="112" height="96" rx="8" fill="rgba(59, 130, 246, 0.25)" />
              <text x="360" y="60" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="bold">REACTOR UNIT 3</text>

              {/* Valve Assembly B2 */}
              <path d="M 555 150 L 605 150 M 580 135 L 580 165" stroke={isPressCritical ? "#ef4444" : "#eab308"} strokeWidth="2" />
              <polygon points="565,140 565,160 580,150" fill={isPressCritical ? "#ef4444" : "#eab308"} />
              <polygon points="595,140 595,160 580,150" fill={isPressCritical ? "#ef4444" : "#eab308"} />
              <circle cx="580" cy="150" r="6" fill="#0f172a" stroke={isPressCritical ? "#ef4444" : "#eab308"} strokeWidth="1.5" />
              <text x="640" y="155" fill="#f8fafc" fontSize="10" fontWeight="bold">VALVE B2</text>

              {/* Heat Exchanger Coil */}
              <rect x="680" y="230" width="80" height="90" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <path d="M 690 250 Q 710 240 730 250 T 750 250 Q 710 280 730 290" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
              <text x="720" y="340" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold">COOLER</text>
            </svg>

            {/* Live Telemetry Floating Badges overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/95 border border-primary/20 rounded p-2.5 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">REACTOR TEMP:</span>
                <span className={cn("font-bold font-mono", isTempCritical ? "text-red-500 animate-pulse" : isTempWarning ? "text-yellow-500" : "text-green-500")}>
                  {tempSensor?.value ?? "72.5"}°C
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">STEAM PRESSURE:</span>
                <span className={cn("font-bold font-mono", isPressCritical ? "text-red-500 animate-pulse" : isPressWarning ? "text-yellow-500" : "text-green-500")}>
                  {pressSensor?.value ?? "45.8"} PSI
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">FEED FLOW RATE:</span>
                <span className="font-bold text-cyan-400 font-mono">
                  {flowSensor?.value ?? "1250"} GPM
                </span>
              </div>
            </div>

            {/* Loop status diagnostics */}
            <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-primary/20 rounded p-2 text-[10px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>PLC COMM: ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>SCAN RATE: {simulationSpeed}s</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderSensorsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold font-mono text-foreground tracking-wider uppercase">PLC Dynamic Registers</h2>
        <p className="text-xs text-muted-foreground font-mono">
          Interactive register adjustments. Click cards to access direct setpoint slider overrides on the PLC memory boards.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const Icon = SENSOR_ICONS[sensor.id] ?? Activity
          return (
            <SensorCard
              key={sensor.id}
              id={sensor.id}
              title={sensor.title}
              value={sensor.value}
              unit={sensor.unit}
              icon={Icon}
              trend={sensor.trend}
              trendValue={sensor.trendValue}
              status={sensor.status}
              sparkline={sensor.sparkline}
              min={sensor.min}
              max={sensor.max}
            />
          )
        })}
      </div>
    </motion.div>
  )

  const renderAnalyticsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnalyticsCharts />
    </motion.div>
  )

  const renderAIView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AIRecommendations />
      </div>
      <div>
        <ActivityFeed />
      </div>
    </motion.div>
  )

  const renderAlarmsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AlarmPanel />
      </div>
      <div>
        <ActivityFeed />
      </div>
    </motion.div>
  )

  const renderSecurityView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <SystemHealth />
    </motion.div>
  )

  const renderSettingsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 font-mono">
      <div className="glass-card rounded-xl p-5 border border-border/50 max-w-xl">
        <h2 className="text-lg font-bold text-foreground tracking-wider uppercase mb-4">SCADA Core Simulator Configuration</h2>

        <div className="space-y-6 text-xs">
          {/* Active Loop */}
          <div className="flex items-center justify-between gap-4 p-3 bg-black/35 rounded border border-border/10">
            <div>
              <p className="font-bold text-foreground uppercase">Simulator Loop Execution</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toggle live random walk and drift calculation ticks</p>
            </div>
            <button
              onClick={() => setSimulationActive(!isSimulationActive)}
              className={cn(
                "p-2 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px] transition-all border",
                isSimulationActive
                  ? "bg-green-500/20 text-green-500 border-green-500/30"
                  : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
              )}
            >
              {isSimulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulationActive ? "LOOP ACTIVE" : "LOOP PAUSED"}</span>
            </button>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="uppercase text-muted-foreground">COMM SCAN INTERVAL (Refresh Cycle)</span>
              <span className="text-primary font-mono">{simulationSpeed} SECONDS</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/50">
              <span>0.5s FAST</span>
              <span>5.0s STABLE</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderActiveView = () => {
    switch (activeNavItem) {
      case "dashboard":
        return renderDashboardGrid()
      case "monitoring":
        return renderProcessMimic()
      case "sensors":
        return renderSensorsView()
      case "analytics":
        return renderAnalyticsView()
      case "ai":
        return renderAIView()
      case "alarms":
        return renderAlarmsView()
      case "security":
        return renderSecurityView()
      case "settings":
        return renderSettingsView()
      default:
        return renderDashboardGrid()
    }
  }

  return (
    <div className="min-h-screen bg-background dashboard-bg">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeNavItem}
          onItemClick={setActiveNavItem}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 z-50 lg:hidden"
            >
              <Sidebar
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
                activeItem={activeNavItem}
                onItemClick={(item) => {
                  setActiveNavItem(item)
                  setMobileMenuOpen(false)
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col justify-between",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        )}
      >
        <div>
          {/* Top Navbar */}
          <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

          {/* Context-Aware Critical Emergency Banner */}
          <AnimatePresence>
            {hasCriticalAlarm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-600 border-y border-red-500 text-white px-4 py-2 flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider gap-4 overflow-hidden shadow-lg select-none badge-blink"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 animate-bounce flex-shrink-0" />
                  <span>
                    CRITICAL WATCHDOG ALARM EXCEEDED AT: {criticalAlarms[0]?.location} ({criticalAlarms[0]?.tag}). VALUE: {criticalAlarms[0]?.value}{criticalAlarms[0]?.unit}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const firstCrit = criticalAlarms[0]
                    if (firstCrit) {
                      setActiveIncidentPopup(firstCrit)
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 transition-colors border border-white/20 text-[10px]"
                >
                  DISPATCH CONSOLE
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Page Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-mono uppercase tracking-wide">
                  {activeNavItem} Console
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase tracking-wider">
                  ABB hackathon smart prototype interface
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg border border-border/30">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn("w-2 h-2 rounded-full", hasCriticalAlarm ? "bg-red-500 shadow shadow-red-500/50" : "bg-green-500 shadow shadow-green-500/50")}
                  />
                  <span className="text-xs text-muted-foreground font-mono font-bold uppercase tracking-wider">
                    {hasCriticalAlarm ? "ALARM CROSSING ACTIVE" : "ALL PLC CORES STEADY"}
                  </span>
                </div>
              </div>
            </div>

            {/* Active view component */}
            {renderActiveView()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 pt-0">
          <footer className="glass rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-blue">
                <Activity className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div className="font-mono text-left">
                <p className="text-xs font-bold text-foreground">ABB NEXTGEN HMI v2.0</p>
                <p className="text-[9px] text-muted-foreground">Industrial Control Room SCADA System Prototype</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-[10px] text-muted-foreground/60 font-mono uppercase font-semibold">
              <span>Sync Rate: {simulationSpeed}s</span>
              <span aria-hidden="true">•</span>
              <span>Bus Link: SECURE AES256</span>
              <span aria-hidden="true">•</span>
              <span>RTT: 12ms</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Global Interactive Incident Popup Dialog Modal */}
      <AnimatePresence>
        {activeIncidentPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-2xl p-6 border border-red-500/50 relative overflow-hidden"
            >
              {/* Flashing danger header highlight line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-red-600 badge-blink" />

              <button
                onClick={() => setActiveIncidentPopup(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border/40"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-4 text-red-500 font-mono">
                <AlertTriangle className="w-5 h-5 animate-ping" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  WATCHDOG INCIDENT ENGAGED
                </h3>
              </div>

              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 mb-6 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">ALARM:</span>
                  <span className="font-extrabold text-foreground">{activeIncidentPopup.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">LOCATION:</span>
                  <span className="font-extrabold text-foreground">{activeIncidentPopup.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">PLC TAG:</span>
                  <span className="font-extrabold text-primary">{activeIncidentPopup.tag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">MEASURED:</span>
                  <span className="font-extrabold text-red-500">{activeIncidentPopup.value}{activeIncidentPopup.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase">REGISTER LIMIT:</span>
                  <span className="font-extrabold text-foreground">{activeIncidentPopup.setpoint}{activeIncidentPopup.unit}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    handleManualVent()
                    setActiveIncidentPopup(null)
                  }}
                  disabled={role === "operator"}
                  className={cn(
                    "w-full py-2.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-all",
                    role === "operator"
                      ? "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600 shadow-lg glow-red"
                  )}
                  title={role === "operator" ? "Requires Engineer/Admin clearances" : ""}
                >
                  ✓ Engage Cooling Bypass (Vent Valve B2)
                </button>
                <button
                  onClick={() => setActiveIncidentPopup(null)}
                  className="w-full py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors border border-border/40"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

