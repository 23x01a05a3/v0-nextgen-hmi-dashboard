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
import {
  Thermometer,
  Gauge,
  Zap,
  Droplets,
  Wind,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
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
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        )}
      >
        {/* Top Navbar */}
        <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Control Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time monitoring and control interface
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-sm text-muted-foreground">All Systems Operational</span>
              </div>
            </div>
          </motion.div>

          {/* Sensor Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <SensorCard
              title="Temperature"
              value="72.5"
              unit="°C"
              icon={Thermometer}
              trend="up"
              trendValue="+2.3%"
              status="healthy"
              sparkline={[60, 65, 70, 68, 72, 75, 73, 72]}
            />
            <SensorCard
              title="Pressure"
              value="45.8"
              unit="PSI"
              icon={Gauge}
              trend="stable"
              trendValue="+0.1%"
              status="healthy"
              sparkline={[45, 46, 45, 45, 46, 45, 46, 45]}
            />
            <SensorCard
              title="Voltage"
              value="398"
              unit="V"
              icon={Zap}
              trend="down"
              trendValue="-1.2%"
              status="warning"
              sparkline={[405, 402, 400, 398, 399, 397, 398, 398]}
            />
            <SensorCard
              title="Humidity"
              value="58"
              unit="%"
              icon={Droplets}
              trend="up"
              trendValue="+5.0%"
              status="healthy"
              sparkline={[52, 54, 55, 56, 57, 58, 58, 58]}
            />
            <SensorCard
              title="Airflow"
              value="1250"
              unit="CFM"
              icon={Wind}
              trend="stable"
              trendValue="+0.0%"
              status="healthy"
              sparkline={[1248, 1250, 1249, 1251, 1250, 1250, 1249, 1250]}
            />
            <SensorCard
              title="Vibration"
              value="0.85"
              unit="mm/s"
              icon={Activity}
              trend="up"
              trendValue="+12%"
              status="critical"
              sparkline={[0.65, 0.70, 0.72, 0.78, 0.80, 0.82, 0.84, 0.85]}
            />
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Charts Section - 2 columns */}
            <div className="xl:col-span-2 space-y-6">
              <AnalyticsCharts />
              <MachineHealthStatus />
            </div>

            {/* Right Panel - 1 column */}
            <div className="space-y-6">
              <AlarmPanel />
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIRecommendations />
            <ActivityFeed />
          </div>

          {/* System Health Section */}
          <SystemHealth />

          {/* Footer */}
          <footer className="glass rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">NextGen HMI v2.0</p>
                <p className="text-xs text-muted-foreground">Industrial Control System</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>Last sync: Just now</span>
              <span>•</span>
              <span>Connection: Secure</span>
              <span>•</span>
              <span>Latency: 12ms</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
