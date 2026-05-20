"use client"

import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
  Cpu,
  Shield,
  BarChart3,
  Bot,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"
import { rolePermissions } from "@/lib/types"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeItem: string
  onItemClick: (item: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "monitoring", label: "Process Mimic", icon: Activity },
  { id: "sensors", label: "PLC Registers", icon: Gauge },
  { id: "analytics", label: "Trend Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Diagnostic", icon: Bot },
]

export function Sidebar({ collapsed, onToggle, activeItem, onItemClick }: SidebarProps) {
  const { alarms, role, systemNodes } = useHmi()
  const activeAlarmsCount = alarms.filter((a) => !a.acknowledged).length

  // Check feature permission locks
  const hasPermission = (itemId: string) => {
    if (itemId === "analytics") return true // allowed to view
    if (itemId === "ai" && role === "operator") return false // locked
    if (itemId === "security" && role !== "admin") return false // locked
    return true
  }

  const systemItems = [
    { id: "alarms", label: "Active Alarms", icon: Bell, badge: activeAlarmsCount > 0 ? activeAlarmsCount : undefined },
    { id: "security", label: "Node Control", icon: Shield, locked: role !== "admin" },
    { id: "settings", label: "System Config", icon: Settings },
  ]

  // Get Main PLC load dynamically
  const plcNode = systemNodes.find((n) => n.id === "node-1")
  const plcLoad = plcNode ? plcNode.load : 42

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-card flex flex-col z-50 border-r border-border/50"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-blue"
        >
          <Factory className="w-6 h-6 text-primary" />
        </motion.div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-bold text-lg text-foreground tracking-wide font-mono">ABB SCADA</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider font-mono">NEXTGEN HMI v2.0</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          {!collapsed && (
            <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider font-mono">
              Main mimics
            </span>
          )}
        </div>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const allowed = hasPermission(item.id)
            return (
              <li key={item.id}>
                <button
                  disabled={!allowed && !collapsed} // allow clicking if collapsed to show lock banner
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                    activeItem === item.id
                      ? "bg-primary/20 text-primary glow-blue"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    !allowed && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  )}
                  {!allowed && !collapsed && (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="px-3 mt-6 mb-2">
          {!collapsed && (
            <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider font-mono">
              Control Registers
            </span>
          )}
        </div>
        <ul className="space-y-1 px-2">
          {systemItems.map((item) => {
            const locked = item.locked
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                    activeItem === item.id
                      ? "bg-primary/20 text-primary glow-blue"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    locked && "opacity-50 hover:bg-transparent hover:text-muted-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                  )}
                  {item.badge !== undefined && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center badge-blink">
                      {item.badge}
                    </span>
                  )}
                  {locked && !collapsed && (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* PLC Load telemetry */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50">
          <div className="glass rounded-lg p-3 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-cyan" />
              <span className="text-xs font-medium text-muted-foreground font-mono">Main PLC Load</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${plcLoad}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  plcLoad > 80 ? "bg-red-500" : plcLoad > 55 ? "bg-yellow-500" : "bg-gradient-to-r from-primary to-cyan"
                )}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
              <span>AC800M</span>
              <span className={cn(plcLoad > 80 && "text-red-500 font-bold")}>{plcLoad}% cpu</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors shadow-lg z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  )
}

