"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bell,
  Search,
  User,
  Settings,
  ChevronDown,
  Wifi,
  WifiOff,
  Shield,
  AlertTriangle,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TopNavbarProps {
  onMobileMenuToggle: () => void
}

export function TopNavbar({ onMobileMenuToggle }: TopNavbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(true)
  const [notifications, setNotifications] = useState(5)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <header className="h-16 glass-card border-b border-border/50 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 w-64 lg:w-80">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search systems, sensors, alarms..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center Section - Status */}
      <div className="hidden lg:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isOnline ? "System Online" : "System Offline"}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Secure</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-cyan" />
          ) : (
            <WifiOff className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm text-muted-foreground">Connected</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Time Display */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-mono text-primary">{formatTime(currentTime)}</p>
          <p className="text-xs text-muted-foreground">{formatDate(currentTime)}</p>
        </div>

        <div className="h-8 w-px bg-border hidden md:block" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
              >
                {notifications}
              </motion.span>
            )}
          </button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-80 glass-card rounded-lg shadow-xl z-50"
            >
              <div className="p-3 border-b border-border/50">
                <h3 className="font-semibold text-foreground">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <NotificationItem
                  type="critical"
                  title="High Temperature Alert"
                  message="Reactor Unit 3 temperature exceeds threshold"
                  time="2 min ago"
                />
                <NotificationItem
                  type="warning"
                  title="Pressure Warning"
                  message="Valve B2 pressure approaching limit"
                  time="5 min ago"
                />
                <NotificationItem
                  type="info"
                  title="System Update"
                  message="Firmware update available for PLCs"
                  time="15 min ago"
                />
              </div>
              <div className="p-3 border-t border-border/50">
                <button className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors">
                  View all notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">Operator</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
        </button>
      </div>
    </header>
  )
}

function NotificationItem({
  type,
  title,
  message,
  time,
}: {
  type: "critical" | "warning" | "info"
  title: string
  message: string
  time: string
}) {
  const iconMap = {
    critical: <AlertTriangle className="w-4 h-4 text-destructive" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    info: <Bell className="w-4 h-4 text-primary" />,
  }

  const bgMap = {
    critical: "bg-destructive/10",
    warning: "bg-yellow-500/10",
    info: "bg-primary/10",
  }

  return (
    <div className="p-3 hover:bg-secondary/50 transition-colors cursor-pointer border-b border-border/30 last:border-0">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", bgMap[type])}>{iconMap[type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{message}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}
