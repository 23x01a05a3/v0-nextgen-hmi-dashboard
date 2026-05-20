"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Check,
  Power,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useHmi } from "@/lib/hmi-context"
import { UserRole, AlarmSeverity } from "@/lib/types"

interface TopNavbarProps {
  onMobileMenuToggle: () => void
}

export function TopNavbar({ onMobileMenuToggle }: TopNavbarProps) {
  const {
    role,
    user,
    switchRole,
    notifications,
    unreadNotificationsCount,
    markAllNotificationsRead,
    clearNotifications,
    systemHealth,
  } = useHmi()

  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdowns on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
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

  const getSystemStatusHeader = () => {
    if (systemHealth >= 90) return "Operational"
    if (systemHealth >= 70) return "Warning"
    return "Emergency Grid"
  }

  const getHealthDotColor = () => {
    if (systemHealth >= 90) return "bg-green-500"
    if (systemHealth >= 70) return "bg-yellow-500 animate-pulse"
    return "bg-red-500 badge-blink"
  }

  return (
    <header className="h-16 glass-card border-b border-border/50 flex items-center justify-between px-4 lg:px-6 relative">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 w-64 lg:w-80 border border-border/30">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search systems, sensors, alarms..."
            className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
            aria-label="Search"
          />
          <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Mobile search icon only */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Center Section - System Status Header */}
      <div className="hidden sm:flex items-center gap-3 glass px-3 py-1.5 rounded-lg border border-border/20 text-xs">
        <span className={cn("w-2 h-2 rounded-full", getHealthDotColor())} />
        <span className="text-muted-foreground font-mono">
          System: <span className="text-foreground font-bold">{getSystemStatusHeader()}</span> ({systemHealth}%)
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Network Online/Heartbeat Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/30 border border-border/20">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-muted-foreground">
            {isOnline ? "PLCs Link secure" : "PLC Offline"}
          </span>
        </div>

        {/* Clock */}
        <div className="text-right mr-2 hidden md:block">
          <p className="text-sm font-mono text-primary font-bold">
            {currentTime ? formatTime(currentTime) : "--:--:--"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase font-mono">
            {currentTime ? formatDate(currentTime) : "--- --- --, ----"}
          </p>
        </div>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfileMenu(false)
            }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors relative"
            aria-label={`Notifications (${unreadNotificationsCount} unread)`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadNotificationsCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center badge-blink"
              >
                {unreadNotificationsCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-0 top-12 w-80 glass-card rounded-xl shadow-2xl z-50 overflow-hidden border border-primary/20"
              >
                <div className="p-3 border-b border-border/50 flex items-center justify-between bg-secondary/20">
                  <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">SCADA Alarm Log</h3>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-mono"
                  >
                    Ack All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No system events logged.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        type={n.type}
                        title={n.title}
                        message={n.message}
                        time={n.time}
                        read={n.read}
                      />
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 border-t border-border/50 bg-secondary/10 flex justify-between">
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-red-400 hover:text-red-500 transition-colors font-mono uppercase"
                    >
                      Clear All
                    </button>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Showing last 50 events
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile / Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-primary-foreground font-bold text-xs uppercase font-mono shadow-inner border border-primary/40">
              {role.substring(0, 2)}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none font-mono">{user.name}</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none font-mono mt-1 tracking-wider">
                {role} REGISTERED
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden lg:block" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 glass-card rounded-xl shadow-2xl z-50 overflow-hidden border border-primary/20 p-2 space-y-1"
              >
                <div className="p-2 border-b border-border/40 mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">Switch SCADA Session</p>
                </div>
                
                {(["operator", "engineer", "admin"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r)
                      setShowProfileMenu(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left font-mono capitalize",
                      role === r
                        ? "bg-primary/20 text-primary glow-blue"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="flex-1 capitalize">{r} Mode</span>
                    {role === r && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}

                <div className="border-t border-border/40 my-1 pt-1">
                  <div className="p-1 px-2 flex justify-between text-[9px] text-muted-foreground font-mono uppercase">
                    <span>Clearance level</span>
                    <span className="font-bold text-foreground">
                      {role === "admin" ? "Level 3" : role === "engineer" ? "Level 2" : "Level 1"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({
  type,
  title,
  message,
  time,
  read,
}: {
  type: AlarmSeverity
  title: string
  message: string
  time: string
  read: boolean
}) {
  const iconMap = {
    critical: <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />,
    high: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    medium: <Bell className="w-4 h-4 text-cyan" />,
    low: <Bell className="w-4 h-4 text-blue-500" />,
  }

  const bgMap = {
    critical: "bg-red-500/10 border-l-red-500",
    high: "bg-yellow-500/10 border-l-yellow-500",
    medium: "bg-cyan-500/10 border-l-cyan-500",
    low: "bg-blue-500/10 border-l-blue-500",
  }

  return (
    <div
      className={cn(
        "p-3 hover:bg-secondary/50 transition-colors cursor-pointer border-l-2 border-b border-border/30 last:border-b-0",
        bgMap[type],
        read && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg flex-shrink-0 bg-background/50 border border-border/20">{iconMap[type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground font-mono leading-tight">{title}</p>
            {!read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono leading-relaxed mt-0.5">{message}</p>
          <p className="text-[9px] text-muted-foreground/60 font-mono mt-1">{time}</p>
        </div>
      </div>
    </div>
  )
}

