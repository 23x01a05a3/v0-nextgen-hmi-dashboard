"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Thermometer,
  Zap,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Factory,
  Cpu,
  Network,
  Shield,
  BarChart3,
  Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeItem: string
  onItemClick: (item: string) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "sensors", label: "Sensors", icon: Gauge },
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "power", label: "Power Grid", icon: Zap },
  { id: "network", label: "Network", icon: Network },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai", label: "AI Insights", icon: Bot },
]

const systemItems = [
  { id: "alarms", label: "Alarms", icon: Bell, badge: 3 },
  { id: "security", label: "Security", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({ collapsed, onToggle, activeItem, onItemClick }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen glass-card flex flex-col z-50"
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
            <h1 className="font-bold text-lg text-foreground">NextGen</h1>
            <p className="text-xs text-muted-foreground">HMI Control</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-3 mb-2">
          {!collapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Main Menu
            </span>
          )}
        </div>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  activeItem === item.id
                    ? "bg-primary/20 text-primary glow-blue"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="px-3 mt-6 mb-2">
          {!collapsed && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              System
            </span>
          )}
        </div>
        <ul className="space-y-1 px-2">
          {systemItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                  activeItem === item.id
                    ? "bg-primary/20 text-primary glow-blue"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {item.badge && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* System Status */}
      {!collapsed && (
        <div className="p-4 border-t border-border/50">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-cyan" />
              <span className="text-xs text-muted-foreground">System Load</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "67%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary to-cyan rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">67% capacity</p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
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
