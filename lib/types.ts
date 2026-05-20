// Shared TypeScript types for NextGen HMI Dashboard

export type AlarmSeverity = "critical" | "high" | "medium" | "low"
export type MachineStatusType = "running" | "idle" | "maintenance" | "error"
export type SystemStatusType = "online" | "warning" | "offline"
export type SensorStatus = "healthy" | "warning" | "critical"
export type TrendDirection = "up" | "down" | "stable"
export type UserRole = "operator" | "engineer" | "admin"

export interface Alarm {
  id: string
  type: AlarmSeverity
  priority: 1 | 2 | 3 | 4  // ISA-18.2 priority levels (1 = critical, 2 = high, 3 = medium, 4 = low)
  title: string
  location: string
  tag: string          // PLC tag identifier e.g. "TI-301"
  value?: number        // Current sensor value
  setpoint?: number     // Threshold that was exceeded
  unit?: string         // Engineering unit e.g. "°C", "PSI"
  time: string          // Relative time string
  timestamp: Date      // Actual timestamp for sorting
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: Date
}

export interface Machine {
  id: string
  name: string
  status: MachineStatusType
  metrics: {
    speed: number       // 0–100%
    temperature: number // °C
    efficiency: number  // 0–100%
  }
}

export interface SystemNode {
  id: string
  name: string
  status: SystemStatusType
  uptime: string
  load: number          // 0–100%
  iconName: string      // String representation of icons for easy serialization
}

export interface SensorReading {
  id: string
  title: string
  value: string
  unit: string
  status: SensorStatus
  trend: TrendDirection
  trendValue: string
  sparkline: number[]
  min: number
  max: number
  // Editable limits for alarm generation
  highAlarm: number
  highWarning: number
  lowWarning: number
  lowAlarm: number
}

export interface AIRecommendation {
  id: string
  type: "optimization" | "maintenance" | "efficiency" | "alert"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  savings?: string
  confidence: number // percentage e.g., 94
  affectedSystem: string
  mitigationAction?: string // Action name operator can execute
}

export interface Incident {
  id: string
  title: string
  severity: "critical" | "high" | "medium"
  status: "active" | "mitigating" | "resolved"
  startTime: Date
  endTime?: Date
  affectedSystem: string
  alarmsCount: number
  acknowledged: boolean
  acknowledgedBy?: string
}

export interface ActivityEvent {
  id: string
  type: "start" | "stop" | "change" | "alert" | "maintenance"
  message: string
  timestamp: string
  user?: string
}

export const rolePermissions: Record<UserRole, {
  canAcknowledgeAlarms: boolean
  canResolveAlarms: boolean
  canModifySetpoints: boolean
  canViewAnalytics: boolean
  canManageUsers: boolean
  canControlMachines: boolean
}> = {
  operator:   { canAcknowledgeAlarms: true,  canResolveAlarms: false, canModifySetpoints: false, canViewAnalytics: true,  canManageUsers: false, canControlMachines: false },
  engineer:   { canAcknowledgeAlarms: true,  canResolveAlarms: true,  canModifySetpoints: true,  canViewAnalytics: true,  canManageUsers: false, canControlMachines: true  },
  admin:      { canAcknowledgeAlarms: true,  canResolveAlarms: true,  canModifySetpoints: true,  canViewAnalytics: true,  canManageUsers: true,  canControlMachines: true  },
}

